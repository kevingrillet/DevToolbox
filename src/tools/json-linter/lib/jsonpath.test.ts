import { describe, it, expect } from 'vitest';
import { evalJsonPath } from './jsonpath';

const data = { users: [{ name: 'Ann' }, { name: 'Bob' }], 'a b': 1 };

describe('evalJsonPath', () => {
  it('racine', () => {
    expect(evalJsonPath(data, '$')).toBe('$');
  });
  it('clé puis index puis clé', () => {
    expect(evalJsonPath(data, '$.users[1].name')).toBe('$.users[1].name');
  });
  it('clé entre crochets (avec espace)', () => {
    expect(evalJsonPath(data, "$['a b']")).toBe('$["a b"]');
  });
  it('clé contenant un guillemet double échappé (round-trip avec childPath)', () => {
    const d = { 'a"b': 1 };
    expect(evalJsonPath(d, '$["a\\"b"]')).toBe('$["a\\"b"]');
  });
  it('clé contenant une apostrophe échappée entre apostrophes', () => {
    const d = { "O'Brien": 1 };
    expect(evalJsonPath(d, "$['O\\'Brien']")).toBe('$["O\'Brien"]');
  });
  it('crochet quoté non terminé → null', () => {
    expect(evalJsonPath(data, "$['a b]")).toBeNull();
  });
  it('chemin absent → null', () => {
    expect(evalJsonPath(data, '$.users[5]')).toBeNull();
  });
  it('syntaxe invalide → null', () => {
    expect(evalJsonPath(data, 'users.name')).toBeNull();
  });
});
