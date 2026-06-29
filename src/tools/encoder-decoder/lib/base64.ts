/**
 * Base64 — implémentation maison (RFC 4648), sûre en UTF-8.
 *
 * On n'utilise pas `btoa`/`atob` natifs : ils opèrent en Latin-1 et corrompent
 * tout caractère hors ASCII (accents, emojis…). On encode donc d'abord le texte
 * en octets UTF-8 (`TextEncoder`, primitive standard du navigateur) puis on
 * applique l'algorithme Base64 « à la main » sur ces octets.
 *
 * Les fonctions sur octets (`bytesToBase64` / `base64ToBytes`) sont exportées :
 * `jwt.ts` réutilise le décodage pour la variante base64url.
 */
import type { Codec, CodecResult } from './types';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) LOOKUP[ALPHABET[i]] = i;

/** Encode des octets en chaîne Base64 (avec padding `=`). */
export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const has1 = i + 1 < bytes.length;
    const has2 = i + 2 < bytes.length;
    const n = (bytes[i] << 16) | ((has1 ? bytes[i + 1] : 0) << 8) | (has2 ? bytes[i + 2] : 0);
    out += ALPHABET[(n >> 18) & 63];
    out += ALPHABET[(n >> 12) & 63];
    out += has1 ? ALPHABET[(n >> 6) & 63] : '=';
    out += has2 ? ALPHABET[n & 63] : '=';
  }
  return out;
}

/**
 * Décode une chaîne Base64 en octets. Les espaces/retours à la ligne sont
 * ignorés ; toute autre entrée invalide lève une erreur.
 */
export function base64ToBytes(input: string): Uint8Array {
  const clean = input.replace(/\s+/g, '');
  const body = clean.replace(/=+$/, '');
  if (!/^[A-Za-z0-9+/]*$/.test(body)) throw new Error('base64: caractère invalide');

  const bytes: number[] = [];
  for (let i = 0; i < body.length; i += 4) {
    const c0 = LOOKUP[body[i]];
    const c1 = LOOKUP[body[i + 1]];
    // Un quartet doit comporter au moins 2 caractères (1 seul est ambigu/invalide).
    if (c1 === undefined) throw new Error('base64: longueur invalide');
    const c2 = body[i + 2] !== undefined ? LOOKUP[body[i + 2]] : undefined;
    const c3 = body[i + 3] !== undefined ? LOOKUP[body[i + 3]] : undefined;
    const n = (c0 << 18) | (c1 << 12) | ((c2 ?? 0) << 6) | (c3 ?? 0);
    bytes.push((n >> 16) & 0xff);
    if (c2 !== undefined) bytes.push((n >> 8) & 0xff);
    if (c3 !== undefined) bytes.push(n & 0xff);
  }
  return new Uint8Array(bytes);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export const base64Codec: Codec = {
  id: 'base64',
  labelKey: 'tools.encoder.formats.base64',
  encode(input: string): CodecResult {
    return { ok: true, value: bytesToBase64(encoder.encode(input)) };
  },
  decode(input: string): CodecResult {
    try {
      // `fatal: true` ⇒ lève si les octets ne sont pas de l'UTF-8 valide.
      return { ok: true, value: decoder.decode(base64ToBytes(input)) };
    } catch {
      return { ok: false, errorKey: 'tools.encoder.errors.base64' };
    }
  },
};
