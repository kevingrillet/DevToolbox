/**
 * Règles heuristiques pour JS/TS (regex + parcours de lignes). Pédagogique :
 * pas d'analyse de portée complète.
 */
import { posToLineCol, scan, type LanguageLinter, type RawIssue, type Rule } from '../types';
import { reindentBrackets } from '../format';

const noVar: Rule = {
  id: 'no-var',
  labelKey: 'tools.codeLinter.rules.no-var',
  defaultSeverity: 'warning',
  check: (source) => scan(source, /\bvar\b/, 'no-var'),
};

const noConsole: Rule = {
  id: 'no-console',
  labelKey: 'tools.codeLinter.rules.no-console',
  defaultSeverity: 'warning',
  check: (source) => scan(source, /\bconsole\s*\.\s*(?:log|debug|info)\b/, 'no-console'),
};

const eqeqeq: Rule = {
  id: 'eqeqeq',
  labelKey: 'tools.codeLinter.rules.eqeqeq',
  defaultSeverity: 'warning',
  check: (source) => [
    ...scan(source, /(?<![=!<>])==(?!=)/, 'eqeqeq'),
    ...scan(source, /!=(?!=)/, 'eqeqeq'),
  ],
};

const noDebugger: Rule = {
  id: 'no-debugger',
  labelKey: 'tools.codeLinter.rules.no-debugger',
  defaultSeverity: 'error',
  check: (source) => scan(source, /\bdebugger\b/, 'no-debugger'),
};

const STATEMENT = /^(const|let|var|return|throw|break|continue)\b/;
const CONTINUATION = /[{([,:?&|+\-*/%<>=]$/;

const semi: Rule = {
  id: 'semi',
  labelKey: 'tools.codeLinter.rules.semi',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    source.split('\n').forEach((rawLine, i) => {
      const line = rawLine.trim();
      if (!STATEMENT.test(line)) return;
      if (line.endsWith(';') || line.endsWith('=>') || CONTINUATION.test(line)) return;
      issues.push({ ruleId: 'semi', line: i + 1, column: rawLine.length + 1 });
    });
    return issues;
  },
};

const DECLARATION = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;

const noUnusedVars: Rule = {
  id: 'no-unused-vars',
  labelKey: 'tools.codeLinter.rules.no-unused-vars',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    let m: RegExpExecArray | null;
    DECLARATION.lastIndex = 0;
    while ((m = DECLARATION.exec(source)) !== null) {
      const name = m[1];
      const occurrences = source.match(new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`, 'g'));
      if (occurrences && occurrences.length === 1) {
        const at = m.index + m[0].indexOf(name);
        issues.push({ ruleId: 'no-unused-vars', ...posToLineCol(source, at), detail: name });
      }
    }
    return issues;
  },
};

export const javascriptLinter: LanguageLinter = {
  id: 'javascript',
  labelKey: 'tools.codeLinter.languages.javascript',
  rules: [noVar, noConsole, eqeqeq, noUnusedVars, semi, noDebugger],
  format: (source) =>
    reindentBrackets(source, {
      lineComment: '//',
      blockComment: ['/*', '*/'],
      template: true,
    }),
};
