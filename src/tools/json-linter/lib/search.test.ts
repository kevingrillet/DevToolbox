import { describe, it, expect } from 'vitest';
import { buildTree } from './tree';
import { searchTree } from './search';

const data = { name: 'Alice', city: 'Paris', tags: ['admin', 'user'] };
const root = buildTree(data);

describe('searchTree', () => {
  it('recherche textuelle sur les clés', () => {
    expect(searchTree(root, data, 'name')).toContain('$.name');
  });
  it('recherche textuelle sur les valeurs (insensible à la casse)', () => {
    expect(searchTree(root, data, 'paris')).toContain('$.city');
  });
  it('trouve les valeurs de tableau', () => {
    expect(searchTree(root, data, 'admin')).toContain('$.tags[0]');
  });
  it('interprète un JSONPath', () => {
    expect(searchTree(root, data, '$.tags[1]')).toEqual(['$.tags[1]']);
  });
  it('requête vide → aucun résultat', () => {
    expect(searchTree(root, data, '  ')).toEqual([]);
  });
});
