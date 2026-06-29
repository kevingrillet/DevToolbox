import { describe, it, expect } from 'vitest';
import { csharpLinter } from './csharp';
import { runLint, defaultConfig } from '../types';

const ids = (src: string) =>
  runLint(csharpLinter, src, defaultConfig(csharpLinter)).map((i) => i.ruleId);

describe('csharp linter', () => {
  it('empty-catch', () =>
    expect(ids('try { F(); } catch (Exception e) {}')).toContain('empty-catch'));
  it('console-writeline', () =>
    expect(ids('Console.WriteLine("x");')).toContain('console-writeline'));
  it('todo-comment', () => expect(ids('// TODO: refactor')).toContain('todo-comment'));
  it('code propre non flagué', () => expect(ids('int x = 1;')).toEqual([]));
});
