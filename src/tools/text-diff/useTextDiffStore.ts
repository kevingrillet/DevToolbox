/**
 * Store du comparateur de texte (pattern Command/Query).
 *
 * État : les deux textes, la granularité, les options (casse/espaces, tri des
 * lignes) et la vue. Option « trier les lignes » : chaque texte est trié
 * alphabétiquement *avant* le diff (utile pour comparer deux listes sans tenir
 * compte de l'ordre). Les textes peuvent être conservés en cache (toggle).
 */
import { useCallback, useMemo, useState } from 'react';
import { computeDiff, type DiffOp, type Granularity } from './lib/diff';
import { DiffTooLargeError } from './lib/diff/lcs';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { readTextFile } from '../../lib/readTextFile';

export type DiffView = 'split' | 'unified';

function sortTextLines(text: string): string {
  return text
    .split('\n')
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

export interface TextDiffStore {
  left: string;
  right: string;
  granularity: Granularity;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  sortLines: boolean;
  view: DiffView;
  cacheEnabled: boolean;
  ops: DiffOp[];
  tooLarge: boolean;
  insertions: number;
  deletions: number;
  identical: boolean;
  setLeft: (text: string) => void;
  setRight: (text: string) => void;
  setLeftFile: (file: File) => void;
  setRightFile: (file: File) => void;
  setGranularity: (granularity: Granularity) => void;
  setIgnoreCase: (value: boolean) => void;
  setIgnoreWhitespace: (value: boolean) => void;
  setSortLines: (value: boolean) => void;
  setView: (view: DiffView) => void;
  setCacheEnabled: (value: boolean) => void;
  swap: () => void;
  reset: () => void;
}

export function useTextDiffStore(): TextDiffStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:text-diff:cache');
  const [left, setLeft] = useCachedState('devtools:text-diff:left', cacheEnabled);
  const [right, setRight] = useCachedState('devtools:text-diff:right', cacheEnabled);
  const [granularity, setGranularity] = useState<Granularity>('word');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [sortLines, setSortLines] = useState(false);
  const [view, setView] = useState<DiffView>('unified');

  // Le diff (O(n·m)) ne se recalcule que sur les textes stabilisés : la frappe
  // reste fluide. Au-delà du plafond mémoire, on signale `tooLarge` au lieu de
  // planter (cf. DiffTooLargeError).
  const debouncedLeft = useDebouncedValue(left);
  const debouncedRight = useDebouncedValue(right);

  const { ops, tooLarge } = useMemo(() => {
    const a = sortLines ? sortTextLines(debouncedLeft) : debouncedLeft;
    const b = sortLines ? sortTextLines(debouncedRight) : debouncedRight;
    try {
      return {
        ops: computeDiff(a, b, granularity, { ignoreCase, ignoreWhitespace }),
        tooLarge: false,
      };
    } catch (error) {
      if (error instanceof DiffTooLargeError) return { ops: [] as DiffOp[], tooLarge: true };
      throw error;
    }
  }, [debouncedLeft, debouncedRight, granularity, ignoreCase, ignoreWhitespace, sortLines]);

  const insertions = ops.filter((op) => op.type === 'insert').length;
  const deletions = ops.filter((op) => op.type === 'delete').length;
  const identical = !tooLarge && insertions === 0 && deletions === 0;

  const setLeftFile = useCallback(
    (file: File) => {
      readTextFile(file, setLeft);
    },
    [setLeft],
  );
  const setRightFile = useCallback(
    (file: File) => {
      readTextFile(file, setRight);
    },
    [setRight],
  );

  const swap = useCallback(() => {
    setLeft(right);
    setRight(left);
  }, [left, right, setLeft, setRight]);

  const reset = useCallback(() => {
    setLeft('');
    setRight('');
    setGranularity('word');
    setIgnoreCase(false);
    setIgnoreWhitespace(false);
    setSortLines(false);
    setView('unified');
  }, [setLeft, setRight]);

  return {
    left,
    right,
    granularity,
    ignoreCase,
    ignoreWhitespace,
    sortLines,
    view,
    cacheEnabled,
    ops,
    tooLarge,
    insertions,
    deletions,
    identical,
    setLeft,
    setRight,
    setLeftFile,
    setRightFile,
    setGranularity,
    setIgnoreCase,
    setIgnoreWhitespace,
    setSortLines,
    setView,
    setCacheEnabled,
    swap,
    reset,
  };
}
