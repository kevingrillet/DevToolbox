/**
 * MD5 (RFC 1321) — implémentation maison, sur octets.
 *
 * `SubtleCrypto` ne fournit pas MD5 (algorithme considéré obsolète pour la
 * cryptographie), mais il reste utile pour vérifier l'intégrité de fichiers : on
 * l'implémente donc « from scratch ». Fonction pure et déterministe, opérant sur
 * un `Uint8Array` ⇒ testable et indépendante du navigateur.
 *
 * MD5 ne doit pas être utilisé à des fins de sécurité (collisions connues) — c'est
 * un outil de checksum, pas de hachage cryptographique.
 */

// Décalages de rotation par tour (RFC 1321).
const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14,
  20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6,
  10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// Constantes K[i] = floor(|sin(i+1)| * 2^32).
const K = new Uint32Array(64);
for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;

function rotl(x: number, c: number): number {
  return ((x << c) | (x >>> (32 - c))) >>> 0;
}

/** Calcule le condensé MD5 (16 octets) d'un message. */
export function md5Bytes(input: Uint8Array): Uint8Array {
  const bitLen = input.length * 8;

  // Rembourrage : 0x80, puis des zéros, puis la longueur sur 64 bits little-endian,
  // le tout amené à un multiple de 64 octets.
  const totalLen = ((input.length + 8) >> 6) * 64 + 64;
  const msg = new Uint8Array(totalLen);
  msg.set(input);
  msg[input.length] = 0x80;
  const lenLo = bitLen >>> 0;
  const lenHi = Math.floor(bitLen / 4294967296) >>> 0;
  const lenPos = totalLen - 8;
  msg[lenPos] = lenLo & 0xff;
  msg[lenPos + 1] = (lenLo >>> 8) & 0xff;
  msg[lenPos + 2] = (lenLo >>> 16) & 0xff;
  msg[lenPos + 3] = (lenLo >>> 24) & 0xff;
  msg[lenPos + 4] = lenHi & 0xff;
  msg[lenPos + 5] = (lenHi >>> 8) & 0xff;
  msg[lenPos + 6] = (lenHi >>> 16) & 0xff;
  msg[lenPos + 7] = (lenHi >>> 24) & 0xff;

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const M = new Uint32Array(16);
  for (let off = 0; off < msg.length; off += 64) {
    for (let j = 0; j < 16; j++) {
      const p = off + j * 4;
      M[j] = (msg[p] | (msg[p + 1] << 8) | (msg[p + 2] << 16) | (msg[p + 3] << 24)) >>> 0;
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f: number;
      let g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      f = (f + a + K[i] + M[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + rotl(f, SHIFTS[i])) >>> 0;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const out = new Uint8Array(16);
  const words = [a0, b0, c0, d0];
  for (let i = 0; i < 4; i++) {
    out[i * 4] = words[i] & 0xff;
    out[i * 4 + 1] = (words[i] >>> 8) & 0xff;
    out[i * 4 + 2] = (words[i] >>> 16) & 0xff;
    out[i * 4 + 3] = (words[i] >>> 24) & 0xff;
  }
  return out;
}

/** Convertit des octets en chaîne hexadécimale minuscule. */
export function toHex(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, '0');
  return out;
}

/** Condensé MD5 en hexadécimal. */
export function md5Hex(input: Uint8Array): string {
  return toHex(md5Bytes(input));
}
