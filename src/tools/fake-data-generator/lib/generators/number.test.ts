import { describe, it, expect } from 'vitest';
import { numberGenerator } from './number';
import { createRng } from '../rng';

describe('numberGenerator', () => {
  it('génère des entiers dans l’intervalle', () => {
    const out = numberGenerator.generate(
      { count: 20, min: 5, max: 10, decimals: 0 },
      { rng: createRng('s') },
    );
    const values = out.split('\n').map(Number);
    expect(values).toHaveLength(20);
    for (const v of values) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('respecte le nombre de décimales', () => {
    const out = numberGenerator.generate(
      { count: 5, min: 0, max: 1, decimals: 3 },
      { rng: createRng('s') },
    );
    for (const line of out.split('\n')) expect(line).toMatch(/^\d\.\d{3}$/);
  });

  it('intervertit les bornes si min > max', () => {
    const out = numberGenerator.generate(
      { count: 10, min: 10, max: 0, decimals: 0 },
      { rng: createRng('s') },
    );
    for (const v of out.split('\n').map(Number)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('déterministe par graine', () => {
    const opts = { count: 4, min: 0, max: 100, decimals: 2 };
    expect(numberGenerator.generate(opts, { rng: createRng('x') })).toBe(
      numberGenerator.generate(opts, { rng: createRng('x') }),
    );
  });

  it('atteint la borne max (entiers) — pas de biais excluant les bornes', () => {
    // rng constant à ~1 doit produire la borne haute, jamais au-delà.
    const out = numberGenerator.generate(
      { count: 5, min: 1, max: 3, decimals: 0 },
      { rng: () => 0.999999 },
    );
    expect(out.split('\n')).toEqual(['3', '3', '3', '3', '3']);
  });

  it('atteint la borne min (entiers) avec un rng nul', () => {
    const out = numberGenerator.generate(
      { count: 3, min: 5, max: 9, decimals: 0 },
      { rng: () => 0 },
    );
    expect(out.split('\n')).toEqual(['5', '5', '5']);
  });

  it('couvre toute l’étendue des entiers, bornes incluses', () => {
    const values = new Set(
      numberGenerator
        .generate({ count: 500, min: 0, max: 3, decimals: 0 }, { rng: createRng('cover') })
        .split('\n'),
    );
    expect([...values].sort()).toEqual(['0', '1', '2', '3']);
  });

  it('atteint la borne max en décimal (intervalle fermé)', () => {
    const out = numberGenerator.generate(
      { count: 1, min: 0, max: 1, decimals: 2 },
      { rng: () => 0.999999 },
    );
    expect(out).toBe('1.00');
  });

  it('gère les intervalles négatifs', () => {
    const out = numberGenerator.generate(
      { count: 50, min: -10, max: -1, decimals: 0 },
      { rng: createRng('neg') },
    );
    for (const v of out.split('\n').map(Number)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(-10);
      expect(v).toBeLessThanOrEqual(-1);
    }
  });

  it('min === max renvoie toujours la même valeur', () => {
    const out = numberGenerator.generate(
      { count: 3, min: 7, max: 7, decimals: 0 },
      { rng: createRng('eq') },
    );
    expect(out.split('\n')).toEqual(['7', '7', '7']);
  });
});
