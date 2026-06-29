import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import { currentPath, navigate, toHref, useHashLocation, Link } from './router';

beforeEach(() => {
  window.location.hash = '';
});

describe('router — chemins', () => {
  it('currentPath vaut « / » quand le hash est vide', () => {
    expect(currentPath()).toBe('/');
  });

  it('navigate met à jour le hash ET le chemin courant', () => {
    navigate('/json-linter');
    expect(window.location.hash).toBe('#/json-linter');
    expect(currentPath()).toBe('/json-linter');
  });

  it('normalise le slash final (sauf la racine)', () => {
    navigate('/text-diff/');
    expect(currentPath()).toBe('/text-diff');
  });

  it('toHref préfixe « # » et garantit le « / » initial', () => {
    expect(toHref('/x')).toBe('#/x');
    expect(toHref('x')).toBe('#/x');
  });
});

describe('Link', () => {
  it('rend une ancre avec un href en hash', () => {
    render(<Link to="/encoder">Encoder</Link>);
    expect(screen.getByRole('link', { name: 'Encoder' })).toHaveAttribute('href', '#/encoder');
  });
});

describe('useHashLocation', () => {
  it('réagit à une navigation', async () => {
    const { result } = renderHook(() => useHashLocation());
    expect(result.current).toBe('/');
    act(() => navigate('/hash-checksum'));
    await waitFor(() => expect(result.current).toBe('/hash-checksum'));
  });
});
