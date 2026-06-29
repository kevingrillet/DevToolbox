import { describe, it, expect } from 'vitest';
import { cssLinter } from './css';
import { runLint, defaultConfig } from '../types';

const ids = (src: string) => runLint(cssLinter, src, defaultConfig(cssLinter)).map((i) => i.ruleId);

describe('css linter', () => {
  it('no-important', () => expect(ids('a { color: red !important; }')).toContain('no-important'));
  it('duplicate-property', () =>
    expect(ids('a { color: red; color: blue; }')).toContain('duplicate-property'));
  it('missing-unit (valeur non nulle)', () =>
    expect(ids('a { width: 10; }')).toContain('missing-unit'));
  it('missing-unit ignore 0', () => expect(ids('a { width: 0; }')).not.toContain('missing-unit'));
  it('missing-unit ignore une propriété non dimensionnelle', () =>
    expect(ids('a { z-index: 10; }')).not.toContain('missing-unit'));
  it('duplicate-color (insensible à la casse)', () =>
    expect(ids('a { color: #fff; } b { background: #FFF; }')).toContain('duplicate-color'));
});
