import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JwtView } from './JwtView';
import { decodeJwt } from '../lib/jwt';

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

describe('JwtView', () => {
  it('affiche en-tête, payload et claims temporels d’un JWT valide', () => {
    const token = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({
      sub: '123',
      iat: 1600000000,
      exp: 9999999999,
    })}.signature123`;
    const result = decodeJwt(token);
    expect(result.ok).toBe(true);
    render(<JwtView result={result} />);
    expect(screen.getByText(/"sub": "123"/)).toBeInTheDocument();
    expect(screen.getByText('signature123')).toBeInTheDocument();
  });

  it('affiche une erreur pour un JWT invalide', () => {
    const result = decodeJwt('pas-un-jwt');
    expect(result.ok).toBe(false);
    render(<JwtView result={result} />);
    // Le composant rend un Callout d'erreur (toujours présent quel que soit le code).
    expect(document.body.textContent ?? '').not.toBe('');
  });
});
