import { describe, it, expect } from 'vitest';
import { javascriptLinter } from './javascript';
import { runLint, defaultConfig } from '../types';

const lint = (src: string) => runLint(javascriptLinter, src, defaultConfig(javascriptLinter));
const ids = (src: string) => lint(src).map((i) => i.ruleId);

describe('javascript linter', () => {
  it('no-var', () => expect(ids('var x = 1;')).toContain('no-var'));
  it('no-console', () => expect(ids('console.log(1);')).toContain('no-console'));
  it('eqeqeq sur ==', () => expect(ids('if (a == b) {}')).toContain('eqeqeq'));
  it('eqeqeq sur !=', () => expect(ids('if (a != b) {}')).toContain('eqeqeq'));
  it('ne flague pas === / !==', () =>
    expect(ids('if (a === b || c !== d) {}')).not.toContain('eqeqeq'));
  it('no-debugger', () => expect(ids('debugger;')).toContain('no-debugger'));
  it('semi : déclaration sans point-virgule', () => expect(ids('const x = 1')).toContain('semi'));
  it('semi : ligne terminée non flaguée', () => expect(ids('let y = 2;')).not.toContain('semi'));
  it('no-unused-vars : variable utilisée une seule fois', () => {
    const issue = lint('const lonely = 2;').find((i) => i.ruleId === 'no-unused-vars');
    expect(issue?.detail).toBe('lonely');
  });
  it('no-unused-vars : variable réutilisée non flaguée', () =>
    expect(ids('const used = 1;\nconsole.log(used);')).not.toContain('no-unused-vars'));
});
