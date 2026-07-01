/**
 * Règles heuristiques pour HTML (regex + appariement de balises par pile).
 */
import { posToLineCol, type LanguageLinter, type RawIssue, type Rule } from '../types';
import { reindentHtml } from '../format';

const imgAlt: Rule = {
  id: 'img-alt',
  labelKey: 'tools.codeLinter.rules.img-alt',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    const re = /<img\b[^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      if (!/\balt\s*=/i.test(m[0])) {
        issues.push({ ruleId: 'img-alt', ...posToLineCol(source, m.index) });
      }
    }
    return issues;
  },
};

const aNoHref: Rule = {
  id: 'a-no-href',
  labelKey: 'tools.codeLinter.rules.a-no-href',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    const re = /<a\b[^>]*>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      if (!/\bhref\s*=/i.test(m[0]) && !/\brole\s*=/i.test(m[0])) {
        issues.push({ ruleId: 'a-no-href', ...posToLineCol(source, m.index) });
      }
    }
    return issues;
  },
};

const duplicateId: Rule = {
  id: 'duplicate-id',
  labelKey: 'tools.codeLinter.rules.duplicate-id',
  defaultSeverity: 'error',
  check: (source) => {
    const issues: RawIssue[] = [];
    const seen = new Set<string>();
    const re = /\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const id = m[1] ?? m[2] ?? '';
      if (seen.has(id)) {
        issues.push({ ruleId: 'duplicate-id', ...posToLineCol(source, m.index), detail: id });
      } else {
        seen.add(id);
      }
    }
    return issues;
  },
};

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const unclosedTag: Rule = {
  id: 'unclosed-tag',
  labelKey: 'tools.codeLinter.rules.unclosed-tag',
  defaultSeverity: 'error',
  check: (source) => {
    const issues: RawIssue[] = [];
    const stack: { name: string; index: number }[] = [];
    const re = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const isClose = m[1] === '/';
      const name = m[2].toLowerCase();
      const selfClose = m[3] === '/';
      if (isClose) {
        if (stack.length > 0 && stack[stack.length - 1].name === name) stack.pop();
        else
          issues.push({ ruleId: 'unclosed-tag', ...posToLineCol(source, m.index), detail: name });
      } else if (!selfClose && !VOID_ELEMENTS.has(name)) {
        stack.push({ name, index: m.index });
      }
    }
    for (const open of stack) {
      issues.push({
        ruleId: 'unclosed-tag',
        ...posToLineCol(source, open.index),
        detail: open.name,
      });
    }
    return issues;
  },
};

export const htmlLinter: LanguageLinter = {
  id: 'html',
  labelKey: 'tools.codeLinter.languages.html',
  rules: [imgAlt, unclosedTag, duplicateId, aNoHref],
  format: (source) => reindentHtml(source),
};
