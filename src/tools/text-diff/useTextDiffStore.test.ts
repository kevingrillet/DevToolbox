import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTextDiffStore } from './useTextDiffStore';

describe('useTextDiffStore', () => {
  it('calcule des insertions/suppressions après debounce', async () => {
    const { result } = renderHook(() => useTextDiffStore());
    act(() => {
      result.current.setLeft('hello world');
      result.current.setRight('hello brave world');
    });
    await waitFor(() => expect(result.current.ops.length).toBeGreaterThan(0));
    expect(result.current.insertions).toBeGreaterThan(0);
    expect(result.current.identical).toBe(false);
  });

  it('détecte deux textes identiques', async () => {
    const { result } = renderHook(() => useTextDiffStore());
    act(() => {
      result.current.setLeft('même');
      result.current.setRight('même');
    });
    await waitFor(() => expect(result.current.identical).toBe(true));
    expect(result.current.insertions).toBe(0);
    expect(result.current.deletions).toBe(0);
  });

  it('swap échange les deux côtés', async () => {
    const { result } = renderHook(() => useTextDiffStore());
    act(() => {
      result.current.setLeft('A');
      result.current.setRight('B');
    });
    await waitFor(() => expect(result.current.ops.length).toBeGreaterThan(0));
    act(() => result.current.swap());
    expect(result.current.left).toBe('B');
    expect(result.current.right).toBe('A');
  });

  it('démarre en granularité « line » par défaut', () => {
    const { result } = renderHook(() => useTextDiffStore());
    expect(result.current.granularity).toBe('line');
  });

  it('applique les options (granularité, casse) puis reset', async () => {
    const { result } = renderHook(() => useTextDiffStore());
    act(() => {
      result.current.setGranularity('word');
      result.current.setIgnoreCase(true);
      result.current.setIgnoreWhitespace(true);
      result.current.setView('split');
    });
    expect(result.current.granularity).toBe('word');
    expect(result.current.view).toBe('split');
    act(() => result.current.reset());
    expect(result.current.left).toBe('');
    expect(result.current.granularity).toBe('line');
    expect(result.current.view).toBe('unified');
  });

  it('sortLines() trie en place les lignes des deux textes source', async () => {
    const { result } = renderHook(() => useTextDiffStore());
    act(() => {
      result.current.setLeft('b\na\nc');
      result.current.setRight('c\na\nb');
    });
    act(() => result.current.sortLines());
    // C'est bien le texte source qui est trié (les value des textareas changent).
    expect(result.current.left).toBe('a\nb\nc');
    expect(result.current.right).toBe('a\nb\nc');
    await waitFor(() => expect(result.current.identical).toBe(true));
  });
});
