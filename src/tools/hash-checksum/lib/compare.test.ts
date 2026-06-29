import { describe, it, expect } from 'vitest';
import { normalizeHash, compareHash } from './compare';
import type { HashResult } from './hash';

const results: HashResult[] = [
  { id: 'md5', label: 'MD5', hex: '900150983cd24fb0d6963f7d28e17f72' },
  {
    id: 'sha-256',
    label: 'SHA-256',
    hex: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  },
];

describe('normalizeHash', () => {
  it('met en minuscules et retire espaces, « : » et préfixe 0x', () => {
    expect(normalizeHash('  0xAB:CD ef ')).toBe('abcdef');
  });
});

describe('compareHash', () => {
  it('trouve l’algorithme dont le hash correspond (insensible à la casse)', () => {
    expect(compareHash('900150983CD24FB0D6963F7D28E17F72', results)).toEqual({
      normalized: '900150983cd24fb0d6963f7d28e17f72',
      matchedId: 'md5',
    });
  });

  it('renvoie matchedId null si aucune correspondance', () => {
    expect(compareHash('deadbeef', results).matchedId).toBeNull();
  });

  it('renvoie null pour une entrée vide', () => {
    expect(compareHash('   ', results)).toEqual({ normalized: '', matchedId: null });
  });
});
