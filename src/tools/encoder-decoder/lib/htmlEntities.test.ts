import { describe, it, expect } from 'vitest';
import { htmlEntitiesCodec, encodeHtmlEntities, decodeHtmlEntities } from './htmlEntities';

describe('htmlEntities — encodage', () => {
  it('échappe les cinq caractères sensibles', () => {
    expect(encodeHtmlEntities('<a href="x">Tom & Jerry\'s</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;',
    );
  });

  it('n’échappe l’esperluette qu’une fois', () => {
    expect(encodeHtmlEntities('&')).toBe('&amp;');
    expect(encodeHtmlEntities('a<b')).toBe('a&lt;b');
  });
});

describe('htmlEntities — décodage', () => {
  it('décode entités nommées, décimales et hexadécimales', () => {
    expect(decodeHtmlEntities('&lt;a&gt;')).toBe('<a>');
    expect(decodeHtmlEntities('&#39;&#x41;')).toBe("'A");
    expect(decodeHtmlEntities('caf&#233;')).toBe('café');
    expect(decodeHtmlEntities('1&nbsp;000&euro;')).toBe('1 000€');
  });

  it('laisse les entités inconnues intactes', () => {
    expect(decodeHtmlEntities('&inconnue;')).toBe('&inconnue;');
  });

  it('fait un aller-retour via le codec', () => {
    const text = '<tag attr="v">&\'';
    const encoded = htmlEntitiesCodec.encode(text);
    expect(encoded.ok).toBe(true);
    if (encoded.ok)
      expect(htmlEntitiesCodec.decode(encoded.value)).toEqual({ ok: true, value: text });
  });
});
