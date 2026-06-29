import { describe, it, expect } from 'vitest';
import { uuidGenerator } from './uuid';
import { createRng } from '../rng';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuidGenerator', () => {
  it('génère le bon nombre d’UUID v4 valides', () => {
    const out = uuidGenerator.generate(
      { count: 5, hyphens: true, uppercase: false },
      { rng: createRng('s') },
    );
    const lines = out.split('\n');
    expect(lines).toHaveLength(5);
    for (const line of lines) expect(line).toMatch(V4);
  });

  it('option sans tirets (32 hex)', () => {
    const out = uuidGenerator.generate(
      { count: 1, hyphens: false, uppercase: false },
      { rng: createRng('s') },
    );
    expect(out).not.toContain('-');
    expect(out).toHaveLength(32);
  });

  it('option majuscules', () => {
    const out = uuidGenerator.generate(
      { count: 1, hyphens: true, uppercase: true },
      { rng: createRng('s') },
    );
    expect(out).toBe(out.toUpperCase());
    expect(out).toMatch(/^[0-9A-F]{8}-/);
  });

  it('déterministe par graine', () => {
    const opts = { count: 3, hyphens: true, uppercase: false };
    expect(uuidGenerator.generate(opts, { rng: createRng('x') })).toBe(
      uuidGenerator.generate(opts, { rng: createRng('x') }),
    );
  });
});
