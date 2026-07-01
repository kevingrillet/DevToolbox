import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQrStore } from './useQrStore';

describe('useQrStore', () => {
  it('démarre sur le type « text », vide donc non prêt', () => {
    const { result } = renderHook(() => useQrStore());
    expect(result.current.activeId).toBe('text');
    expect(result.current.ready).toBe(false);
  });

  it('construit le payload et devient prêt quand le requis est rempli', () => {
    const { result } = renderHook(() => useQrStore());
    act(() => result.current.setValue('text', 'bonjour'));
    expect(result.current.payload).toBe('bonjour');
    expect(result.current.ready).toBe(true);
  });

  it('conserve les valeurs par type en changeant de type', () => {
    const { result } = renderHook(() => useQrStore());
    act(() => result.current.setValue('text', 'gardé'));
    act(() => result.current.setActiveId('url'));
    expect(result.current.values.url).toBe('');
    act(() => result.current.setActiveId('text'));
    expect(result.current.values.text).toBe('gardé');
  });

  it('valide le format (URL) et bloque ready tant que c’est invalide', () => {
    const { result } = renderHook(() => useQrStore());
    act(() => result.current.setActiveId('url'));
    act(() => result.current.setValue('url', 'pas une url'));
    expect(result.current.errors.url).toBe('validation.url');
    expect(result.current.ready).toBe(false);
    act(() => result.current.setValue('url', 'exemple.com'));
    expect(result.current.errors.url).toBeUndefined();
    expect(result.current.payload).toBe('https://exemple.com');
    expect(result.current.ready).toBe(true);
  });

  it('construit un payload WiFi', () => {
    const { result } = renderHook(() => useQrStore());
    act(() => result.current.setActiveId('wifi'));
    act(() => result.current.setValue('ssid', 'MonReseau'));
    expect(result.current.payload).toContain('WIFI:');
    expect(result.current.payload).toContain('S:MonReseau');
    expect(result.current.ready).toBe(true);
  });

  it('passe la correction en H quand un logo est ajouté (depuis M)', () => {
    const { result } = renderHook(() => useQrStore());
    expect(result.current.ecLevel).toBe('M');
    act(() => result.current.setLogo('data:image/png;base64,AAAA'));
    expect(result.current.ecLevel).toBe('H');
  });

  it('ne rétrograde pas un niveau déjà élevé en ajoutant un logo', () => {
    const { result } = renderHook(() => useQrStore());
    act(() => result.current.setEcLevel('Q'));
    act(() => result.current.setLogo('data:image/png;base64,AAAA'));
    expect(result.current.ecLevel).toBe('Q');
  });
});
