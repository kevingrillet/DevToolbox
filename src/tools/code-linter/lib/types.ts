/**
 * Contrats du linter de code (pattern Strategy + Registry).
 *
 * Chaque langage est un `LanguageLinter` exposant une liste de `Rule`. Une règle
 * renvoie des `RawIssue` (sans sévérité ni texte) : le runner applique la config
 * (activation + sévérité) et l'UI traduit le message via `ruleId`. Ajouter un
 * langage = un plugin + une entrée au registre, sans toucher à l'UI.
 *
 * Les règles sont des **heuristiques** (regex / parsing léger) : c'est un linter
 * pédagogique, pas un remplaçant d'ESLint / Stylelint.
 */
export type Severity = 'info' | 'warning' | 'error';

export interface RawIssue {
  ruleId: string;
  line: number;
  column: number;
  /** Complément facultatif (nom de variable, valeur en cause…). */
  detail?: string;
}

export interface LintIssue extends RawIssue {
  severity: Severity;
}

export interface Rule {
  id: string;
  /** Clé i18n du libellé de la règle. */
  labelKey: string;
  defaultSeverity: Severity;
  check(source: string): RawIssue[];
}

export interface LanguageLinter {
  id: string;
  labelKey: string;
  rules: Rule[];
}

export interface RuleSetting {
  enabled: boolean;
  severity: Severity;
}

export type RuleConfig = Record<string, RuleSetting>;

/** Position 1-based (ligne / colonne) d'un index dans la source. */
export function posToLineCol(source: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(index, source.length);
  for (let k = 0; k < end; k++) {
    if (source[k] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

/** Scanne toutes les occurrences d'une regex et produit un `RawIssue` par match. */
export function scan(
  source: string,
  regex: RegExp,
  ruleId: string,
  makeDetail?: (m: RegExpExecArray) => string | undefined,
): RawIssue[] {
  const out: RawIssue[] = [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    const { line, column } = posToLineCol(source, m.index);
    out.push({ ruleId, line, column, detail: makeDetail?.(m) });
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  return out;
}

/** Config par défaut d'un langage (toutes règles activées, sévérité par défaut). */
export function defaultConfig(language: LanguageLinter): RuleConfig {
  const config: RuleConfig = {};
  for (const rule of language.rules) {
    config[rule.id] = { enabled: true, severity: rule.defaultSeverity };
  }
  return config;
}

/** Exécute les règles activées et applique les sévérités configurées. */
export function runLint(language: LanguageLinter, source: string, config: RuleConfig): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const rule of language.rules) {
    const setting = config[rule.id] ?? { enabled: true, severity: rule.defaultSeverity };
    if (!setting.enabled) continue;
    for (const raw of rule.check(source)) {
      issues.push({ ...raw, severity: setting.severity });
    }
  }
  issues.sort((a, b) => a.line - b.line || a.column - b.column);
  return issues;
}
