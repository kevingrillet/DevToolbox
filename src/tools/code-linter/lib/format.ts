/**
 * Reformateurs « maison » du linter (best-effort, pas un Prettier).
 *
 * Deux familles de réindentation **structurelle** (elles ne touchent qu'à
 * l'indentation, jamais au contenu d'une ligne — ni espaces internes, ni retours
 * à la ligne ajoutés/retirés) :
 *  - `reindentBrackets` : langages à accolades/crochets/parenthèses (JS/TS, C#,
 *    CSS, JSON), avec prise en compte des chaînes et commentaires pour ne pas
 *    compter un `{` situé dans une chaîne ou un commentaire ;
 *  - `reindentHtml` : indentation par profondeur de balises.
 *
 * Et un nettoyage **conservateur** (`cleanupGeneric` / `cleanupMarkdown`) pour les
 * langages où inférer l'indentation serait dangereux (YAML : l'indentation EST la
 * structure ; Markdown : les 2 espaces de fin = saut de ligne dur).
 *
 * Tout est volontairement prudent : à défaut de pouvoir reformater sûrement, on
 * renvoie la source inchangée plutôt que de risquer de la casser.
 */

const INDENT = '  ';
const OPENERS = new Set(['{', '[', '(']);
const CLOSERS = new Set(['}', ']', ')']);

interface BracketOptions {
  /** Préfixe de commentaire de ligne (ex. `//`). */
  lineComment?: string;
  /** Délimiteurs de commentaire de bloc, paire `[ouverture, fermeture]` (style C). */
  blockComment?: [string, string];
  /** Le langage a des littéraux gabarits (backticks JS) pouvant couvrir plusieurs lignes. */
  template?: boolean;
}

interface ScanState {
  inBlock: boolean;
  inTemplate: boolean;
  /** Délimiteur de la chaîne courante (`'` ou `"`), sinon null. */
  inString: string | null;
}

/**
 * Parcourt une ligne en suivant l'état chaînes/commentaires (mutée dans `state`)
 * et renvoie la variation nette de profondeur de brackets hors chaînes/commentaires.
 */
function scanLine(line: string, opt: BracketOptions, state: ScanState): number {
  let delta = 0;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (state.inBlock) {
      if (opt.blockComment && line.startsWith(opt.blockComment[1], i)) {
        state.inBlock = false;
        i += opt.blockComment[1].length;
        continue;
      }
      i++;
      continue;
    }
    if (state.inTemplate) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === '`') state.inTemplate = false;
      i++;
      continue;
    }
    if (state.inString) {
      if (ch === '\\') {
        i += 2;
        continue;
      }
      if (ch === state.inString) state.inString = null;
      i++;
      continue;
    }
    // Hors chaîne / commentaire.
    if (opt.blockComment && line.startsWith(opt.blockComment[0], i)) {
      state.inBlock = true;
      i += opt.blockComment[0].length;
      continue;
    }
    if (opt.lineComment && line.startsWith(opt.lineComment, i)) break; // reste = commentaire
    if (opt.template && ch === '`') {
      state.inTemplate = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      state.inString = ch;
      i++;
      continue;
    }
    if (OPENERS.has(ch)) delta++;
    else if (CLOSERS.has(ch)) delta--;
    i++;
  }
  // Les chaînes ordinaires ('/") ne franchissent pas une fin de ligne.
  state.inString = null;
  return delta;
}

/** Réindente un langage à accolades/crochets/parenthèses (indentation seule). */
export function reindentBrackets(source: string, opt: BracketOptions): string {
  if (source.trim() === '') return source;
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const state: ScanState = { inBlock: false, inTemplate: false, inString: null };
  let depth = 0;
  const out: string[] = [];

  for (const raw of lines) {
    // Ligne qui continue un commentaire de bloc ou un gabarit : on n'y touche pas
    // (son contenu, indentation comprise, peut être significatif).
    if (state.inBlock || state.inTemplate) {
      out.push(raw);
      scanLine(raw, opt, state);
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed === '') {
      out.push('');
      continue;
    }
    let lead = 0;
    for (const ch of trimmed) {
      if (CLOSERS.has(ch)) lead++;
      else break;
    }
    const lineDepth = Math.max(0, depth - lead);
    out.push(INDENT.repeat(lineDepth) + trimmed);
    depth = Math.max(0, depth + scanLine(trimmed, opt, state));
  }
  return out.join('\n');
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

/** Variation nette de profondeur de balises sur une ligne HTML. */
function htmlDelta(line: string): number {
  let delta = 0;
  const re = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const isClosing = m[1] === '/';
    const selfClosing = m[3] === '/';
    const tag = m[2].toLowerCase();
    if (isClosing) delta--;
    else if (!selfClosing && !VOID_ELEMENTS.has(tag)) delta++;
  }
  return delta;
}

/** Réindente du HTML par profondeur de balises (indentation seule). */
export function reindentHtml(source: string): string {
  if (source.trim() === '') return source;
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let depth = 0;
  const out: string[] = [];
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (trimmed === '') {
      out.push('');
      continue;
    }
    const startsWithClose = /^<\//.test(trimmed);
    const lineDepth = Math.max(0, depth - (startsWithClose ? 1 : 0));
    out.push(INDENT.repeat(lineDepth) + trimmed);
    depth = Math.max(0, depth + htmlDelta(trimmed));
  }
  return out.join('\n');
}

/** Nettoyage sûr : CRLF→LF, fins de ligne nettoyées, lignes vides multiples
 *  réduites, un seul saut de ligne final. Ne change jamais la structure. */
export function cleanupGeneric(source: string): string {
  if (source.trim() === '') return source;
  const body = source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '');
  return `${body}\n`;
}

/** Variante Markdown : préserve le saut de ligne dur (2 espaces en fin de ligne). */
export function cleanupMarkdown(source: string): string {
  if (source.trim() === '') return source;
  const body = source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const trailing = line.match(/[ \t]+$/);
      if (!trailing) return line;
      const content = line.slice(0, line.length - trailing[0].length);
      if (content === '') return '';
      // Saut de ligne dur Markdown = au moins 2 espaces (sans tabulation) → on
      // normalise à exactement 2 ; sinon on supprime les blancs de fin.
      return /^ {2,}$/.test(trailing[0]) ? `${content}  ` : content;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '');
  return `${body}\n`;
}

/** Convertit les tabulations d'indentation en espaces (YAML interdit les tabs). */
export function cleanupYaml(source: string): string {
  if (source.trim() === '') return source;
  const body = source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const indent = (line.match(/^[\t ]*/) ?? [''])[0];
      const rest = line.slice(indent.length).replace(/[ \t]+$/, '');
      return indent.replace(/\t/g, INDENT) + rest;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '');
  return `${body}\n`;
}
