import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useJsonLinterStore } from './useJsonLinterStore';

const JSON_SRC = '{"a":1,"b":[2,3],"c":{"d":"x"}}';

describe('useJsonLinterStore', () => {
  it('parse un JSON valide et construit l’arbre', async () => {
    const { result } = renderHook(() => useJsonLinterStore());
    act(() => result.current.setInput(JSON_SRC));
    await waitFor(() => expect(result.current.valid).toBe(true));
    expect(result.current.tree).not.toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('signale une erreur sur un JSON invalide', async () => {
    const { result } = renderHook(() => useJsonLinterStore());
    act(() => result.current.setInput('{ invalide'));
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.valid).toBe(false);
  });

  it('cherche des correspondances et navigue entre elles', async () => {
    const { result } = renderHook(() => useJsonLinterStore());
    act(() => result.current.setInput(JSON_SRC));
    await waitFor(() => expect(result.current.valid).toBe(true));
    act(() => result.current.setQuery('$.b'));
    await waitFor(() => expect(result.current.matches.length).toBeGreaterThan(0));
    act(() => result.current.nextMatch());
    act(() => result.current.prevMatch());
    expect(result.current.matchPosition).toBeGreaterThanOrEqual(0);
  });

  it('déplie/replie et sélectionne des nœuds', async () => {
    const { result } = renderHook(() => useJsonLinterStore());
    act(() => result.current.setInput(JSON_SRC));
    await waitFor(() => expect(result.current.valid).toBe(true));
    act(() => result.current.expandAll());
    expect(result.current.isOpen('$')).toBe(true);
    act(() => result.current.collapseAll());
    act(() => result.current.toggleNode('$'));
    expect(result.current.isOpen('$')).toBe(true);
    act(() => result.current.selectNode('$.a'));
    expect(result.current.selected).toBe('$.a');
    expect(result.current.selectedJson.length).toBeGreaterThan(0);
  });

  it('formate puis minifie l’entrée courante', async () => {
    const { result } = renderHook(() => useJsonLinterStore());
    act(() => result.current.setInput(JSON_SRC));
    await waitFor(() => expect(result.current.valid).toBe(true));
    act(() => result.current.format());
    expect(result.current.input).toContain('\n');
    act(() => result.current.minify());
    expect(result.current.input).not.toContain('\n');
    act(() => result.current.reset());
    expect(result.current.input).toBe('');
  });
});
