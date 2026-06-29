/**
 * Règles heuristiques pour C# (regex). Pédagogique.
 */
import { scan, type LanguageLinter, type Rule } from '../types';

const emptyCatch: Rule = {
  id: 'empty-catch',
  labelKey: 'tools.codeLinter.rules.empty-catch',
  defaultSeverity: 'warning',
  check: (source) => scan(source, /catch\s*(?:\([^)]*\))?\s*\{\s*\}/, 'empty-catch'),
};

const consoleWriteLine: Rule = {
  id: 'console-writeline',
  labelKey: 'tools.codeLinter.rules.console-writeline',
  defaultSeverity: 'warning',
  check: (source) => scan(source, /\bConsole\s*\.\s*WriteLine\b/, 'console-writeline'),
};

const todoComment: Rule = {
  id: 'todo-comment',
  labelKey: 'tools.codeLinter.rules.todo-comment',
  defaultSeverity: 'info',
  check: (source) =>
    scan(source, /\/\/\s*(TODO|FIXME)\b/i, 'todo-comment', (m) => m[1].toUpperCase()),
};

export const csharpLinter: LanguageLinter = {
  id: 'csharp',
  labelKey: 'tools.codeLinter.languages.csharp',
  rules: [emptyCatch, consoleWriteLine, todoComment],
};
