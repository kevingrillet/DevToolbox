/**
 * Store du linter de code (pattern Command/Query).
 *
 * La config des règles est mémorisée **par langage** (`configs[langId]`), si bien
 * que basculer de langage conserve les réglages de chacun. Les issues sont une
 * query dérivée (langage courant + source + config). Aucune persistance.
 */
import { useCallback, useMemo, useState } from 'react';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { readTextFile } from '../../lib/readTextFile';
import { LANGUAGES, LANGUAGES_BY_ID } from './lib/languages';
import {
  defaultConfig,
  runLint,
  type LanguageLinter,
  type LintIssue,
  type RuleConfig,
  type Severity,
} from './lib/types';

const FIRST = LANGUAGES[0];

function initConfigs(): Record<string, RuleConfig> {
  const configs: Record<string, RuleConfig> = {};
  for (const language of LANGUAGES) configs[language.id] = defaultConfig(language);
  return configs;
}

export interface CodeLinterStore {
  languageId: string;
  language: LanguageLinter;
  source: string;
  config: RuleConfig;
  issues: LintIssue[];
  counts: Record<Severity, number>;
  cacheEnabled: boolean;
  /** Le langage courant propose-t-il un reformatage ? */
  canFormat: boolean;
  setLanguage: (id: string) => void;
  setCacheEnabled: (value: boolean) => void;
  setSource: (text: string) => void;
  setSourceFile: (file: File) => void;
  toggleRule: (ruleId: string) => void;
  setRuleSeverity: (ruleId: string, severity: Severity) => void;
  resetConfig: () => void;
  /** Reformate la source via le reformateur du langage courant (no-op sinon). */
  format: () => void;
  reset: () => void;
}

export function useCodeLinterStore(): CodeLinterStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:code-linter:cache');
  const [languageId, setLanguageId] = useState(FIRST.id);
  const [source, setSource] = useCachedState('devtools:code-linter:source', cacheEnabled);
  const [configs, setConfigs] = useState<Record<string, RuleConfig>>(initConfigs);

  const language = LANGUAGES_BY_ID.get(languageId) ?? FIRST;
  const config = configs[languageId];

  // Le lint ne suit que la saisie stabilisée (la frappe reste fluide).
  const debouncedSource = useDebouncedValue(source);
  const issues = useMemo(
    () => runLint(language, debouncedSource, config),
    [language, debouncedSource, config],
  );

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { info: 0, warning: 0, error: 0 };
    for (const issue of issues) c[issue.severity]++;
    return c;
  }, [issues]);

  const setLanguage = useCallback((id: string) => setLanguageId(id), []);

  const setSourceFile = useCallback(
    (file: File) => {
      readTextFile(file, setSource);
    },
    [setSource],
  );

  const toggleRule = useCallback(
    (ruleId: string) =>
      setConfigs((prev) => ({
        ...prev,
        [languageId]: {
          ...prev[languageId],
          [ruleId]: { ...prev[languageId][ruleId], enabled: !prev[languageId][ruleId].enabled },
        },
      })),
    [languageId],
  );

  const setRuleSeverity = useCallback(
    (ruleId: string, severity: Severity) =>
      setConfigs((prev) => ({
        ...prev,
        [languageId]: {
          ...prev[languageId],
          [ruleId]: { ...prev[languageId][ruleId], severity },
        },
      })),
    [languageId],
  );

  const resetConfig = useCallback(
    () => setConfigs((prev) => ({ ...prev, [languageId]: defaultConfig(language) })),
    [languageId, language],
  );

  const canFormat = typeof language.format === 'function';
  const format = useCallback(() => {
    if (language.format) setSource(language.format(source));
  }, [language, source, setSource]);

  const reset = useCallback(() => setSource(''), [setSource]);

  return {
    languageId,
    language,
    source,
    config,
    issues,
    counts,
    cacheEnabled,
    canFormat,
    setLanguage,
    setCacheEnabled,
    setSource,
    setSourceFile,
    toggleRule,
    setRuleSeverity,
    resetConfig,
    format,
    reset,
  };
}
