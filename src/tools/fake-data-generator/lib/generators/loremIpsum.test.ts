import { describe, it, expect } from 'vitest';
import { loremGenerator } from './loremIpsum';
import { createRng } from '../rng';

const ctx = (seed = 'seed') => ({ rng: createRng(seed) });

describe('loremGenerator', () => {
  it('mots : produit le nombre demandé', () => {
    const out = loremGenerator.generate({ unit: 'words', count: 10, startWithLorem: false }, ctx());
    expect(out.split(' ')).toHaveLength(10);
  });

  it('startWithLorem : commence par l’en-tête classique (tous les modes)', () => {
    const words = loremGenerator.generate({ unit: 'words', count: 8, startWithLorem: true }, ctx());
    expect(words.toLowerCase()).toMatch(/^lorem ipsum dolor sit amet/);
    const sentences = loremGenerator.generate(
      { unit: 'sentences', count: 2, startWithLorem: true },
      ctx(),
    );
    expect(sentences).toMatch(/^Lorem ipsum dolor sit amet/);
    const paragraphs = loremGenerator.generate(
      { unit: 'paragraphs', count: 2, startWithLorem: true },
      ctx(),
    );
    expect(paragraphs).toMatch(/^Lorem ipsum dolor sit amet/);
  });

  it('paragraphes : séparés par une ligne vide, bon compte', () => {
    const out = loremGenerator.generate(
      { unit: 'paragraphs', count: 3, startWithLorem: false },
      ctx(),
    );
    expect(out.split('\n\n')).toHaveLength(3);
  });

  it('phrases : se terminent par un point', () => {
    const out = loremGenerator.generate(
      { unit: 'sentences', count: 3, startWithLorem: false },
      ctx(),
    );
    expect(out.trim().endsWith('.')).toBe(true);
  });

  it('déterministe : même graine → même sortie', () => {
    const opts = { unit: 'paragraphs', count: 2, startWithLorem: false };
    expect(loremGenerator.generate(opts, ctx('s1'))).toBe(loremGenerator.generate(opts, ctx('s1')));
    expect(loremGenerator.generate(opts, ctx('s1'))).not.toBe(
      loremGenerator.generate(opts, ctx('s2')),
    );
  });

  it('count 0 → chaîne vide', () => {
    expect(loremGenerator.generate({ unit: 'words', count: 0, startWithLorem: true }, ctx())).toBe(
      '',
    );
  });
});
