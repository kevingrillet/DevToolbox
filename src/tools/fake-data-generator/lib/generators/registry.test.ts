import { describe, it, expect } from 'vitest';
import { GENERATORS, GENERATORS_BY_ID } from './index';
import { defaultOptions } from '../types';

describe('registre des générateurs', () => {
  it('expose des ids uniques et indexés', () => {
    expect(new Set(GENERATORS.map((g) => g.id)).size).toBe(GENERATORS.length);
    for (const generator of GENERATORS) {
      expect(GENERATORS_BY_ID.get(generator.id)).toBe(generator);
    }
  });

  it('defaultOptions couvre tous les champs déclarés', () => {
    for (const generator of GENERATORS) {
      const options = defaultOptions(generator);
      for (const field of generator.fields) {
        expect(options[field.key]).toBe(field.default);
      }
    }
  });
});
