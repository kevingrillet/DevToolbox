import { describe, it, expect } from 'vitest';
import { INPUT_LIMITS, isInputTooLarge } from './inputLimits';

describe('isInputTooLarge', () => {
  it('est faux à la limite exacte et en dessous (bornes)', () => {
    expect(isInputTooLarge('', 5)).toBe(false);
    expect(isInputTooLarge('abcde', 5)).toBe(false); // longueur == max
    expect(isInputTooLarge('abcd', 5)).toBe(false);
  });

  it('est vrai dès qu’on dépasse la limite d’un caractère', () => {
    expect(isInputTooLarge('abcdef', 5)).toBe(true);
  });

  it('compte les caractères, pas les lignes', () => {
    expect(isInputTooLarge('a\nb\nc', 3)).toBe(true); // 5 caractères > 3
  });
});

describe('INPUT_LIMITS', () => {
  it('déclare des seuils strictement positifs pour chaque outil concerné', () => {
    for (const key of ['json', 'csv', 'textDiff', 'codeLinter'] as const) {
      expect(INPUT_LIMITS[key]).toBeGreaterThan(0);
    }
  });
});
