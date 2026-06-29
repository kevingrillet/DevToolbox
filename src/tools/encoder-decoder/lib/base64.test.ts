import { describe, it, expect } from 'vitest';
import { base64Codec, bytesToBase64, base64ToBytes } from './base64';

describe('base64 — octets', () => {
  it('encode selon les vecteurs RFC 4648', () => {
    const enc = (s: string) => bytesToBase64(new TextEncoder().encode(s));
    expect(enc('')).toBe('');
    expect(enc('f')).toBe('Zg==');
    expect(enc('fo')).toBe('Zm8=');
    expect(enc('foo')).toBe('Zm9v');
    expect(enc('foob')).toBe('Zm9vYg==');
    expect(enc('fooba')).toBe('Zm9vYmE=');
    expect(enc('foobar')).toBe('Zm9vYmFy');
  });

  it('décode en ignorant les espaces', () => {
    expect(new TextDecoder().decode(base64ToBytes('Zm9v YmFy'))).toBe('foobar');
  });

  it('lève sur une entrée invalide', () => {
    expect(() => base64ToBytes('!!!!')).toThrow();
    expect(() => base64ToBytes('Z')).toThrow(); // quartet d'un seul caractère
  });
});

describe('base64 — codec UTF-8', () => {
  it('fait un aller-retour sur du texte accentué et des emojis', () => {
    for (const text of ['Héllo, wörld !', '日本語', '🎉 émoji']) {
      const encoded = base64Codec.encode(text);
      expect(encoded.ok).toBe(true);
      if (!encoded.ok) continue;
      expect(base64Codec.decode(encoded.value)).toEqual({ ok: true, value: text });
    }
  });

  it('encode « é » en UTF-8 (et non Latin-1)', () => {
    expect(base64Codec.encode('é')).toEqual({ ok: true, value: 'w6k=' });
  });

  it('échoue proprement au décodage d’une entrée invalide', () => {
    const result = base64Codec.decode('not*base64');
    expect(result).toEqual({ ok: false, errorKey: 'tools.encoder.errors.base64' });
  });

  it('rejette des octets non-UTF-8 valides', () => {
    // 0xFF seul n'est pas une séquence UTF-8 valide → '/w==' doit échouer.
    expect(base64Codec.decode('/w==').ok).toBe(false);
  });
});
