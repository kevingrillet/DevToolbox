/**
 * Page du comparateur de texte. Présentation pure : deux zones (saisie ou import
 * de fichier), contrôles de granularité / options / vue, statistiques, et le
 * `DiffView` qui consomme le `DiffOp[]` du store.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Callout } from '../../components/ui/Callout';
import { useTextDiffStore } from './useTextDiffStore';
import { DiffView } from './components/DiffView';
import { LineNumberedTextarea } from './components/LineNumberedTextarea';

export default function TextDiffPage() {
  const { t } = useI18n();
  const store = useTextDiffStore();

  return (
    <section aria-labelledby="diff-title">
      <h1 id="diff-title" className="text-2xl font-bold">
        {t('tools.diff.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.diff.description')}</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Select
          label={t('tools.diff.granularity')}
          value={store.granularity}
          onChange={(v) => store.setGranularity(v as 'char' | 'word' | 'line')}
          options={[
            { value: 'char', label: t('tools.diff.granularities.char') },
            { value: 'word', label: t('tools.diff.granularities.word') },
            { value: 'line', label: t('tools.diff.granularities.line') },
          ]}
        />
        <Select
          label={t('tools.diff.view')}
          value={store.view}
          onChange={(v) => store.setView(v as 'split' | 'unified')}
          options={[
            { value: 'unified', label: t('tools.diff.views.unified') },
            { value: 'split', label: t('tools.diff.views.split') },
          ]}
        />
        <div className="flex flex-col gap-1 pb-1">
          <Checkbox
            label={t('tools.diff.ignoreCase')}
            checked={store.ignoreCase}
            onChange={store.setIgnoreCase}
          />
          <Checkbox
            label={t('tools.diff.ignoreWhitespace')}
            checked={store.ignoreWhitespace}
            onChange={store.setIgnoreWhitespace}
          />
        </div>
        <div className="flex flex-col gap-1 pb-1">
          <Checkbox
            label={t('common.cache')}
            checked={store.cacheEnabled}
            onChange={store.setCacheEnabled}
          />
        </div>
        <Button variant="secondary" onClick={store.sortLines}>
          ↕ {t('tools.diff.sortLines')}
        </Button>
        <Button variant="secondary" onClick={store.swap}>
          ⇄ {t('tools.diff.swap')}
        </Button>
        <Button variant="ghost" onClick={store.reset}>
          {t('tools.diff.reset')}
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <LineNumberedTextarea
            label={t('tools.diff.before')}
            placeholder={t('tools.diff.beforePlaceholder')}
            value={store.left}
            onChange={store.setLeft}
            rows={8}
          />
          <FileImport
            label={t('tools.diff.importFile')}
            id="diff-left-file"
            onFile={store.setLeftFile}
          />
        </div>
        <div className="flex flex-col gap-2">
          <LineNumberedTextarea
            label={t('tools.diff.after')}
            placeholder={t('tools.diff.afterPlaceholder')}
            value={store.right}
            onChange={store.setRight}
            rows={8}
          />
          <FileImport
            label={t('tools.diff.importFile')}
            id="diff-right-file"
            onFile={store.setRightFile}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <h2 className="text-lg font-semibold">{t('tools.diff.result')}</h2>
        {store.tooLarge ? (
          <Badge variant="warning">{t('tools.diff.tooLarge')}</Badge>
        ) : store.identical ? (
          <Badge variant="success">{t('tools.diff.identical')}</Badge>
        ) : (
          <Badge variant="accent">
            +{store.insertions} −{store.deletions}
          </Badge>
        )}
      </div>
      <div className="mt-3">
        {store.tooLarge ? (
          <Callout block>{t('tools.diff.tooLargeHint')}</Callout>
        ) : (
          <DiffView
            ops={store.ops}
            view={store.view}
            beforeLabel={t('tools.diff.before')}
            afterLabel={t('tools.diff.after')}
          />
        )}
      </div>
    </section>
  );
}

function FileImport({
  label,
  id,
  onFile,
}: {
  label: string;
  id: string;
  onFile: (file: File) => void;
}) {
  return (
    <div>
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center rounded-control border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-subtle"
      >
        {label}
      </label>
    </div>
  );
}
