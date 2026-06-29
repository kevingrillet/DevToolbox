import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { readTextFile } from './readTextFile';

describe('readTextFile', () => {
  it('transmet le contenu texte du fichier', async () => {
    const onText = vi.fn();
    const file = new File(['bonjour'], 'a.txt', { type: 'text/plain' });
    readTextFile(file, onText);
    await waitFor(() => expect(onText).toHaveBeenCalledWith('bonjour'));
  });

  it('appelle onError si la lecture échoue', async () => {
    const onError = vi.fn();
    const broken = { text: () => Promise.reject(new Error('illisible')) } as unknown as File;
    readTextFile(broken, vi.fn(), onError);
    await waitFor(() => expect(onError).toHaveBeenCalled());
  });
});
