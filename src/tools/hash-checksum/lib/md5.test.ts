// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { md5Hex } from './md5';

const enc = (s: string) => new TextEncoder().encode(s);

describe('md5 — vecteurs RFC 1321', () => {
  const vectors: [string, string][] = [
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'd174ab98d277d9f5a5611c2c9f419d9f',
    ],
    [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '57edf4a22be3c955ac49da2e2107b67a',
    ],
  ];
  it.each(vectors)('md5(%j)', (input, expected) => {
    expect(md5Hex(enc(input))).toBe(expected);
  });
});

describe('md5 — concordance avec node:crypto (couvre les frontières de blocs)', () => {
  it('coïncide sur des longueurs variées', () => {
    for (const len of [0, 1, 55, 56, 57, 63, 64, 65, 120, 1000]) {
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = (i * 31 + 7) & 0xff;
      const oracle = createHash('md5').update(Buffer.from(bytes)).digest('hex');
      expect(md5Hex(bytes)).toBe(oracle);
    }
  });
});
