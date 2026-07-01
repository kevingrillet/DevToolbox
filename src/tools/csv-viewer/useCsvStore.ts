/**
 * Store du visualiseur CSV (pattern Command/Query).
 *
 * Queries dérivées : table (en-tête + lignes normalisées) et lignes triées. Le
 * texte d'entrée peut être conservé en cache (toggle persistant). Le tri et le
 * délimiteur restent en mémoire de session uniquement.
 */
import { useMemo, useState } from 'react';
import { detectDelimiter, toTable, toCsv, type CsvTable } from './lib/csv';
import { sortRows, type SortDir } from './lib/sort';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { readTextFile } from '../../lib/readTextFile';

export type DelimiterChoice = 'auto' | 'comma' | 'semicolon' | 'tab';

const DELIMITER_CHAR: Record<Exclude<DelimiterChoice, 'auto'>, string> = {
  comma: ',',
  semicolon: ';',
  tab: '\t',
};

export interface CsvStore {
  input: string;
  delimiterChoice: DelimiterChoice;
  hasHeader: boolean;
  sortColumn: number | null;
  sortDir: SortDir;
  cacheEnabled: boolean;
  table: CsvTable;
  sortedRows: string[][];
  /** CSV sérialisé de la grille telle qu'affichée (triée), prêt à exporter. */
  csvOutput: string;
  setInput: (text: string) => void;
  setInputFile: (file: File) => void;
  setDelimiterChoice: (choice: DelimiterChoice) => void;
  setHasHeader: (value: boolean) => void;
  toggleSort: (column: number) => void;
  setCacheEnabled: (value: boolean) => void;
  reset: () => void;
}

export function useCsvStore(): CsvStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:csv:cache');
  const [input, setInput] = useCachedState('devtools:csv:input', cacheEnabled);
  const [delimiterChoice, setDelimiterChoice] = useState<DelimiterChoice>('auto');
  const [hasHeader, setHasHeader] = useState(true);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Le parsing ne suit que la saisie stabilisée (la frappe reste fluide).
  const debouncedInput = useDebouncedValue(input);
  const delimiter =
    delimiterChoice === 'auto' ? detectDelimiter(debouncedInput) : DELIMITER_CHAR[delimiterChoice];

  const table = useMemo(
    () => toTable(debouncedInput, delimiter, hasHeader),
    [debouncedInput, delimiter, hasHeader],
  );

  const sortedRows = useMemo(
    () => (sortColumn === null ? table.rows : sortRows(table.rows, sortColumn, sortDir)),
    [table, sortColumn, sortDir],
  );

  // Export = la grille telle qu'affichée (lignes triées), avec le délimiteur
  // courant. On n'écrit l'en-tête que s'il est réel (hasHeader).
  const csvOutput = useMemo(
    () => toCsv(table.headers, sortedRows, delimiter, hasHeader),
    [table.headers, sortedRows, delimiter, hasHeader],
  );

  function setInputFile(file: File) {
    readTextFile(file, setInput);
  }

  function toggleSort(column: number) {
    if (sortColumn === column) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  }

  function reset() {
    setInput('');
    setSortColumn(null);
    setSortDir('asc');
  }

  return {
    input,
    delimiterChoice,
    hasHeader,
    sortColumn,
    sortDir,
    cacheEnabled,
    table,
    sortedRows,
    csvOutput,
    setInput,
    setInputFile,
    setDelimiterChoice,
    setHasHeader,
    toggleSort,
    setCacheEnabled,
    reset,
  };
}
