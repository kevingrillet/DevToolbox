import { describe, it, expect } from 'vitest';
import { parseHex, toHex, relativeLuminance, contrastRatio } from './color';

describe('parseHex', () => {
  it('parse #rgb et #rrggbb (avec ou sans #)', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseHex('#1d4ed8')).toEqual({ r: 0x1d, g: 0x4e, b: 0xd8 });
  });
  it('renvoie null si invalide', () => {
    expect(parseHex('xyz')).toBeNull();
    expect(parseHex('#12')).toBeNull();
  });
});

describe('toHex', () => {
  it('formate, arrondit et borne', () => {
    expect(toHex({ r: 29, g: 78, b: 216 })).toBe('#1d4ed8');
    expect(toHex({ r: 255.6, g: -3, b: 0 })).toBe('#ff0000');
  });
});

describe('contraste WCAG', () => {
  it('luminance : noir = 0, blanc = 1', () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
  });
  it('noir / blanc = 21:1', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 1);
  });
  it('même couleur = 1:1', () => {
    expect(contrastRatio({ r: 18, g: 52, b: 86 }, { r: 18, g: 52, b: 86 })).toBeCloseTo(1, 5);
  });
});
