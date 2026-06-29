import { describe, it, expect } from 'vitest';
import { decodeJwt } from './jwt';

/** Encode un objet en segment base64url (helper de test, via btoa de jsdom). */
function seg(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function makeJwt(payload: unknown, header: unknown = { alg: 'HS256', typ: 'JWT' }): string {
  return `${seg(header)}.${seg(payload)}.fake-signature`;
}

// Jeton de référence (exemple jwt.io), payload { sub, name, iat: 1516239022 }, sans exp.
const REFERENCE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('decodeJwt — succès', () => {
  it('décode header et payload du jeton de référence', () => {
    const result = decodeJwt(REFERENCE);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.decoded.header).toEqual({ alg: 'HS256', typ: 'JWT' });
    expect(result.decoded.payload).toEqual({
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022,
    });
    expect(result.decoded.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    expect(result.expired).toBeNull(); // pas de claim exp
  });

  it('évalue l’expiration par rapport à nowMs (exp en secondes)', () => {
    const token = makeJwt({ sub: 'x', exp: 1000 });
    expect(decodeJwt(token, 2000 * 1000)).toMatchObject({ ok: true, expired: true });
    expect(decodeJwt(token, 500 * 1000)).toMatchObject({ ok: true, expired: false });
  });

  it('tolère un exp sérialisé en chaîne numérique', () => {
    const token = makeJwt({ sub: 'x', exp: '1000' });
    expect(decodeJwt(token, 2000 * 1000)).toMatchObject({ ok: true, expired: true });
    expect(decodeJwt(token, 500 * 1000)).toMatchObject({ ok: true, expired: false });
  });

  it('exp non numérique → expired null (pas d’erreur)', () => {
    const token = makeJwt({ sub: 'x', exp: 'jamais' });
    expect(decodeJwt(token, 2000 * 1000)).toMatchObject({ ok: true, expired: null });
  });
});

describe('decodeJwt — erreurs', () => {
  it('signale une entrée vide', () => {
    expect(decodeJwt('   ')).toEqual({ ok: false, errorCode: 'empty' });
  });

  it('signale un jeton malformé (≠ 3 segments)', () => {
    expect(decodeJwt('a.b')).toEqual({ ok: false, errorCode: 'malformed' });
    expect(decodeJwt('a.b.c.d')).toEqual({ ok: false, errorCode: 'malformed' });
  });

  it('signale un JSON invalide', () => {
    expect(decodeJwt('bm90LWpzb24.bm90LWpzb24.sig')).toEqual({
      ok: false,
      errorCode: 'invalidJson',
    });
  });

  it('rejette un payload non-objet (ex. un tableau)', () => {
    expect(decodeJwt(makeJwt([1, 2, 3]))).toEqual({ ok: false, errorCode: 'invalidJson' });
  });
});
