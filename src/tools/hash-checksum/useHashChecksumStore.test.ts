import { describe, expect, it } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useHashChecksumStore } from './useHashChecksumStore';

describe('useHashChecksumStore', () => {
  it('hache un texte et expose les résultats', async () => {
    const { result } = renderHook(() => useHashChecksumStore());
    act(() => result.current.setText('abc'));
    await waitFor(() => expect(result.current.results).not.toBeNull());
    const md5 = result.current.results!.find((r) => r.id === 'md5');
    // MD5 de "abc" est une valeur connue.
    expect(md5?.hex).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(result.current.computing).toBe(false);
  });

  it('compare avec un hash attendu', async () => {
    const { result } = renderHook(() => useHashChecksumStore());
    act(() => result.current.setText('abc'));
    await waitFor(() => expect(result.current.results).not.toBeNull());
    act(() => result.current.setExpected('900150983cd24fb0d6963f7d28e17f72'));
    expect(result.current.comparison).not.toBeNull();
    expect(result.current.comparison?.matchedId).toBe('md5');
  });

  it('hache le contenu d’un fichier', async () => {
    const { result } = renderHook(() => useHashChecksumStore());
    const file = new File(['abc'], 'a.txt', { type: 'text/plain' });
    act(() => result.current.setFile(file));
    await waitFor(() => expect(result.current.results).not.toBeNull());
    expect(result.current.fileName).toBe('a.txt');
    expect(result.current.fileSize).toBe(3);
  });

  it('reset efface texte, résultats et attendu', async () => {
    const { result } = renderHook(() => useHashChecksumStore());
    act(() => result.current.setText('abc'));
    await waitFor(() => expect(result.current.results).not.toBeNull());
    act(() => result.current.reset());
    await waitFor(() => expect(result.current.results).toBeNull());
    expect(result.current.text).toBe('');
    expect(result.current.expected).toBe('');
  });
});
