/**
 * Règles heuristiques pour YAML (parcours de lignes).
 */
import { type LanguageLinter, type RawIssue, type Rule } from '../types';

const noTabs: Rule = {
  id: 'no-tabs',
  labelKey: 'tools.codeLinter.rules.no-tabs',
  defaultSeverity: 'error',
  check: (source) => {
    const issues: RawIssue[] = [];
    source.split('\n').forEach((line, i) => {
      const lead = /^\s*/.exec(line)?.[0] ?? '';
      const tab = lead.indexOf('\t');
      if (tab !== -1) issues.push({ ruleId: 'no-tabs', line: i + 1, column: tab + 1 });
    });
    return issues;
  },
};

const missingSpaceAfterColon: Rule = {
  id: 'missing-space-after-colon',
  labelKey: 'tools.codeLinter.rules.missing-space-after-colon',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    source.split('\n').forEach((line, i) => {
      const m = /^(\s*[\w.-]+):([^\s/])/.exec(line);
      if (m) {
        issues.push({
          ruleId: 'missing-space-after-colon',
          line: i + 1,
          column: m[1].length + 1,
          detail: m[1].trim(),
        });
      }
    });
    return issues;
  },
};

const duplicateKey: Rule = {
  id: 'duplicate-key',
  labelKey: 'tools.codeLinter.rules.duplicate-key',
  defaultSeverity: 'error',
  check: (source) => {
    const issues: RawIssue[] = [];
    const seen = new Set<string>();
    source.split('\n').forEach((line, i) => {
      const m = /^([\w.-]+):/.exec(line); // clé au niveau racine
      if (!m) return;
      if (seen.has(m[1])) {
        issues.push({ ruleId: 'duplicate-key', line: i + 1, column: 1, detail: m[1] });
      } else {
        seen.add(m[1]);
      }
    });
    return issues;
  },
};

export const yamlLinter: LanguageLinter = {
  id: 'yaml',
  labelKey: 'tools.codeLinter.languages.yaml',
  rules: [noTabs, missingSpaceAfterColon, duplicateKey],
};
