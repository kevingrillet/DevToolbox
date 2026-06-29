import { describe, it, expect } from 'vitest';
import { runLint, defaultConfig } from './types';
import { javascriptLinter } from './languages/javascript';

describe('runLint', () => {
  it('ignore les règles désactivées', () => {
    const config = defaultConfig(javascriptLinter);
    config['no-var'].enabled = false;
    const ids = runLint(javascriptLinter, 'var x = 1;\nconsole.log(2);', config).map(
      (i) => i.ruleId,
    );
    expect(ids).not.toContain('no-var');
    expect(ids).toContain('no-console');
  });

  it('applique la sévérité configurée', () => {
    const config = defaultConfig(javascriptLinter);
    config['no-console'].severity = 'error';
    const issue = runLint(javascriptLinter, 'console.log(1);', config).find(
      (i) => i.ruleId === 'no-console',
    );
    expect(issue?.severity).toBe('error');
  });

  it('trie par ligne puis colonne', () => {
    const issues = runLint(
      javascriptLinter,
      'console.log(1);\nvar x = 1;',
      defaultConfig(javascriptLinter),
    );
    for (let i = 1; i < issues.length; i++) {
      const prev = issues[i - 1];
      const cur = issues[i];
      expect(prev.line < cur.line || (prev.line === cur.line && prev.column <= cur.column)).toBe(
        true,
      );
    }
  });
});
