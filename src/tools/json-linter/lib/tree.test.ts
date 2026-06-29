import { describe, it, expect } from 'vitest';
import { buildTree, flatten, jsonTypeOf, childPath } from './tree';

describe('buildTree', () => {
  it('type la racine et les enfants, construit les chemins', () => {
    const root = buildTree({ users: [{ name: 'Ann' }] });
    expect(root.type).toBe('object');
    const paths = flatten(root).map((n) => n.path);
    expect(paths).toEqual(
      expect.arrayContaining(['$', '$.users', '$.users[0]', '$.users[0].name']),
    );
    const nameNode = flatten(root).find((n) => n.path === '$.users[0].name');
    expect(nameNode?.type).toBe('string');
    expect(nameNode?.raw).toBe('Ann');
  });
});

describe('childPath', () => {
  it('gère index, clé simple et clé spéciale', () => {
    expect(childPath('$', 0)).toBe('$[0]');
    expect(childPath('$', 'a')).toBe('$.a');
    expect(childPath('$', 'a b')).toBe('$["a b"]');
  });
});

describe('jsonTypeOf', () => {
  it('distingue null, array et primitifs', () => {
    expect(jsonTypeOf(null)).toBe('null');
    expect(jsonTypeOf([])).toBe('array');
    expect(jsonTypeOf(1)).toBe('number');
    expect(jsonTypeOf('x')).toBe('string');
  });
});
