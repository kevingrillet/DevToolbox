import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePersistentBoolean, useCachedState } from './useCachedState';

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('usePersistentBoolean', () => {
  it('utilise le fallback quand rien n’est stocké', () => {
    const { result } = renderHook(() => usePersistentBoolean('devtools:test:flag', true));
    expect(result.current[0]).toBe(true);
  });

  it('persiste la valeur et la relit au remontage', () => {
    const first = renderHook(() => usePersistentBoolean('devtools:test:flag'));
    act(() => first.result.current[1](true));
    expect(window.localStorage.getItem('devtools:test:flag')).toBe('true');

    const second = renderHook(() => usePersistentBoolean('devtools:test:flag'));
    expect(second.result.current[0]).toBe(true);
  });

  it('lit une valeur "false" stockée plutôt que le fallback', () => {
    window.localStorage.setItem('devtools:test:flag', 'false');
    const { result } = renderHook(() => usePersistentBoolean('devtools:test:flag', true));
    expect(result.current[0]).toBe(false);
  });
});

describe('useCachedState', () => {
  it('démarre vide quand le cache est désactivé, sans écrire', () => {
    const { result } = renderHook(() => useCachedState('devtools:test:val', false, ''));
    expect(result.current[0]).toBe('');
    expect(window.localStorage.getItem('devtools:test:val')).toBeNull();
  });

  it('écrit dans le storage tant que le cache est activé', () => {
    const { result } = renderHook(() => useCachedState('devtools:test:val', true, ''));
    act(() => result.current[1]('hello'));
    expect(window.localStorage.getItem('devtools:test:val')).toBe('hello');
  });

  it('restaure la valeur au montage si le cache était activé', () => {
    window.localStorage.setItem('devtools:test:val', 'restored');
    const { result } = renderHook(() => useCachedState('devtools:test:val', true, ''));
    expect(result.current[0]).toBe('restored');
  });

  it('ignore le storage et reste vierge si le cache est désactivé', () => {
    window.localStorage.setItem('devtools:test:val', 'restored');
    const { result } = renderHook(() => useCachedState('devtools:test:val', false, ''));
    expect(result.current[0]).toBe('');
  });

  it('supprime la valeur stockée quand le cache passe à désactivé', () => {
    window.localStorage.setItem('devtools:test:val', 'stale');
    const { rerender } = renderHook(
      ({ enabled }) => useCachedState('devtools:test:val', enabled, ''),
      {
        initialProps: { enabled: true },
      },
    );
    rerender({ enabled: false });
    expect(window.localStorage.getItem('devtools:test:val')).toBeNull();
  });

  it('reste fonctionnel quand localStorage lève QuotaExceededError (fallback gracieux)', () => {
    // Simule un quota saturé : `setItem` lève, comme un navigateur plein ou en
    // mode privé restrictif. Le hook doit continuer à exposer la valeur en
    // mémoire sans propager l'erreur.
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const { result } = renderHook(() => useCachedState('devtools:test:val', true, ''));
    expect(() => act(() => result.current[1]('trop gros'))).not.toThrow();
    // La valeur reste disponible dans l'état, seule la persistance est perdue.
    expect(result.current[0]).toBe('trop gros');
  });

  it('démarre sur la valeur initiale si la lecture de localStorage échoue', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const { result } = renderHook(() => useCachedState('devtools:test:val', true, 'defaut'));
    expect(result.current[0]).toBe('defaut');
  });
});
