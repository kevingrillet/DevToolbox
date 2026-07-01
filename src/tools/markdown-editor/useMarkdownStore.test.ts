import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMarkdownStore } from './useMarkdownStore';
import { exampleMarkdown } from './lib/markdown';

describe('useMarkdownStore', () => {
  it('démarre sur le Markdown d’exemple (cache désactivé)', () => {
    const { result } = renderHook(() => useMarkdownStore('fr'));
    expect(result.current.input).toBe(exampleMarkdown('fr'));
  });

  it('rend le Markdown en HTML après debounce', async () => {
    const { result } = renderHook(() => useMarkdownStore());
    act(() => result.current.setInput('# Titre'));
    await waitFor(() => expect(result.current.html).toContain('Titre'));
    expect(result.current.html).toContain('<h1');
  });

  it('expose un document HTML autonome', async () => {
    const { result } = renderHook(() => useMarkdownStore('fr'));
    act(() => result.current.setInput('**gras**'));
    await waitFor(() => expect(result.current.html).toContain('<strong'));
    expect(result.current.htmlDocument).toContain('<!doctype html');
    expect(result.current.htmlDocument).toContain('lang="fr"');
  });

  it('reset restaure le Markdown d’exemple', async () => {
    const { result } = renderHook(() => useMarkdownStore('fr'));
    act(() => result.current.setInput('texte'));
    act(() => result.current.reset());
    expect(result.current.input).toBe(exampleMarkdown('fr'));
    await waitFor(() => expect(result.current.html).toContain('<h1'));
  });
});
