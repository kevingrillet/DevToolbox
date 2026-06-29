/**
 * Page de l'outil Hash / Checksum.
 *
 * Présentation pure : câble `useHashChecksumStore` (texte/fichier → empreintes
 * dérivées, comparaison) au design system. La saisie d'un fichier se fait par
 * sélecteur natif OU glisser-déposer ; l'empreinte qui correspond au hash attendu
 * est mise en évidence.
 */
import { useState, type DragEvent } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../lib/cx';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { CopyButton } from '../../components/ui/CopyButton';
import { useHashChecksumStore } from './useHashChecksumStore';

export default function HashChecksumPage() {
  const { t } = useI18n();
  const store = useHashChecksumStore();
  const { results, computing, comparison } = store;
  const [dragOver, setDragOver] = useState(false);

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) store.setFile(file);
  }

  const matchedLabel =
    comparison?.matchedId != null
      ? results?.find((r) => r.id === comparison.matchedId)?.label
      : undefined;

  return (
    <section aria-labelledby="hash-title">
      <h1 id="hash-title" className="text-2xl font-bold">
        {t('tools.hashChecksum.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.hashChecksum.description')}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Source */}
        <div className="flex flex-col gap-4">
          <Textarea
            label={t('tools.hashChecksum.textLabel')}
            placeholder={t('tools.hashChecksum.textPlaceholder')}
            value={store.text}
            onChange={(event) => store.setText(event.target.value)}
            rows={6}
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cx(
              'rounded-card border border-dashed p-6 text-center transition',
              dragOver && 'bg-subtle',
            )}
          >
            <input
              id="hash-file"
              type="file"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) store.setFile(file);
              }}
            />
            <label
              htmlFor="hash-file"
              className="inline-flex cursor-pointer items-center rounded-control bg-accent px-4 py-2 text-sm font-medium text-accent-fg shadow-btn transition hover:bg-accent-hover"
            >
              {t('tools.hashChecksum.chooseFile')}
            </label>
            <p className="mt-2 text-xs text-fg-muted">{t('tools.hashChecksum.orDrop')}</p>
            {store.fileName && (
              <p className="mt-3 text-sm font-medium text-fg">
                {store.fileName}
                {store.fileSize != null && (
                  <span className="text-fg-muted">
                    {' · '}
                    {store.fileSize} {t('tools.hashChecksum.bytesUnit')}
                  </span>
                )}
              </p>
            )}
          </div>

          <div>
            <Button variant="ghost" onClick={store.reset}>
              {t('tools.hashChecksum.reset')}
            </Button>
          </div>
        </div>

        {/* Résultats + comparateur */}
        <div className="flex flex-col gap-4">
          <Input
            label={t('tools.hashChecksum.expectedLabel')}
            placeholder={t('tools.hashChecksum.expectedPlaceholder')}
            value={store.expected}
            onChange={(event) => store.setExpected(event.target.value)}
          />
          <div aria-live="polite">
            {comparison && comparison.normalized !== '' && (
              <>
                {comparison.matchedId != null ? (
                  <Badge variant="success">
                    {t('tools.hashChecksum.match')} {matchedLabel}
                  </Badge>
                ) : (
                  <Badge variant="danger">{t('tools.hashChecksum.noMatch')}</Badge>
                )}
              </>
            )}
          </div>

          <Panel title={t('tools.hashChecksum.results')} titleLevel={2}>
            {computing && (
              <p className="text-sm text-fg-muted">{t('tools.hashChecksum.computing')}</p>
            )}
            {!computing && !results && (
              <p className="text-sm text-fg-muted">{t('tools.hashChecksum.empty')}</p>
            )}
            {!computing && results && (
              <ul className="divide-y">
                {results.map((result) => {
                  const matched = comparison?.matchedId === result.id;
                  return (
                    <li
                      key={result.id}
                      className={cx(
                        'flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0',
                        matched && 'rounded-control bg-accent-soft px-2',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-semibold text-fg">
                          {result.label}
                          {matched && <Badge variant="success">✓</Badge>}
                        </div>
                        <code className="block break-all text-xs text-fg-muted">{result.hex}</code>
                      </div>
                      <CopyButton
                        value={result.hex}
                        label={t('tools.hashChecksum.copy')}
                        copiedLabel={t('tools.hashChecksum.copied')}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}
