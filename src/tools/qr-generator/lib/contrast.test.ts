import { describe, it, expect } from 'vitest';
import { parseHex, relativeLuminance, contrastRatio, contrastStatus } from './contrast';

describe('parseHex', () => {
  it('décode une couleur sur 6 chiffres', () => {
    expect(parseHex('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
  });
  it('décode une couleur courte sur 3 chiffres', () => {
    expect(parseHex('#f80')).toEqual({ r: 255, g: 136, b: 0 });
  });
  it('tolère l’absence de dièse et les espaces', () => {
    expect(parseHex('  000000 ')).toEqual({ r: 0, g: 0, b: 0 });
  });
  it('retourne null pour une valeur invalide', () => {
    expect(parseHex('pas-une-couleur')).toBeNull();
  });
});

describe('relativeLuminance', () => {
  it('vaut 0 pour le noir et ~1 pour le blanc', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });
});

describe('contrastRatio', () => {
  it('vaut 21 pour noir / blanc', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
  it('est symétrique', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(contrastRatio('#abcdef', '#123456'), 6);
  });
  it('vaut 1 pour deux couleurs identiques', () => {
    expect(contrastRatio('#808080', '#808080')).toBeCloseTo(1, 6);
  });
});

describe('contrastStatus', () => {
  it('valide le noir sur blanc', () => {
    expect(contrastStatus('#000000', '#ffffff')).toBe('ok');
  });
  it('signale un contraste trop faible (jaune sur blanc)', () => {
    expect(contrastStatus('#ffe600', '#ffffff')).toBe('low');
  });
  it('signale un QR « en négatif » (blanc sur noir)', () => {
    expect(contrastStatus('#ffffff', '#000000')).toBe('inverted');
  });
});
