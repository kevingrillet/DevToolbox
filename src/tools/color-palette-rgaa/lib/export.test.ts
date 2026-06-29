import { describe, it, expect } from 'vitest';
import { exportPalette } from './export';

const colors = ['#1d4ed8', '#ffffff'];

describe('exportPalette', () => {
  it('CSS : variables sous :root', () => {
    const out = exportPalette(colors, 'css');
    expect(out).toContain(':root {');
    expect(out).toContain('--color-1: #1d4ed8;');
    expect(out).toContain('--color-2: #ffffff;');
  });

  it('JSON : objet nommé', () => {
    expect(JSON.parse(exportPalette(colors, 'json'))).toEqual({
      'color-1': '#1d4ed8',
      'color-2': '#ffffff',
    });
  });

  it('Tailwind : extension de thème', () => {
    const out = exportPalette(colors, 'tailwind');
    expect(out).toContain('module.exports');
    expect(out).toContain("'color-1': '#1d4ed8'");
  });
});
