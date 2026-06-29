/**
 * Décodage de JWT (JWS compact) — SANS vérification de signature.
 *
 * Tout est client-side et on n'a pas la clé : on se contente de décoder le header
 * et le payload (base64url → JSON) et d'évaluer l'expiration (`exp`). La signature
 * est renvoyée brute, à titre informatif, jamais validée.
 *
 * Fonction PURE : l'instant courant est injectable (`nowMs`) pour des tests
 * déterministes.
 */
import { base64ToBytes } from './base64';

export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  /** Troisième segment, brut (non vérifié). */
  signature: string;
}

export type JwtErrorCode = 'empty' | 'malformed' | 'invalidJson';

export type JwtResult =
  | {
      ok: true;
      decoded: JwtDecoded;
      /** `true`/`false` si `exp` est présent (en secondes), `null` sinon. */
      expired: boolean | null;
    }
  | { ok: false; errorCode: JwtErrorCode };

const utf8 = new TextDecoder('utf-8', { fatal: true });

/** Décode un segment base64url en chaîne UTF-8 (peut lever). */
function base64UrlToString(segment: string): string {
  let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  return utf8.decode(base64ToBytes(b64));
}

/** Lit un claim temporel (secondes epoch) tolérant nombre OU chaîne numérique. */
function toEpochSeconds(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function decodeJwt(token: string, nowMs: number = Date.now()): JwtResult {
  const trimmed = token.trim();
  if (trimmed === '') return { ok: false, errorCode: 'empty' };

  const parts = trimmed.split('.');
  if (parts.length !== 3) return { ok: false, errorCode: 'malformed' };

  try {
    const header = asObject(JSON.parse(base64UrlToString(parts[0])));
    const payload = asObject(JSON.parse(base64UrlToString(parts[1])));
    if (!header || !payload) return { ok: false, errorCode: 'invalidJson' };

    // `exp` est normalement un nombre (secondes epoch), mais certains émetteurs le
    // sérialisent en chaîne numérique ("1700000000") : on tolère ce cas.
    const expSec = toEpochSeconds(payload.exp);
    const expired = expSec === null ? null : nowMs / 1000 > expSec;

    return { ok: true, decoded: { header, payload, signature: parts[2] }, expired };
  } catch {
    return { ok: false, errorCode: 'invalidJson' };
  }
}

/** Claims temporels reconnus, traduits en dates lisibles par l'UI. */
export const JWT_TIME_CLAIMS = ['iat', 'exp', 'nbf'] as const;
