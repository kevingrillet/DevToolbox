import { describe, it, expect } from 'vitest';
import { parseJson } from './parse';

describe('parseJson — valide', () => {
  it('analyse primitifs et structures imbriquées', () => {
    expect(parseJson('null')).toEqual({ ok: true, value: null, warnings: [] });
    expect(parseJson('true')).toEqual({ ok: true, value: true, warnings: [] });
    expect(parseJson('-12.5e3')).toEqual({ ok: true, value: -12500, warnings: [] });
    expect(parseJson('"a\\nb"')).toEqual({ ok: true, value: 'a\nb', warnings: [] });
    expect(parseJson('  {"a":[1,2],"b":{"c":null}}  ')).toEqual({
      ok: true,
      value: { a: [1, 2], b: { c: null } },
      warnings: [],
    });
  });

  it('gère les échappements Unicode', () => {
    expect(parseJson('"\\u0041"')).toEqual({ ok: true, value: 'A', warnings: [] });
  });
});

describe('parseJson — avertissements de précision', () => {
  it('signale un entier hors de la plage des entiers sûrs', () => {
    const r = parseJson('{"id": 12345678901234567890}');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.warnings).toHaveLength(1);
      expect(r.warnings[0]).toMatchObject({ kind: 'precision', literal: '12345678901234567890' });
    }
  });

  it('signale un littéral débordant vers l’infini', () => {
    const r = parseJson('1e400');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings).toHaveLength(1);
  });

  it('n’avertit pas pour les entiers sûrs ni les fractions anodines', () => {
    const r = parseJson('[1, 2.5, 1.0, 9007199254740991]');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.warnings).toEqual([]);
  });

  it('une clé "__proto__" devient une propriété propre, sans toucher au prototype', () => {
    const r = parseJson('{"__proto__": {"polluted": true}}');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const value = r.value as Record<string, unknown>;
    // Propriété propre présente (comme JSON.parse), prototype intact.
    expect(Object.prototype.hasOwnProperty.call(value, '__proto__')).toBe(true);
    expect(value['__proto__']).toEqual({ polluted: true });
    expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
    // Aucun objet tiers n’a été pollué.
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe('parseJson — erreurs localisées', () => {
  it('virgule finale → ligne/colonne du « } »', () => {
    const r = parseJson('{"a":1,}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.line).toBe(1);
      expect(r.error.column).toBe(8);
    }
  });

  it('localise la ligne sur un document multiligne', () => {
    const r = parseJson('{\n  "a": 1\n  "b": 2\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.line).toBe(3);
  });

  it('chaîne non terminée', () => {
    const r = parseJson('"abc');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toMatch(/non terminée/);
  });

  it('document vide', () => {
    expect(parseJson('   ')).toEqual({
      ok: false,
      error: { message: 'Document vide', line: 1, column: 4 },
    });
  });

  it('contenu en trop après la valeur', () => {
    expect(parseJson('1 2').ok).toBe(false);
  });
});
