/**
 * Page du JSON Linter / Viewer. Présentation pure : entrée + validation localisée
 * + reformatage/minification à gauche ; recherche (texte ou JSONPath) avec
 * navigation, arbre repliable typé et copie du nœud sélectionné à droite.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Badge } from '../../components/ui/Badge';
import { Callout } from '../../components/ui/Callout';
import { CopyButton } from '../../components/ui/CopyButton';
import { useJsonLinterStore } from './useJsonLinterStore';
import { JsonTreeView } from './components/JsonTreeView';

export default function JsonLinterPage() {
  const { t } = useI18n();
  const store = useJsonLinterStore();
  const hasQuery = store.query.trim() !== '';

  return (
    <section aria-labelledby="json-title">
      <h1 id="json-title" className="text-2xl font-bold">
        {t('tools.json.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.json.description')}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Entrée + validation */}
        <div className="flex flex-col gap-3">
          <Textarea
            label={t('tools.json.input')}
            placeholder={t('tools.json.inputPlaceholder')}
            value={store.input}
            onChange={(event) => store.setInput(event.target.value)}
            rows={14}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="json-file"
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) store.setInputFile(file);
              }}
            />
            <label
              htmlFor="json-file"
              className="inline-flex cursor-pointer items-center rounded-control border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-subtle"
            >
              {t('tools.json.importFile')}
            </label>
            <Button size="sm" variant="secondary" onClick={store.format} disabled={!store.valid}>
              {t('tools.json.format')}
            </Button>
            <Button size="sm" variant="secondary" onClick={store.minify} disabled={!store.valid}>
              {t('tools.json.minify')}
            </Button>
            <Button size="sm" variant="ghost" onClick={store.reset}>
              {t('tools.json.reset')}
            </Button>
            <Checkbox
              label={t('common.cache')}
              checked={store.cacheEnabled}
              onChange={store.setCacheEnabled}
            />
          </div>

          {store.tooLarge && (
            <Callout tone="warning" badge={t('tools.json.tooLarge')}>
              {t('tools.json.tooLargeHint')}
            </Callout>
          )}
          {store.valid && <Badge variant="success">{t('tools.json.valid')}</Badge>}
          {store.warnings.length > 0 && (
            <Callout tone="warning" badge={t('tools.json.precision')}>
              {t('tools.json.precisionHint')}{' '}
              {store.warnings
                .map((w) => `${t('tools.json.line').toLowerCase()} ${w.line}`)
                .join(', ')}
              .
            </Callout>
          )}
          {store.error && (
            <Callout tone="danger" badge={t('tools.json.invalid')}>
              {t('tools.json.line')} {store.error.line}, {t('tools.json.column')}{' '}
              {store.error.column} — {store.error.message}
            </Callout>
          )}
        </div>

        {/* Recherche + arbre */}
        <div className="flex flex-col gap-3">
          <Input
            label={t('tools.json.search')}
            placeholder={t('tools.json.searchPlaceholder')}
            value={store.query}
            onChange={(event) => store.setQuery(event.target.value)}
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-fg-muted" role="status">
              {hasQuery && store.matches.length === 0
                ? t('tools.json.noMatches')
                : `${store.matches.length ? store.matchPosition + 1 : 0}/${store.matches.length}`}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={store.prevMatch}
              disabled={store.matches.length === 0}
            >
              {t('tools.json.prev')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={store.nextMatch}
              disabled={store.matches.length === 0}
            >
              {t('tools.json.next')}
            </Button>
            <span className="grow" />
            <Button size="sm" variant="ghost" onClick={store.expandAll} disabled={!store.tree}>
              {t('tools.json.expandAll')}
            </Button>
            <Button size="sm" variant="ghost" onClick={store.collapseAll} disabled={!store.tree}>
              {t('tools.json.collapseAll')}
            </Button>
          </div>

          <div className="flex justify-end">
            <CopyButton
              value={store.selectedJson}
              label={t('tools.json.copyNode')}
              copiedLabel={t('tools.json.copied')}
            />
          </div>

          <div className="max-h-[28rem] overflow-auto rounded-card border bg-surface p-3">
            {store.tree ? (
              <JsonTreeView
                node={store.tree}
                isOpen={store.isOpen}
                onToggle={store.toggleNode}
                onSelect={store.selectNode}
                matchSet={store.matchSet}
                selected={store.selected}
              />
            ) : (
              <p className="text-sm text-fg-muted">{t('tools.json.empty')}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
