/**
 * Règles heuristiques pour Markdown (parcours de lignes + regex).
 */
import { posToLineCol, type LanguageLinter, type RawIssue, type Rule } from '../types';

const emptyLink: Rule = {
  id: 'empty-link',
  labelKey: 'tools.codeLinter.rules.empty-link',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    const re = /\[([^\]]*)\]\(([^)]*)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      if (m[1].trim() === '' || m[2].trim() === '') {
        issues.push({ ruleId: 'empty-link', ...posToLineCol(source, m.index) });
      }
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return issues;
  },
};

const headingSkip: Rule = {
  id: 'heading-skip',
  labelKey: 'tools.codeLinter.rules.heading-skip',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    let previous = 0;
    source.split('\n').forEach((line, i) => {
      const m = /^(#{1,6})\s/.exec(line);
      if (!m) return;
      const level = m[1].length;
      if (previous > 0 && level > previous + 1) {
        issues.push({
          ruleId: 'heading-skip',
          line: i + 1,
          column: 1,
          detail: `#${previous} → #${level}`,
        });
      }
      previous = level;
    });
    return issues;
  },
};

const codeFenceNoLang: Rule = {
  id: 'code-fence-no-lang',
  labelKey: 'tools.codeLinter.rules.code-fence-no-lang',
  defaultSeverity: 'info',
  check: (source) => {
    const issues: RawIssue[] = [];
    let inFence = false;
    source.split('\n').forEach((line, i) => {
      const m = /^\s*```(.*)$/.exec(line);
      if (!m) return;
      if (!inFence) {
        if (m[1].trim() === '') {
          issues.push({ ruleId: 'code-fence-no-lang', line: i + 1, column: 1 });
        }
        inFence = true;
      } else {
        inFence = false;
      }
    });
    return issues;
  },
};

export const markdownLinter: LanguageLinter = {
  id: 'markdown',
  labelKey: 'tools.codeLinter.languages.markdown',
  rules: [emptyLink, headingSkip, codeFenceNoLang],
};
