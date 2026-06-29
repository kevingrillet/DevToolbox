import { describe, it, expect } from 'vitest';
import { urlCodec } from './url';

describe('url codec', () => {
  it('encode les caractères réservés', () => {
    expect(urlCodec.encode('a b&c=d?e')).toEqual({ ok: true, value: 'a%20b%26c%3Dd%3Fe' });
  });

  it('fait un aller-retour', () => {
    const text = 'https://ex.com/?q=héllo & co';
    const encoded = urlCodec.encode(text);
    expect(encoded.ok).toBe(true);
    if (encoded.ok) expect(urlCodec.decode(encoded.value)).toEqual({ ok: true, value: text });
  });

  it('échoue proprement sur une séquence pourcentage malformée', () => {
    expect(urlCodec.decode('%E0%A4%A')).toEqual({
      ok: false,
      errorKey: 'tools.encoder.errors.url',
    });
  });
});
