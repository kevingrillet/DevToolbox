import { describe, it, expect } from 'vitest';
import { suggestForeground, bestBwText } from './suggest';
import { contrastRatio, type RGB } from './color';

const white: RGB = { r: 255, g: 255, b: 255 };
const black: RGB = { r: 0, g: 0, b: 0 };
const gray: RGB = { r: 128, g: 128, b: 128 };

describe('bestBwText', () => {
  it('noir sur fond clair, blanc sur fond sombre', () => {
    expect(bestBwText(white)).toEqual(black);
    expect(bestBwText(black)).toEqual(white);
  });
});

describe('suggestForeground', () => {
  it('renvoie fg inchangé s’il est déjà conforme', () => {
    expect(suggestForeground(black, white, 4.5)).toEqual(black);
  });

  it('ajuste fg jusqu’à atteindre la cible', () => {
    const result = suggestForeground(gray, white, 4.5);
    expect(result).not.toBeNull();
    if (result) expect(contrastRatio(result, white)).toBeGreaterThanOrEqual(4.5);
  });

  it('renvoie null si la cible est inatteignable sur ce fond', () => {
    expect(suggestForeground(gray, gray, 7)).toBeNull();
  });

  it('choisit le bon extrême quand le seuil de luminance 0.5 se tromperait', () => {
    // Fond rouge sombre (luminance ≈ 0.19 < 0.5) : le seuil naïf choisirait le
    // blanc (≈ 4.31, échec) alors que le noir atteint ≈ 4.87 ≥ 4.5.
    const redBg: RGB = { r: 204, g: 81, b: 83 };
    const result = suggestForeground({ r: 200, g: 200, b: 200 }, redBg, 4.5);
    expect(result).not.toBeNull();
    if (result) expect(contrastRatio(result, redBg)).toBeGreaterThanOrEqual(4.5);
  });
});
