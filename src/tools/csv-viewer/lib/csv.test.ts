import { describe, it, expect } from 'vitest';
import { parseCsv, detectDelimiter, toTable } from './csv';
import { sortRows } from './sort';

describe('parseCsv', () => {
  it('parse des lignes simples', () => {
    expect(parseCsv('a,b\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
  it('gère les guillemets avec délimiteur interne', () => {
    expect(parseCsv('"a,b",c')).toEqual([['a,b', 'c']]);
  });
  it('gère les guillemets échappés ("")', () => {
    expect(parseCsv('"a""b",c')).toEqual([['a"b', 'c']]);
  });
  it('gère un saut de ligne dans un champ', () => {
    expect(parseCsv('"l1\nl2",b')).toEqual([['l1\nl2', 'b']]);
  });
  it('chaîne vide → aucune ligne', () => {
    expect(parseCsv('')).toEqual([]);
  });
  it('un champ vide entre guillemets reste une ligne', () => {
    expect(parseCsv('""')).toEqual([['']]);
  });
  it('dernière ligne réduite à un champ vide quoté', () => {
    expect(parseCsv('a\n""')).toEqual([['a'], ['']]);
  });
  it('un guillemet hors début de champ est littéral', () => {
    expect(parseCsv('a"b,c')).toEqual([['a"b', 'c']]);
  });
  it('ignore une ligne entièrement vide au milieu', () => {
    expect(parseCsv('a\n\nb')).toEqual([['a'], ['b']]);
  });
  it('ignore les lignes vides en tête et en fin', () => {
    expect(parseCsv('\n\na\n\n')).toEqual([['a']]);
  });
  it('gère les fins de ligne CRLF', () => {
    expect(parseCsv('a,b\r\n1,2')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
  it('conserve une ligne d’un seul champ vide quoté entre deux lignes', () => {
    expect(parseCsv('a\n""\nb')).toEqual([['a'], [''], ['b']]);
  });
});

describe('detectDelimiter', () => {
  it('détecte le point-virgule', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
  });
  it('ignore les délimiteurs à l’intérieur des guillemets', () => {
    expect(detectDelimiter('"a,b";c;d')).toBe(';');
  });
});

describe('toTable', () => {
  it('sépare en-tête et lignes, normalise les longueurs', () => {
    const table = toTable('name,age\nAnn,30\nBob', ',', true);
    expect(table.headers).toEqual(['name', 'age']);
    expect(table.rows).toEqual([
      ['Ann', '30'],
      ['Bob', ''],
    ]);
    expect(table.columnCount).toBe(2);
  });
  it('génère des en-têtes quand hasHeader est faux', () => {
    const table = toTable('1,2', ',', false);
    expect(table.headers).toEqual(['#1', '#2']);
    expect(table.rows).toEqual([['1', '2']]);
  });
});

describe('sortRows', () => {
  const rows = [
    ['Ann', '30'],
    ['Bob', '9'],
    ['Cid', '21'],
  ];
  it('trie numériquement une colonne de nombres', () => {
    expect(sortRows(rows, 1, 'asc').map((r) => r[1])).toEqual(['9', '21', '30']);
    expect(sortRows(rows, 1, 'desc').map((r) => r[1])).toEqual(['30', '21', '9']);
  });
  it('trie alphabétiquement une colonne texte', () => {
    expect(sortRows(rows, 0, 'desc').map((r) => r[0])).toEqual(['Cid', 'Bob', 'Ann']);
  });
  it('ne mute pas la source', () => {
    sortRows(rows, 1, 'asc');
    expect(rows[0][0]).toBe('Ann');
  });
  it('ne traite pas 0x10 / Infinity comme numériques (tri texte)', () => {
    const hex = [['0x10'], ['9'], ['100']];
    // Tri texte : '0x10' < '100' < '9' (ordre lexicographique).
    expect(sortRows(hex, 0, 'asc').map((r) => r[0])).toEqual(['0x10', '100', '9']);
  });
  it('relègue les cellules vides en fin, dans les deux sens', () => {
    const withGaps = [['30'], [''], ['9']];
    expect(sortRows(withGaps, 0, 'asc').map((r) => r[0])).toEqual(['9', '30', '']);
    expect(sortRows(withGaps, 0, 'desc').map((r) => r[0])).toEqual(['30', '9', '']);
  });
  it('relègue aussi les cellules vides en fin pour une colonne texte', () => {
    const withGaps = [['banane'], [''], ['avocat']];
    expect(sortRows(withGaps, 0, 'asc').map((r) => r[0])).toEqual(['avocat', 'banane', '']);
    expect(sortRows(withGaps, 0, 'desc').map((r) => r[0])).toEqual(['banane', 'avocat', '']);
  });
});
