import { describe, it, expect } from 'vitest';
import { TOOLS, findToolByPath } from './registry';

describe('registry', () => {
  it('expose un tableau d’outils (vide en v0)', () => {
    expect(Array.isArray(TOOLS)).toBe(true);
  });

  it('garantit des id et des routes uniques', () => {
    expect(new Set(TOOLS.map((tool) => tool.id)).size).toBe(TOOLS.length);
    expect(new Set(TOOLS.map((tool) => tool.path)).size).toBe(TOOLS.length);
  });

  it('chaque route commence par « / »', () => {
    for (const tool of TOOLS) {
      expect(tool.path.startsWith('/')).toBe(true);
    }
  });

  it('findToolByPath renvoie undefined pour une route inconnue', () => {
    expect(findToolByPath('/inconnu')).toBeUndefined();
  });
});
