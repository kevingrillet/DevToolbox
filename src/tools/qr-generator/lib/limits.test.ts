import { describe, it, expect } from 'vitest';
import {
  MAX_QR_BYTES,
  MAX_LOGO_BYTES,
  qrByteLength,
  exceedsQrCapacity,
  isLogoTooLarge,
} from './limits';

describe('qrByteLength', () => {
  it('compte les octets ASCII un par un', () => {
    expect(qrByteLength('abc')).toBe(3);
    expect(qrByteLength('')).toBe(0);
  });
  it('compte les octets UTF-8 (un accent = 2 octets, un emoji = 4)', () => {
    expect(qrByteLength('é')).toBe(2);
    expect(qrByteLength('😀')).toBe(4);
  });
});

describe('exceedsQrCapacity', () => {
  it('accepte un contenu court à tous les niveaux', () => {
    for (const ec of ['L', 'M', 'Q', 'H'] as const) {
      expect(exceedsQrCapacity('coucou', ec)).toBe(false);
    }
  });

  it('est faux pile à la capacité, vrai un octet au-delà', () => {
    const atH = 'a'.repeat(MAX_QR_BYTES.H);
    expect(exceedsQrCapacity(atH, 'H')).toBe(false);
    expect(exceedsQrCapacity(atH + 'a', 'H')).toBe(true);
  });

  it('est plus permissif en L qu’en H (correction plus basse = plus de place)', () => {
    // Une taille qui tient en L mais dépasse en H.
    const between = 'a'.repeat(MAX_QR_BYTES.H + 1);
    expect(exceedsQrCapacity(between, 'L')).toBe(false);
    expect(exceedsQrCapacity(between, 'H')).toBe(true);
  });

  it('compte en octets UTF-8, pas en caractères', () => {
    // MAX_QR_BYTES.H caractères « é » = 2×MAX octets → dépasse largement.
    const accented = 'é'.repeat(MAX_QR_BYTES.H);
    expect(exceedsQrCapacity(accented, 'H')).toBe(true);
  });
});

describe('isLogoTooLarge', () => {
  it('accepte un fichier sous le seuil', () => {
    expect(isLogoTooLarge(0)).toBe(false);
    expect(isLogoTooLarge(MAX_LOGO_BYTES)).toBe(false);
  });
  it('refuse un fichier strictement au-dessus du seuil', () => {
    expect(isLogoTooLarge(MAX_LOGO_BYTES + 1)).toBe(true);
  });
});
