/**
 * Page de l'éditeur Markdown : split éditeur / aperçu live. L'aperçu rend le HTML
 * **déjà sanitizé** par la couche `lib/markdown` (d'où `dangerouslySetInnerHTML`
 * en toute sécurité). Export par copie du Markdown ou du document HTML complet.
 *
 * Le style de l'aperçu est porté par des variantes Tailwind ciblant les éléments
 * générés (pas de plugin typographie), en s'appuyant sur les tokens de thème.
 */
import { useI18n } from '../../i18n/I18nProvider';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Checkbox } from '../../components/ui/Checkbox';
import { CopyButton } from '../../components/ui/CopyButton';
import { useMarkdownStore } from './useMarkdownStore';

const PREVIEW =
  'max-w-none break-words ' +
  '[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold ' +
  '[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold ' +
  '[&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_p]:my-2 [&_a]:text-accent [&_a]:underline ' +
  '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 ' +
  '[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:text-fg-muted ' +
  '[&_code]:rounded [&_code]:bg-subtle [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm ' +
  '[&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-card [&_pre]:bg-subtle [&_pre]:p-3 ' +
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0 ' +
  '[&_table]:my-2 [&_table]:w-full [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:px-2 [&_td]:py-1 ' +
  '[&_hr]:my-4 [&_img]:max-w-full';

export default function MarkdownEditorPage() {
  const { t, lang } = useI18n();
  const store = useMarkdownStore(lang);

  return (
    <section aria-labelledby="md-title">
      <h1 id="md-title" className="text-2xl font-bold">
        {t('tools.markdown.title')}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{t('tools.markdown.description')}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          id="md-file"
          type="file"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) store.setInputFile(file);
          }}
        />
        <label
          htmlFor="md-file"
          className="inline-flex cursor-pointer items-center rounded-control border bg-surface px-3 py-1.5 text-sm font-medium text-fg transition hover:bg-subtle"
        >
          {t('tools.markdown.importFile')}
        </label>
        <CopyButton
          value={store.input}
          label={t('tools.markdown.copyMarkdown')}
          copiedLabel={t('tools.markdown.copied')}
        />
        <CopyButton
          value={store.htmlDocument}
          label={t('tools.markdown.copyHtml')}
          copiedLabel={t('tools.markdown.copied')}
        />
        <Button size="sm" variant="ghost" onClick={store.reset}>
          {t('tools.markdown.reset')}
        </Button>
        <Checkbox
          label={t('common.cache')}
          checked={store.cacheEnabled}
          onChange={store.setCacheEnabled}
        />
        <Badge variant="success">{t('tools.markdown.safetyNote')}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Textarea
          label={t('tools.markdown.editor')}
          placeholder={t('tools.markdown.editorPlaceholder')}
          value={store.input}
          onChange={(event) => store.setInput(event.target.value)}
          rows={20}
        />
        <div>
          <p className="mb-1 text-sm font-medium text-fg">{t('tools.markdown.preview')}</p>
          <div
            id="md-preview"
            className={`min-h-[20rem] overflow-auto rounded-card border bg-surface p-4 text-fg ${PREVIEW}`}
            // HTML sanitizé par lib/markdown (DOMPurify) avant injection.
            dangerouslySetInnerHTML={{ __html: store.html }}
          />
        </div>
      </div>
    </section>
  );
}
