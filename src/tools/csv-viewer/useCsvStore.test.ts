import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useCsvStore } from './useCsvStore';

const CSV = 'name,age\nAlice,30\nBob,25';

describe('useCsvStore', () => {
  it('parse le CSV (en-tête + lignes) après debounce', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setInput(CSV));
    await waitFor(() => expect(result.current.table.rows.length).toBe(2));
    expect(result.current.table.headers).toEqual(['name', 'age']);
  });

  it('trie par colonne via toggleSort', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setInput(CSV));
    await waitFor(() => expect(result.current.table.rows.length).toBe(2));
    act(() => result.current.toggleSort(1));
    expect(result.current.sortColumn).toBe(1);
    expect(result.current.sortDir).toBe('asc');
    act(() => result.current.toggleSort(1));
    expect(result.current.sortDir).toBe('desc');
    expect(result.current.sortedRows.length).toBe(2);
  });

  it('respecte un délimiteur forcé et l’option hasHeader', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setDelimiterChoice('semicolon'));
    act(() => result.current.setHasHeader(false));
    act(() => result.current.setInput('a;b;c'));
    await waitFor(() => expect(result.current.table.rows.length).toBe(1));
    expect(result.current.delimiterChoice).toBe('semicolon');
    expect(result.current.hasHeader).toBe(false);
  });

  it('csvOutput reflète la grille triée (en-tête réel inclus)', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setInput(CSV));
    await waitFor(() => expect(result.current.table.rows.length).toBe(2));
    // Tri décroissant sur l'âge (colonne 1) : Alice (30) avant Bob (25).
    act(() => result.current.toggleSort(1));
    act(() => result.current.toggleSort(1));
    expect(result.current.csvOutput).toBe('name,age\nAlice,30\nBob,25');
  });

  it('csvOutput sans en-tête synthétique quand hasHeader est faux', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setHasHeader(false));
    act(() => result.current.setInput('a,b\nc,d'));
    await waitFor(() => expect(result.current.table.rows.length).toBe(2));
    expect(result.current.csvOutput).toBe('a,b\nc,d');
  });

  it('reset vide l’entrée et le tri', async () => {
    const { result } = renderHook(() => useCsvStore());
    act(() => result.current.setInput(CSV));
    await waitFor(() => expect(result.current.table.rows.length).toBe(2));
    act(() => result.current.toggleSort(0));
    act(() => result.current.reset());
    expect(result.current.input).toBe('');
    expect(result.current.sortColumn).toBeNull();
  });
});
