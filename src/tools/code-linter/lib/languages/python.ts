import type { LanguageLinter, RawIssue, Rule, Severity } from '../types';

interface PythonLine {
  text: string;
  startsInString: boolean;
  endsInString: boolean;
}

const TRAILING_WHITESPACE = /(?<![ \t])[ \t]+$/;

function isSimpleInterpolation(line: string, start: number, quote: string): boolean {
  const end = line.indexOf(quote, start + 1);
  if (end === -1) return false;

  // Les champs avec guillemets, accolades imbriquées ou continuations exigent
  // un parseur complet pour distinguer la fermeture du littéral.
  const content = line.slice(start + 1, end);
  const outsideFields = content.replace(/\{\{|\}\}|\{[^{}'"#\\]*\}/g, '');
  return !/[{}\\]/.test(outsideFields);
}

/** Suit les chaînes entre lignes pour distinguer le code du contenu des docstrings. */
function scanStringDelimiter(line: string, delimiter: string, formatting = false): string | null {
  let index = 0;
  while (index < line.length) {
    const char = line[index];
    if (delimiter) {
      if (char === '\\') {
        if (index === line.length - 1) return delimiter;
        index += 2;
      } else if (line.startsWith(delimiter, index)) {
        index += delimiter.length;
        delimiter = '';
      } else {
        index++;
      }
    } else if (char === '#') {
      break;
    } else if (char === '"' || char === "'") {
      const tripleQuote = char.repeat(3);
      delimiter = line.startsWith(tripleQuote, index) ? tripleQuote : char;
      if (
        formatting &&
        /[ft]r?$/i.test(line.slice(Math.max(0, index - 2), index)) &&
        (delimiter.length === 3 || !isSimpleInterpolation(line, index, char))
      ) {
        return null;
      }
      index += delimiter.length;
    } else {
      index++;
    }
  }
  if (delimiter === '' || delimiter.length === 3) return delimiter;
  return formatting ? null : '';
}

function lineRule(
  id: string,
  defaultSeverity: Severity,
  findColumn: (line: PythonLine) => number | undefined,
): Rule {
  return {
    id,
    labelKey: `tools.codeLinter.rules.${id}`,
    defaultSeverity,
    check(source) {
      const issues: RawIssue[] = [];
      let delimiter = '';
      source.split(/\r\n?|\n/).forEach((text, index) => {
        const startsInString = delimiter !== '';
        delimiter = scanStringDelimiter(text, delimiter) ?? '';
        const column = findColumn({ text, startsInString, endsInString: delimiter !== '' });
        if (column !== undefined) issues.push({ ruleId: id, line: index + 1, column });
      });
      return issues;
    },
  };
}

const tabIndent = lineRule('python-tab-indent', 'warning', ({ text, startsInString }) => {
  if (startsInString || /^[ \t\f]*(?:#|$)/.test(text)) return;
  return /^[ \f]*\t/.exec(text)?.[0].length;
});

const trailingWhitespace = lineRule(
  'python-trailing-whitespace',
  'warning',
  ({ text, endsInString }) => {
    if (endsInString) return;
    const spaces = TRAILING_WHITESPACE.exec(text);
    if (spaces) return spaces.index + 1;
  },
);

const bareExcept = lineRule('python-bare-except', 'warning', ({ text, startsInString }) => {
  if (startsInString) return;
  const clause = /^([ \t\f]*)except[ \t\f]*:/.exec(text);
  if (clause) return clause[1].length + 1;
});

const lineLength = lineRule('python-line-length', 'info', ({ text }) => {
  if (/^.{80}/su.test(text)) return 80;
});

function expandIndentation(line: string): string | null {
  const indent = /^[ \t\f]+/.exec(line)?.[0];
  // Un saut de page peut réinitialiser les colonnes de l'indentation.
  if (indent?.includes('\f')) return null;
  if (!indent?.includes('\t')) return line;

  let column = 0;
  for (const char of indent) {
    // Python aligne les tabulations sur les multiples de huit colonnes.
    column += char === '\t' ? 8 - (column % 8) : 1;
  }
  return ' '.repeat(column) + line.slice(indent.length);
}

function formatPython(source: string): string {
  const parts = source.split(/(\r\n?|\n)/);
  let delimiter = '';
  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index];
    const nextDelimiter = scanStringDelimiter(line, delimiter, true);
    if (nextDelimiter === null) return source;

    let formatted = delimiter === '' ? expandIndentation(line) : line;
    if (formatted === null) return source;
    if (nextDelimiter === '') {
      const trimmed = formatted.replace(TRAILING_WHITESPACE, '');
      // Retirer ces espaces pourrait créer une continuation de ligne.
      if (!trimmed.endsWith('\\')) formatted = trimmed;
    }
    parts[index] = formatted;
    delimiter = nextDelimiter;
  }
  return delimiter === '' ? parts.join('') : source;
}

export const pythonLinter: LanguageLinter = {
  id: 'python',
  labelKey: 'tools.codeLinter.languages.python',
  rules: [tabIndent, trailingWhitespace, bareExcept, lineLength],
  format: formatPython,
};
