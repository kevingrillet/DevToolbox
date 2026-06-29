import { describe, it, expect } from 'vitest';
import { rate } from './wcag';

describe('rate', () => {
  it('texte normal : AA ≥ 4.5, AAA ≥ 7', () => {
    expect(rate(7, 'normal')).toBe('AAA');
    expect(rate(4.5, 'normal')).toBe('AA');
    expect(rate(4.49, 'normal')).toBe('fail');
  });
  it('grand texte : AA ≥ 3, AAA ≥ 4.5', () => {
    expect(rate(4.5, 'large')).toBe('AAA');
    expect(rate(3, 'large')).toBe('AA');
    expect(rate(2.9, 'large')).toBe('fail');
  });
});
