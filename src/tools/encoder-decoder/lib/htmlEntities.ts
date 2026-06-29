/**
 * Entités HTML — encodage/décodage maison.
 *
 * Encodage : échappe les cinq caractères sensibles (`& < > " '`). L'esperluette
 * est traitée en premier pour ne pas ré-échapper les entités produites ensuite.
 *
 * Décodage : reconnaît les entités numériques décimales (`&#39;`) et
 * hexadécimales (`&#x27;`) ainsi qu'un jeu d'entités nommées courantes. Une entité
 * inconnue est laissée telle quelle (comportement tolérant). Le décodage ne peut
 * pas échouer.
 */
import type { Codec, CodecResult } from './types';

/** Jeu d'entités nommées courantes (extensible). */
const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  laquo: '«',
  raquo: '»',
  euro: '€',
};

export function encodeHtmlEntities(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeHtmlEntities(input: string): string {
  return input.replace(
    /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (match, body: string) => {
      if (body[0] === '#') {
        const isHex = body[1] === 'x' || body[1] === 'X';
        const code = isHex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
        if (Number.isNaN(code)) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          // Point de code hors plage Unicode : on laisse l'entité intacte.
          return match;
        }
      }
      const named = NAMED[body];
      return named !== undefined ? named : match;
    },
  );
}

export const htmlEntitiesCodec: Codec = {
  id: 'html-entities',
  labelKey: 'tools.encoder.formats.htmlEntities',
  encode(input: string): CodecResult {
    return { ok: true, value: encodeHtmlEntities(input) };
  },
  decode(input: string): CodecResult {
    return { ok: true, value: decodeHtmlEntities(input) };
  },
};
