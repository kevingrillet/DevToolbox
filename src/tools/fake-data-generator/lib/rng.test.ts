import { describe, it, expect } from 'vitest';
import { hashSeed, mulberry32, createRng } from './rng';

describe('rng', () => {
  it('hashSeed est déterministe et discrimine', () => {
    expect(hashSeed('abc')).toBe(hashSeed('abc'));
    expect(hashSeed('abc')).not.toBe(hashSeed('abd'));
  });

  it('mulberry32 reproduit la même suite pour une même graine', () => {
    const a = mulberry32(123);
    const b = mulberry32(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produit des flottants dans [0, 1)', () => {
    const r = createRng('x');
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('deux graines différentes divergent', () => {
    expect(createRng('a')()).not.toBe(createRng('b')());
  });
});
