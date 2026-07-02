/**
 * Parseur JSON maison (descente récursive) — il valide la syntaxe et localise
 * l'erreur (ligne / colonne), ce que `JSON.parse` ne fournit pas de façon portable.
 *
 * On ne suit que l'index pendant l'analyse ; la ligne/colonne n'est calculée qu'en
 * cas d'erreur, à partir de cet index (coût négligeable, code simple).
 */
export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface ParseError {
  message: string;
  line: number;
  column: number;
}

/**
 * Avertissement non bloquant : le document est valide mais un nombre dépasse ce
 * que le `number` JavaScript (double IEEE-754) peut représenter exactement —
 * `Number()` (et donc le reformatage/minification) en altère silencieusement la
 * valeur. On se limite au cas le plus net et indiscutable : entier hors de la
 * plage des entiers sûrs, ou littéral débordant vers l'infini.
 */
export interface ParseWarning {
  kind: 'precision';
  literal: string;
  line: number;
  column: number;
}

export type ParseResult =
  { ok: true; value: JsonValue; warnings: ParseWarning[] } | { ok: false; error: ParseError };

class JsonParseError extends Error {
  constructor(
    message: string,
    public index: number,
  ) {
    super(message);
    this.name = 'JsonParseError';
  }
}

function lineColAt(text: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(index, text.length);
  for (let k = 0; k < end; k++) {
    if (text[k] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

/**
 * Profondeur d'imbrication maximale (objets/tableaux). Le parseur est en descente
 * récursive : un document pathologique très profond (`[[[[…]]]]`) ferait déborder
 * la pile d'appels (RangeError « Maximum call stack size exceeded ») avant même
 * la fin de l'analyse. On plafonne donc explicitement pour lever une erreur
 * localisée et lisible plutôt qu'un plantage opaque. 1000 dépasse tout JSON
 * réaliste tout en restant loin de la limite de pile des moteurs JS.
 */
const MAX_DEPTH = 1000;

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

/**
 * Vrai si convertir `literal` via `Number` perd de l'information : débordement
 * vers l'infini, ou entier hors de la plage des entiers sûrs (`2^53`). On ne
 * signale pas les pertes de précision fractionnaires (rares et ambiguës) pour
 * éviter les faux positifs sur des reformatages anodins (`1.0` → `1`).
 */
function losesPrecision(literal: string, value: number): boolean {
  if (!Number.isFinite(value)) return true;
  const isInteger = !/[.eE]/.test(literal);
  return isInteger && !Number.isSafeInteger(value);
}

class Parser {
  private i = 0;
  private depth = 0;
  readonly warnings: ParseWarning[] = [];

  constructor(private readonly text: string) {}

  private peek(): string {
    return this.text[this.i] ?? '';
  }

  atEnd(): boolean {
    return this.i >= this.text.length;
  }

  private fail(message: string): never {
    throw new JsonParseError(message, this.i);
  }

  /** Garde-fou de profondeur : lève une erreur localisée au lieu d'un débordement
   *  de pile sur un document pathologiquement imbriqué. */
  private enter(): void {
    if (++this.depth > MAX_DEPTH) {
      this.fail(`Imbrication trop profonde (maximum ${MAX_DEPTH} niveaux)`);
    }
  }

  skipWs(): void {
    while (this.i < this.text.length) {
      const c = this.text[this.i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') this.i++;
      else break;
    }
  }

  /** Analyse un document JSON complet (valeur unique + rien après). */
  parse(): JsonValue {
    this.skipWs();
    if (this.atEnd()) this.fail('Document vide');
    const value = this.parseValue();
    this.skipWs();
    if (!this.atEnd()) this.fail('Contenu en trop après la valeur JSON');
    return value;
  }

  parseValue(): JsonValue {
    const c = this.peek();
    if (c === '{') return this.parseObject();
    if (c === '[') return this.parseArray();
    if (c === '"') return this.parseString();
    if (c === '-' || (c >= '0' && c <= '9')) return this.parseNumber();
    if (this.text.startsWith('true', this.i)) return this.literal('true', true);
    if (this.text.startsWith('false', this.i)) return this.literal('false', false);
    if (this.text.startsWith('null', this.i)) return this.literal('null', null);
    if (c === '') this.fail('Valeur attendue, fin de document atteinte');
    this.fail(`Caractère inattendu « ${c} »`);
  }

  private literal<T>(word: string, value: T): T {
    this.i += word.length;
    return value;
  }

  private parseNumber(): number {
    NUMBER.lastIndex = this.i;
    const m = NUMBER.exec(this.text);
    if (!m || m.index !== this.i) this.fail('Nombre invalide');
    const literal = m[0];
    const start = this.i;
    this.i += literal.length;
    const value = Number(literal);
    if (losesPrecision(literal, value)) {
      this.warnings.push({ kind: 'precision', literal, ...lineColAt(this.text, start) });
    }
    return value;
  }

  private parseString(): string {
    this.i++; // guillemet ouvrant
    let out = '';
    while (true) {
      if (this.atEnd()) this.fail('Chaîne non terminée');
      const c = this.text[this.i++];
      if (c === '"') return out;
      if (c === '\\') {
        const e = this.text[this.i++];
        if (e === '"') out += '"';
        else if (e === '\\') out += '\\';
        else if (e === '/') out += '/';
        else if (e === 'b') out += '\b';
        else if (e === 'f') out += '\f';
        else if (e === 'n') out += '\n';
        else if (e === 'r') out += '\r';
        else if (e === 't') out += '\t';
        else if (e === 'u') {
          const hex = this.text.slice(this.i, this.i + 4);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) this.fail('Échappement Unicode invalide');
          out += String.fromCharCode(parseInt(hex, 16));
          this.i += 4;
        } else {
          this.i--;
          this.fail('Échappement invalide');
        }
      } else if (c.charCodeAt(0) < 0x20) {
        this.i--;
        this.fail('Caractère de contrôle non échappé dans une chaîne');
      } else {
        out += c;
      }
    }
  }

  private parseArray(): JsonValue[] {
    this.enter();
    try {
      this.i++; // [
      const arr: JsonValue[] = [];
      this.skipWs();
      if (this.peek() === ']') {
        this.i++;
        return arr;
      }
      while (true) {
        this.skipWs();
        arr.push(this.parseValue());
        this.skipWs();
        const c = this.peek();
        if (c === ',') {
          this.i++;
          continue;
        }
        if (c === ']') {
          this.i++;
          return arr;
        }
        this.fail('« , » ou « ] » attendu');
      }
    } finally {
      this.depth--;
    }
  }

  private parseObject(): { [key: string]: JsonValue } {
    this.enter();
    try {
      return this.parseObjectBody();
    } finally {
      this.depth--;
    }
  }

  private parseObjectBody(): { [key: string]: JsonValue } {
    this.i++; // {
    const obj: { [key: string]: JsonValue } = {};
    this.skipWs();
    if (this.peek() === '}') {
      this.i++;
      return obj;
    }
    while (true) {
      this.skipWs();
      if (this.peek() !== '"') this.fail('Clé (chaîne entre guillemets) attendue');
      const key = this.parseString();
      this.skipWs();
      if (this.peek() !== ':') this.fail('« : » attendu après la clé');
      this.i++;
      this.skipWs();
      const value = this.parseValue();
      // `obj["__proto__"] = …` invoquerait le *setter* de prototype au lieu de
      // créer une propriété propre : on définit la propriété explicitement pour
      // coller au comportement de `JSON.parse` (clé propre, prototype intact).
      if (key === '__proto__') {
        Object.defineProperty(obj, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        obj[key] = value;
      }
      this.skipWs();
      const c = this.peek();
      if (c === ',') {
        this.i++;
        continue;
      }
      if (c === '}') {
        this.i++;
        return obj;
      }
      this.fail('« , » ou « } » attendu');
    }
  }
}

export function parseJson(text: string): ParseResult {
  try {
    const parser = new Parser(text);
    const value = parser.parse();
    return { ok: true, value, warnings: parser.warnings };
  } catch (error) {
    if (error instanceof JsonParseError) {
      return { ok: false, error: { message: error.message, ...lineColAt(text, error.index) } };
    }
    throw error;
  }
}
