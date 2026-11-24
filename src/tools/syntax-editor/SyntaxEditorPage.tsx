import { useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Callout } from '../../components/ui/Callout';
import { Checkbox } from '../../components/ui/Checkbox';
import { CodeTextarea } from '../../components/ui/CodeTextarea';
import { CopyButton } from '../../components/ui/CopyButton';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SYNTAX_COLORS } from '../../components/ui/syntax/themeStyle';
import { useI18n } from '../../i18n/I18nProvider';
import { CODE_LANGUAGES } from '../../lib/prism/languages';
import { PRISM_THEMES } from './lib/themes';
import { useSyntaxEditorStore } from './useSyntaxEditorStore';
import { CopyCodeImageButton } from './components/CopyCodeImageButton';

export default function SyntaxEditorPage() {
  const { t } = useI18n();
  const store = useSyntaxEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  return (
    <section aria-labelledby="syntax-title">
      <h1 id="syntax-title" className="text-2xl font-bold">
        {t('tools.syntaxEditor.title')}
      </h1>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Select
          label={t('tools.syntaxEditor.language')}
          value={store.language}
          onChange={store.setLanguage}
          options={Object.entries(CODE_LANGUAGES).map(([value, label]) => ({
            value,
            label: label ?? t('tools.syntaxEditor.plain'),
          }))}
        />
        <Select
          label={t('tools.syntaxEditor.theme')}
          value={store.theme}
          onChange={store.setTheme}
          options={[
            { value: 'auto', label: t('tools.syntaxEditor.auto') },
            ...Object.entries(PRISM_THEMES).map(([value, { label }]) => ({ value, label })),
            { value: 'custom', label: t('tools.syntaxEditor.custom') },
          ]}
        />
        <div className="flex min-h-10 items-center">
          <Checkbox
            label={t('common.cache')}
            checked={store.cacheEnabled}
            onChange={store.setCacheEnabled}
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <CopyButton
            value={store.source}
            label={t('tools.syntaxEditor.copy')}
            copiedLabel={t('tools.syntaxEditor.copied')}
          />
          <CopyCodeImageButton source={store.source} editorRef={editorRef} />
          <Button variant="ghost" onClick={store.resetSource} disabled={!store.source}>
            {t('tools.syntaxEditor.clear')}
          </Button>
        </div>
      </div>

      {store.theme === 'custom' && (
        <fieldset className="mt-4 rounded-card border bg-surface p-4">
          <legend className="px-2 text-sm font-semibold">
            {t('tools.syntaxEditor.colorsLabel')}
          </legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10">
            {SYNTAX_COLORS.map((key) => (
              <Input
                key={key}
                label={t(`tools.syntaxEditor.colors.${key}`)}
                type="color"
                value={store.custom[key]}
                onChange={(event) => store.setColor(key, event.target.value)}
              />
            ))}
          </div>
          <Button size="sm" variant="ghost" className="mt-3" onClick={store.resetColors}>
            {t('tools.syntaxEditor.resetColors')}
          </Button>
        </fieldset>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <CodeTextarea
          editorRef={editorRef}
          label={t('tools.syntaxEditor.source')}
          placeholder={t('tools.syntaxEditor.placeholder')}
          value={store.source}
          onChange={(event) => store.setSource(event.target.value)}
          language={store.language}
          palette={store.palette}
          rows={20}
          className="max-sm:max-h-[55vh]"
        />
        {store.tooLarge && <Callout tone="warning">{t('tools.syntaxEditor.tooLarge')}</Callout>}
      </div>
    </section>
  );
}
