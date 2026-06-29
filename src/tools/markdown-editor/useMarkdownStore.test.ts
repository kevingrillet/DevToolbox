import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMarkdownStore } from './useMarkdownStore';

describe('useMarkdownStore', () => {
  it('rend le Markdown en HTML après debounce', async () => {
    const { result } = renderHook(() => useMarkdownStore());
    act(() => result.current.setInput('# Titre'));
    await waitFor(() => expect(result.current.html).toContain('<h1'));
    expect(result.current.html).toContain('Titre');
  });

  it('expose un document HTML autonome', async () => {
    const { result } = renderHook(() => useMarkdownStore('fr'));
    act(() => result.current.setInput('**gras**'));
    await waitFor(() => expect(result.current.html).toContain('<strong'));
    expect(result.current.htmlDocument).toContain('<!doctype html');
    expect(result.current.htmlDocument).toContain('lang="fr"');
  });

  it('reset vide l’entrée', async () => {
    const { result } = renderHook(() => useMarkdownStore());
    act(() => result.current.setInput('texte'));
    act(() => result.current.reset());
    expect(result.current.input).toBe('');
    await waitFor(() => expect(result.current.html).toBe(''));
  });
});
