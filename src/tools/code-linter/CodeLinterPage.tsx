/**
 * Page du linter de code. Présentation pure : sélecteur de langage, source,
 * panneau de configuration des règles (activation + sévérité) et liste des
 * problèmes groupés par sévérité, avec ligne/colonne.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Checkbox } from '../../components/ui/Checkbox';
import { Panel } from '../../components/ui/Panel';
import { Callout } from '../../components/ui/Callout';
import { Accordion } from '../../components/ui/Accordion';
import { LANGUAGES } from './lib/languages';
import { useCodeLinterStore } from './useCodeLinterStore';
import type { Severity } from './lib/types';

const SEVERITY_VARIANT: Record<Severity, 'danger' | 'warning' | 'accent'> = {
  error: 'danger',
  warning: 'warning',
  info: 'accent',
};
const SEVERITY_ORDER: Severity[] = ['error', 'warning', 'info'];

export default function CodeLinterPage() {
  const { t } = useI18n();
  const store = useCodeLinterStore();

  const labelOf = (ruleId: string) => {
    const rule = store.language.rules.find((r) => r.id === ruleId);
    return rule ? t(rule.labelKey) : ruleId;
  };

  const severityOptions = SEVERITY_ORDER.map((s) => ({
    value: s,
    label: t(`tools.codeLinter.severities.${s}`),
  }));

  const rulesContent = (
    <div className="flex flex-col gap-3">
      {store.language.rules.map((rule) => (
        <div key={rule.id} className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox
            label={t(rule.labelKey)}
            checked={store.config[rule.id].enabled}
            onChange={() => store.toggleRule(rule.id)}
          />
          <Select
            label=""
            value={store.config[rule.id].severity}
            onChange={(value) => store.setRuleSeverity(rule.id, value as Severity)}
            options={severityOptions}
            aria-label={`${t('tools.codeLinter.severity')} — ${t(rule.labelKey)}`}
          />
        </div>
      ))}
      <div>
        <Button size="sm" variant="ghost" onClick={store.resetConfig}>
          {t('tools.codeLinter.resetRules')}
        </Button>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="lint-title">
      <h1 id="lint-title" className="text-2xl font-bold">
        {t('tools.codeLinter.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.codeLinter.description')}</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select
          label={t('tools.codeLinter.language')}
          value={store.languageId}
          onChange={store.setLanguage}
          options={LANGUAGES.map((l) => ({ value: l.id, label: t(l.labelKey) }))}
        />
        <input
          id="lint-file"
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) store.setSourceFile(file);
          }}
        />
        <label
          htmlFor="lint-file"
          className="inline-flex cursor-pointer items-center rounded-control border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-subtle"
        >
          {t('tools.codeLinter.importFile')}
        </label>
        {store.canFormat && (
          <Button variant="secondary" disabled={store.source === ''} onClick={store.format}>
            {t('tools.codeLinter.reformat')}
          </Button>
        )}
        <Button variant="ghost" onClick={store.reset}>
          {t('tools.codeLinter.reset')}
        </Button>
        <Checkbox
          label={t('common.cache')}
          checked={store.cacheEnabled}
          onChange={store.setCacheEnabled}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Textarea
          label={t('tools.codeLinter.source')}
          placeholder={t('tools.codeLinter.sourcePlaceholder')}
          value={store.source}
          onChange={(event) => store.setSource(event.target.value)}
          rows={18}
        />

        <div className="flex flex-col gap-4">
          <Accordion
            items={[
              { id: 'rules', title: t('tools.codeLinter.rulesPanel'), content: rulesContent },
            ]}
          />

          <Panel id="lint-results" title={t('tools.codeLinter.results')}>
            {/* Résumé concis annoncé aux lecteurs d'écran (la liste détaillée
                reste consultable au clavier, sans la réciter en entier). */}
            <p className="sr-only" role="status">
              {store.issues.length === 0
                ? t('tools.codeLinter.noIssues')
                : `${store.issues.length} ${t('tools.codeLinter.results')}`}
            </p>
            {store.tooLarge ? (
              <Callout tone="warning" badge={t('tools.codeLinter.tooLarge')}>
                {t('tools.codeLinter.tooLargeHint')}
              </Callout>
            ) : store.issues.length === 0 ? (
              <p className="text-sm text-fg-muted">{t('tools.codeLinter.noIssues')}</p>
            ) : (
              <div className="flex flex-col gap-4">
                {SEVERITY_ORDER.filter((s) => store.counts[s] > 0).map((severity) => (
                  <div key={severity}>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={SEVERITY_VARIANT[severity]}>
                        {t(`tools.codeLinter.severities.${severity}`)}
                      </Badge>
                      <span className="text-sm text-fg-muted">{store.counts[severity]}</span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {store.issues
                        .filter((issue) => issue.severity === severity)
                        .map((issue, i) => (
                          <li
                            key={`${issue.ruleId}-${issue.line}-${issue.column}-${i}`}
                            className="text-sm"
                          >
                            <span className="font-mono text-xs text-fg-muted">
                              {t('tools.codeLinter.line')} {issue.line},{' '}
                              {t('tools.codeLinter.column')} {issue.column}
                            </span>{' '}
                            — {labelOf(issue.ruleId)}
                            {issue.detail && (
                              <span className="text-fg-muted"> ({issue.detail})</span>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}
