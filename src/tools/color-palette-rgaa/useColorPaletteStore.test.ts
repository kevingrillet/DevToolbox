import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useColorPaletteStore } from './useColorPaletteStore';

describe('useColorPaletteStore', () => {
  it('calcule un ratio de contraste pour les couleurs par défaut', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    expect(result.current.ratio).not.toBeNull();
    expect(result.current.ratio!).toBeGreaterThan(1);
    expect(result.current.levelNormal).not.toBeNull();
    expect(result.current.exportText.length).toBeGreaterThan(0);
  });

  it('ajoute, modifie et retire une couleur', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    const initial = result.current.colors.length;
    act(() => result.current.addColor());
    expect(result.current.colors.length).toBe(initial + 1);
    act(() => result.current.setColor(0, '#000000'));
    expect(result.current.colors[0]).toBe('#000000');
    act(() => result.current.removeColor(result.current.colors.length - 1));
    expect(result.current.colors.length).toBe(initial);
  });

  it('ne descend pas sous une seule couleur', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    act(() => {
      result.current.removeColor(0);
      result.current.removeColor(0);
      result.current.removeColor(0);
      result.current.removeColor(0);
    });
    expect(result.current.colors.length).toBe(1);
  });

  it('swap échange premier-plan et arrière-plan', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    const fg = result.current.fgIndex;
    const bg = result.current.bgIndex;
    act(() => result.current.swap());
    expect(result.current.fgIndex).toBe(bg);
    expect(result.current.bgIndex).toBe(fg);
  });

  it('applique une suggestion sur la couleur de premier plan', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    act(() => result.current.setFgIndex(0));
    act(() => result.current.applySuggestion('#123456'));
    expect(result.current.colors[0]).toBe('#123456');
  });

  it('change taille de texte et format d’export, puis reset', () => {
    const { result } = renderHook(() => useColorPaletteStore());
    act(() => result.current.setTextSize('large'));
    act(() => result.current.setExportFormat('json'));
    expect(result.current.textSize).toBe('large');
    expect(result.current.exportFormat).toBe('json');
    act(() => result.current.reset());
    expect(result.current.textSize).toBe('normal');
    expect(result.current.exportFormat).toBe('css');
  });
});
