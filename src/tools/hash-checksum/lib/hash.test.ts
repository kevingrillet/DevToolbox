// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { hashBytes, hashAll, ALGORITHMS } from './hash';

const enc = (s: string) => new TextEncoder().encode(s);
const oracle = (algo: string, s: string) => createHash(algo).update(s).digest('hex');

describe('hashBytes', () => {
  it('SHA-1/256/512 concordent avec node:crypto', async () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    expect(await hashBytes('sha-1', enc(text))).toBe(oracle('sha1', text));
    expect(await hashBytes('sha-256', enc(text))).toBe(oracle('sha256', text));
    expect(await hashBytes('sha-512', enc(text))).toBe(oracle('sha512', text));
  });

  it('MD5 passe par le même point d’entrée', async () => {
    expect(await hashBytes('md5', enc('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('rejette un algorithme inconnu', async () => {
    await expect(hashBytes('sha-3', enc('x'))).rejects.toThrow();
  });
});

describe('hashAll', () => {
  it('calcule tous les algorithmes du registre', async () => {
    const results = await hashAll(enc('abc'));
    expect(results.map((r) => r.id)).toEqual(ALGORITHMS.map((a) => a.id));
    expect(results.find((r) => r.id === 'md5')?.hex).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(results.find((r) => r.id === 'sha-256')?.hex).toBe(oracle('sha256', 'abc'));
  });
});
