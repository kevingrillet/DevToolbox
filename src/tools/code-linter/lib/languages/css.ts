/**
 * Règles heuristiques pour CSS (regex + découpage en blocs simples).
 */
import { posToLineCol, scan, type LanguageLinter, type RawIssue, type Rule } from '../types';
import { reindentBrackets } from '../format';

const noImportant: Rule = {
  id: 'no-important',
  labelKey: 'tools.codeLinter.rules.no-important',
  defaultSeverity: 'warning',
  check: (source) => scan(source, /!important/i, 'no-important'),
};

const BLOCK = /\{([^{}]*)\}/g;

const duplicateProperty: Rule = {
  id: 'duplicate-property',
  labelKey: 'tools.codeLinter.rules.duplicate-property',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    let block: RegExpExecArray | null;
    BLOCK.lastIndex = 0;
    while ((block = BLOCK.exec(source)) !== null) {
      const seen = new Set<string>();
      let offset = block.index + 1; // après la {
      for (const decl of block[1].split(';')) {
        const colon = decl.indexOf(':');
        if (colon !== -1) {
          const prop = decl.slice(0, colon).trim().toLowerCase();
          if (prop && seen.has(prop)) {
            issues.push({
              ruleId: 'duplicate-property',
              ...posToLineCol(source, offset + decl.indexOf(prop[0])),
              detail: prop,
            });
          } else if (prop) {
            seen.add(prop);
          }
        }
        offset += decl.length + 1; // +1 pour le ;
      }
    }
    return issues;
  },
};

const LENGTH_PROPS = new Set([
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'top',
  'right',
  'bottom',
  'left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-size',
  'border-radius',
  'gap',
  'column-gap',
  'row-gap',
]);

const missingUnit: Rule = {
  id: 'missing-unit',
  labelKey: 'tools.codeLinter.rules.missing-unit',
  defaultSeverity: 'warning',
  check: (source) => {
    const issues: RawIssue[] = [];
    const re = /([\w-]+)\s*:\s*(-?\d*\.?\d+)\s*(?=[;}])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const prop = m[1].toLowerCase();
      if (LENGTH_PROPS.has(prop) && parseFloat(m[2]) !== 0) {
        issues.push({
          ruleId: 'missing-unit',
          ...posToLineCol(source, m.index),
          detail: `${m[1]}: ${m[2]}`,
        });
      }
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    return issues;
  },
};

const duplicateColor: Rule = {
  id: 'duplicate-color',
  labelKey: 'tools.codeLinter.rules.duplicate-color',
  defaultSeverity: 'info',
  check: (source) => {
    const issues: RawIssue[] = [];
    const counts = new Map<string, number>();
    const re = /#[0-9a-fA-F]{3,8}\b/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const color = m[0].toLowerCase();
      const n = (counts.get(color) ?? 0) + 1;
      counts.set(color, n);
      if (n === 2) {
        issues.push({ ruleId: 'duplicate-color', ...posToLineCol(source, m.index), detail: color });
      }
    }
    return issues;
  },
};

export const cssLinter: LanguageLinter = {
  id: 'css',
  labelKey: 'tools.codeLinter.languages.css',
  rules: [noImportant, duplicateProperty, missingUnit, duplicateColor],
  // CSS n'a que des commentaires de bloc `/* */` (pas de `//` ni de gabarits).
  format: (source) => reindentBrackets(source, { blockComment: ['/*', '*/'] }),
};
