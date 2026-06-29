/**
 * Évaluateur d'un sous-ensemble de JSONPath : `$`, `.clé`, `[index]`,
 * `['clé']` / `["clé"]`. Pas de wildcard ni de filtre (v1). Renvoie le chemin
 * normalisé du nœud atteint (réutilisable comme identifiant d'arbre), ou null.
 */
import { childPath } from './tree';
import type { JsonValue } from './parse';

type Segment = { kind: 'key'; key: string } | { kind: 'index'; index: number };

const IDENT = /^[A-Za-z_$][\w$]*/;
const INDEX = /^\[(\d+)\]/;

/**
 * Lit une chaîne entre guillemets à partir de `s[0]` (le guillemet ouvrant), en
 * respectant les échappements — symétrique de `childPath`, qui produit des
 * `["…"]` via `JSON.stringify` pour les clés exotiques. Renvoie la valeur décodée
 * et le nombre de caractères consommés (guillemets inclus), ou `null` si la chaîne
 * n'est pas terminée / mal formée.
 */
function readQuoted(s: string, quote: '"' | "'"): { value: string; length: number } | null {
  let raw = '';
  let i = 1;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') {
      raw += s[i] + (s[i + 1] ?? '');
      i += 2;
      continue;
    }
    if (ch === quote) {
      if (quote === '"') {
        try {
          return { value: JSON.parse(`"${raw}"`) as string, length: i + 1 };
        } catch {
          return null;
        }
      }
      // Apostrophes : on ne déspécialise que `\'` et `\\` (JSON ignore `'`).
      return { value: raw.replace(/\\(['\\])/g, '$1'), length: i + 1 };
    }
    raw += ch;
    i++;
  }
  return null;
}

function parsePath(query: string): Segment[] | null {
  let rest = query.trim();
  if (!rest.startsWith('$')) return null;
  rest = rest.slice(1);
  const segments: Segment[] = [];
  while (rest.length > 0) {
    if (rest[0] === '.') {
      const m = IDENT.exec(rest.slice(1));
      if (!m) return null;
      segments.push({ kind: 'key', key: m[0] });
      rest = rest.slice(1 + m[0].length);
      continue;
    }
    if (rest[0] === '[') {
      const idx = INDEX.exec(rest);
      if (idx) {
        segments.push({ kind: 'index', index: Number(idx[1]) });
        rest = rest.slice(idx[0].length);
        continue;
      }
      const quote = rest[1];
      if (quote === '"' || quote === "'") {
        const read = readQuoted(rest.slice(1), quote);
        if (!read) return null;
        const after = rest.slice(1 + read.length);
        if (after[0] !== ']') return null;
        segments.push({ kind: 'key', key: read.value });
        rest = after.slice(1);
        continue;
      }
    }
    return null;
  }
  return segments;
}

export function evalJsonPath(root: JsonValue, query: string): string | null {
  const segments = parsePath(query);
  if (!segments) return null;

  let value: JsonValue = root;
  let path = '$';
  for (const segment of segments) {
    if (segment.kind === 'key') {
      if (
        value === null ||
        typeof value !== 'object' ||
        Array.isArray(value) ||
        !(segment.key in value)
      ) {
        return null;
      }
      value = (value as { [k: string]: JsonValue })[segment.key];
      path = childPath(path, segment.key);
    } else {
      if (!Array.isArray(value) || segment.index < 0 || segment.index >= value.length) return null;
      value = value[segment.index];
      path = childPath(path, segment.index);
    }
  }
  return path;
}
