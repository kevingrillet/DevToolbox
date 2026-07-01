import { describe, it, expect } from 'vitest';
import { charDiff, wordDiff, lineDiff, computeDiff } from './index';
import type { DiffOp } from './types';

const noOpts = { ignoreCase: false, ignoreWhitespace: false };

/** Réassemble une version à partir des ops (a = equal+delete, b = equal+insert). */
function rebuild(ops: DiffOp[], side: 'a' | 'b'): string {
  const keep = side === 'a' ? 'delete' : 'insert';
  return ops
    .filter((op) => op.type === 'equal' || op.type === keep)
    .map((op) => op.value)
    .join('');
}

describe('charDiff', () => {
  it('cat → cot', () => {
    expect(charDiff('cat', 'cot', noOpts)).toEqual([
      { type: 'equal', value: 'c' },
      { type: 'delete', value: 'a' },
      { type: 'insert', value: 'o' },
      { type: 'equal', value: 't' },
    ]);
  });

  it('reconstruit les deux versions (kitten/sitting)', () => {
    const ops = charDiff('kitten', 'sitting', noOpts);
    expect(rebuild(ops, 'a')).toBe('kitten');
    expect(rebuild(ops, 'b')).toBe('sitting');
  });
});

describe('wordDiff', () => {
  it('remplace un mot sans toucher au reste', () => {
    const ops = wordDiff('the cat sat', 'the dog sat', noOpts);
    expect(rebuild(ops, 'a')).toBe('the cat sat');
    expect(rebuild(ops, 'b')).toBe('the dog sat');
    expect(ops.some((o) => o.type === 'delete' && o.value === 'cat')).toBe(true);
    expect(ops.some((o) => o.type === 'insert' && o.value === 'dog')).toBe(true);
  });
});

describe('lineDiff', () => {
  it('détecte une ligne modifiée et préserve le texte', () => {
    const a = 'l1\nl2\nl3';
    const b = 'l1\nXX\nl3';
    const ops = lineDiff(a, b, noOpts);
    expect(rebuild(ops, 'a')).toBe(a);
    expect(rebuild(ops, 'b')).toBe(b);
  });

  it('apparie la dernière ligne (sans \\n final) à une ligne identique terminée par \\n', () => {
    // Régression : « 1,2,2,2,3 » vs « 2,2,2 » doit reconnaître les TROIS « 2 »
    // comme communs et ne supprimer que « 1 » et « 3 » — pas traiter la dernière
    // ligne comme différente à cause du saut de ligne manquant.
    // (rebuild côté b non testé : une ligne « egale » conserve la valeur du côté a,
    // donc le `\n` final diffère — détail standard, invisible au découpage par ligne.)
    const a = '1\n2\n2\n2\n3';
    const b = '2\n2\n2';
    const ops = lineDiff(a, b, noOpts);
    expect(rebuild(ops, 'a')).toBe(a);
    expect(ops.filter((o) => o.type === 'insert')).toHaveLength(0);
    const deleted = ops.filter((o) => o.type === 'delete').map((o) => o.value);
    expect(deleted).toEqual(['1\n', '3']);
  });
});

describe('options', () => {
  it('ignoreCase : « ABC » == « abc »', () => {
    const ops = charDiff('ABC', 'abc', { ignoreCase: true, ignoreWhitespace: false });
    expect(ops.every((o) => o.type === 'equal')).toBe(true);
    expect(rebuild(ops, 'a')).toBe('ABC');
  });

  it('ignoreWhitespace : « a  b » == « a b » (ligne)', () => {
    const ops = lineDiff('a  b', 'a b', { ignoreCase: false, ignoreWhitespace: true });
    expect(ops.every((o) => o.type === 'equal')).toBe(true);
  });
});

describe('computeDiff', () => {
  it('route selon la granularité', () => {
    expect(computeDiff('a b', 'a c', 'word', noOpts)).toEqual(wordDiff('a b', 'a c', noOpts));
  });
});
