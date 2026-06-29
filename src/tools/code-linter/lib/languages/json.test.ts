import { describe, it, expect } from 'vitest';
import { jsonLinter } from './json';
import { runLint, defaultConfig } from '../types';

const lint = (src: string) => runLint(jsonLinter, src, defaultConfig(jsonLinter));
const ids = (src: string) => lint(src).map((i) => i.ruleId);

describe('json linter', () => {
  it('JSON valide → aucun problème', () => expect(ids('{"a":1}')).toEqual([]));
  it('JSON invalide → json-syntax avec position', () => {
    const issue = lint('{"a":1,}').find((i) => i.ruleId === 'json-syntax');
    expect(issue).toBeDefined();
    expect(issue?.line).toBe(1);
    expect(issue?.column).toBe(8);
  });
  it('vide → aucun problème', () => expect(ids('   ')).toEqual([]));
});
