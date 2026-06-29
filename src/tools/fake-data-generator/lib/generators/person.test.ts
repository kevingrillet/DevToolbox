import { describe, it, expect } from 'vitest';
import { personGenerator } from './person';
import { createRng } from '../rng';

describe('personGenerator', () => {
  it('génère le bon nombre de noms complets', () => {
    const out = personGenerator.generate(
      { locale: 'en', format: 'full', count: 4 },
      { rng: createRng('s') },
    );
    const lines = out.split('\n');
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line).toMatch(/^\S+ \S+$/);
  });

  it('format e-mail : ASCII, minuscules, @example.com', () => {
    const out = personGenerator.generate(
      { locale: 'fr', format: 'email', count: 10 },
      { rng: createRng('seed') },
    );
    for (const line of out.split('\n')) {
      expect(line).toMatch(/^[a-z]+\.[a-z]+@example\.com$/);
    }
  });

  it('déterministe par graine', () => {
    const opts = { locale: 'en', format: 'full', count: 3 };
    expect(personGenerator.generate(opts, { rng: createRng('x') })).toBe(
      personGenerator.generate(opts, { rng: createRng('x') }),
    );
  });

  it('locale inconnue → repli sur en (pas d’erreur)', () => {
    const out = personGenerator.generate(
      { locale: 'zz', format: 'first', count: 2 },
      { rng: createRng('s') },
    );
    expect(out.split('\n')).toHaveLength(2);
  });
});
