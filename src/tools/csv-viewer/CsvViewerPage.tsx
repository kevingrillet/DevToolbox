/**
 * Page du visualiseur CSV : saisie/import, choix du délimiteur, en-tête, cache
 * optionnel, et table triable (clic sur un en-tête pour trier ; nouveau clic pour
 * inverser le sens).
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Callout } from '../../components/ui/Callout';
import { useCsvStore } from './useCsvStore';
import type { DelimiterChoice } from './useCsvStore';

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function CsvViewerPage() {
  const { t } = useI18n();
  const store = useCsvStore();
  const hasRows = store.sortedRows.length > 0;

  return (
    <section aria-labelledby="csv-title">
      <h1 id="csv-title" className="text-2xl font-bold">
        {t('tools.csv.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.csv.description')}</p>

      {/* Ligne de paramétrage AVANT le CSV. Les cases à cocher sont enveloppées
          dans une boîte `h-10` centrée pour s'aligner verticalement avec les
          boutons/menus de la même ligne. */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select
          label={t('tools.csv.delimiter')}
          value={store.delimiterChoice}
          onChange={(v) => store.setDelimiterChoice(v as DelimiterChoice)}
          options={[
            { value: 'auto', label: t('tools.csv.delimiters.auto') },
            { value: 'comma', label: t('tools.csv.delimiters.comma') },
            { value: 'semicolon', label: t('tools.csv.delimiters.semicolon') },
            { value: 'tab', label: t('tools.csv.delimiters.tab') },
          ]}
        />
        <div className="flex h-10 items-center">
          <Checkbox
            label={t('tools.csv.hasHeader')}
            checked={store.hasHeader}
            onChange={store.setHasHeader}
          />
        </div>
        <div className="flex h-10 items-center">
          <Checkbox
            label={t('common.cache')}
            checked={store.cacheEnabled}
            onChange={store.setCacheEnabled}
          />
        </div>
        <input
          id="csv-file"
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) store.setInputFile(file);
          }}
        />
        <label
          htmlFor="csv-file"
          className="inline-flex h-10 cursor-pointer items-center rounded-control border bg-surface px-3 text-sm font-medium text-fg transition hover:bg-subtle"
        >
          {t('tools.csv.importFile')}
        </label>
        <Button
          variant="secondary"
          disabled={!hasRows}
          onClick={() => download('export.csv', store.csvOutput, 'text/csv;charset=utf-8')}
        >
          {t('tools.csv.export')}
        </Button>
        <Button variant="ghost" onClick={store.reset}>
          {t('tools.csv.reset')}
        </Button>
      </div>

      <div className="mt-4">
        <Textarea
          label={t('tools.csv.input')}
          placeholder={t('tools.csv.inputPlaceholder')}
          value={store.input}
          onChange={(event) => store.setInput(event.target.value)}
          rows={6}
        />
      </div>

      {store.tooLarge && (
        <div className="mt-4">
          <Callout tone="warning" badge={t('tools.csv.tooLarge')}>
            {t('tools.csv.tooLargeHint')}
          </Callout>
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-card border bg-surface">
        {hasRows ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {store.table.headers.map((header, col) => {
                  const active = store.sortColumn === col;
                  return (
                    <th
                      key={col}
                      scope="col"
                      aria-sort={
                        active ? (store.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                      }
                      className="border-b bg-subtle p-0 text-left"
                    >
                      <button
                        type="button"
                        onClick={() => store.toggleSort(col)}
                        className="flex w-full items-center gap-1 px-3 py-2 font-semibold text-fg transition hover:bg-canvas"
                      >
                        <span>{header}</span>
                        <span aria-hidden="true" className="text-fg-muted">
                          {active ? (store.sortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {store.sortedRows.map((row, r) => (
                <tr key={r} className="even:bg-canvas/40">
                  {row.map((cell, c) => (
                    <td key={c} className="border-b px-3 py-1.5 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-fg-muted">{t('tools.csv.empty')}</p>
        )}
      </div>
    </section>
  );
}
