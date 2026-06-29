import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useEncoderStore } from './useEncoderStore';

describe('useEncoderStore', () => {
  it('encode en base64 par défaut', () => {
    const { result } = renderHook(() => useEncoderStore());
    act(() => result.current.setInput('hello'));
    expect(result.current.isJwt).toBe(false);
    expect(result.current.codecResult?.ok).toBe(true);
    expect(result.current.codecResult?.ok && result.current.codecResult.value).toBe(btoa('hello'));
  });

  it('décode dans l’autre sens', () => {
    const { result } = renderHook(() => useEncoderStore());
    act(() => result.current.setDirection('decode'));
    act(() => result.current.setInput(btoa('hello')));
    expect(result.current.codecResult?.ok && result.current.codecResult.value).toBe('hello');
  });

  it('swap inverse le sens et reproduit l’aller-retour', () => {
    const { result } = renderHook(() => useEncoderStore());
    act(() => result.current.setInput('hello'));
    act(() => result.current.swap());
    expect(result.current.direction).toBe('decode');
    expect(result.current.input).toBe(btoa('hello'));
    expect(result.current.codecResult?.ok && result.current.codecResult.value).toBe('hello');
  });

  it('bascule sur le format JWT et expose jwtResult', () => {
    const { result } = renderHook(() => useEncoderStore());
    act(() => result.current.setFormat('jwt'));
    expect(result.current.isJwt).toBe(true);
    expect(result.current.codecResult).toBeNull();
    act(() => result.current.setInput('pas-un-jwt'));
    expect(result.current.jwtResult).not.toBeNull();
  });

  it('reset vide l’entrée', () => {
    const { result } = renderHook(() => useEncoderStore());
    act(() => result.current.setInput('xyz'));
    act(() => result.current.reset());
    expect(result.current.input).toBe('');
  });
});
