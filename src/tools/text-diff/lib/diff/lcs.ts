/**
 * Cœur du diff : plus longue sous-séquence commune (LCS) sur deux listes de
 * tokens, puis remontée pour produire des `DiffOp`. Le paramètre `key` mappe un
 * token vers sa clé de comparaison — c'est lui qui implémente « ignorer la casse »
 * et « ignorer les espaces » sans altérer le texte affiché (les `value` restent
 * les tokens d'origine).
 */
import type { DiffOp, DiffOptions } from './types';

/**
 * Plafond du nombre de cellules de la matrice DP (`n × m`). Au-delà, l'allocation
 * O(n·m) ferait gonfler la mémoire de façon prohibitive (ex. un diff caractère de
 * deux fichiers de ~50 k caractères = 2,5 milliards de cellules). On lève alors
 * `DiffTooLargeError`, que l'appelant traduit en message plutôt qu'en plantage.
 */
const MAX_MATRIX_CELLS = 4_000_000;

export class DiffTooLargeError extends Error {
  constructor() {
    super('diff: entrée trop volumineuse pour la comparaison');
    this.name = 'DiffTooLargeError';
  }
}

/** Construit la fonction de clé de comparaison à partir des options. */
export function makeKey(options: DiffOptions): (token: string) => string {
  return (token) => {
    let key = token;
    if (options.ignoreWhitespace) key = key.replace(/\s+/g, '');
    if (options.ignoreCase) key = key.toLowerCase();
    return key;
  };
}

/** Fusionne les opérations adjacentes de même type (spans propres). */
export function mergeOps(ops: DiffOp[]): DiffOp[] {
  const out: DiffOp[] = [];
  for (const op of ops) {
    const last = out[out.length - 1];
    if (last && last.type === op.type) last.value += op.value;
    else out.push({ ...op });
  }
  return out;
}

/** Diff générique de deux listes de tokens (clé de comparaison injectable). */
export function diffTokens(a: string[], b: string[], key: (token: string) => string): DiffOp[] {
  const n = a.length;
  const m = b.length;
  if (n * m > MAX_MATRIX_CELLS) throw new DiffTooLargeError();
  const ak = a.map(key);
  const bk = b.map(key);

  // dp[i][j] = longueur de la LCS de a[i..] et b[j..].
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ak[i] === bk[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const raw: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (ak[i] === bk[j]) {
      raw.push({ type: 'equal', value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ type: 'delete', value: a[i] });
      i++;
    } else {
      raw.push({ type: 'insert', value: b[j] });
      j++;
    }
  }
  while (i < n) raw.push({ type: 'delete', value: a[i++] });
  while (j < m) raw.push({ type: 'insert', value: b[j++] });

  return mergeOps(raw);
}
