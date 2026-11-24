import { act, renderHook } from '@testing-library/react';
import { expect, it } from 'vitest';
import { INPUT_LIMITS } from '../../lib/inputLimits';
import { DEFAULT_CUSTOM_PALETTE, PRISM_THEMES } from './lib/themes';
import { useSyntaxEditorStore } from './useSyntaxEditorStore';

it('applique les palettes, personnalise les couleurs et réinitialise la palette', () => {
  const { result } = renderHook(useSyntaxEditorStore);
  expect(result.current.palette).toBeUndefined();
  act(() => result.current.setTheme('okaidia'));
  expect(result.current.palette).toEqual(PRISM_THEMES.okaidia.palette);
  act(() => result.current.setTheme('custom'));
  act(() => result.current.setColor('keyword', '#001122'));
  expect(result.current.palette?.keyword).toBe('#001122');
  act(() => result.current.resetColors());
  expect(result.current.palette).toEqual(DEFAULT_CUSTOM_PALETTE);
});

it('distingue la limite de coloration de la limite d’édition', () => {
  const { result } = renderHook(useSyntaxEditorStore);
  const source = 'x'.repeat(INPUT_LIMITS.syntaxHighlight + 1);
  act(() => result.current.setSource(source));
  expect(result.current.tooLarge).toBe(true);
  expect(result.current.source).toBe(source);
  act(() => result.current.setLanguage('plain'));
  expect(result.current.tooLarge).toBe(false);
  act(() => result.current.resetSource());
  expect(result.current.source).toBe('');
});

it('restaure les réglages et le code uniquement avec le cache activé', () => {
  const first = renderHook(useSyntaxEditorStore);
  act(() => first.result.current.setSource('const value = 1;'));
  act(() => first.result.current.setLanguage('typescript'));
  expect(localStorage.getItem('devtools:syntax-editor:source')).toBeNull();
  act(() => first.result.current.setCacheEnabled(true));
  first.unmount();

  const { result } = renderHook(useSyntaxEditorStore);
  expect(result.current.source).toBe('const value = 1;');
  expect(result.current.language).toBe('typescript');
  act(() => result.current.setCacheEnabled(false));
  expect(localStorage.getItem('devtools:syntax-editor:source')).toBeNull();
  expect(localStorage.getItem('devtools:syntax-editor:settings')).toBeNull();
});
