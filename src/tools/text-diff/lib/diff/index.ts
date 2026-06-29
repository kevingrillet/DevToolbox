/**
 * API publique du diff : trois algorithmes (caractère / mot / ligne) bâtis sur le
 * même cœur LCS, plus un dispatcher `computeDiff`. Tous renvoient un `DiffOp[]`.
 */
import { diffTokens, makeKey } from './lcs';
import { charTokens, wordTokens, lineTokens } from './tokenize';
import type { DiffOp, DiffOptions, Granularity } from './types';

export type { DiffOp, DiffOptions, DiffOpType, Granularity } from './types';

export function charDiff(a: string, b: string, options: DiffOptions): DiffOp[] {
  return diffTokens(charTokens(a), charTokens(b), makeKey(options));
}

export function wordDiff(a: string, b: string, options: DiffOptions): DiffOp[] {
  return diffTokens(wordTokens(a), wordTokens(b), makeKey(options));
}

export function lineDiff(a: string, b: string, options: DiffOptions): DiffOp[] {
  return diffTokens(lineTokens(a), lineTokens(b), makeKey(options));
}

export function computeDiff(
  a: string,
  b: string,
  granularity: Granularity,
  options: DiffOptions,
): DiffOp[] {
  switch (granularity) {
    case 'char':
      return charDiff(a, b, options);
    case 'word':
      return wordDiff(a, b, options);
    case 'line':
      return lineDiff(a, b, options);
  }
}
