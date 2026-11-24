import { useEffect, useRef, useState, type RefObject } from 'react';
import { Button } from '../../../components/ui/Button';
import { useI18n } from '../../../i18n/I18nProvider';
import { CodeImageSizeError, copyCodeImage } from '../lib/codeImage';

type Feedback = 'copied' | 'downloaded' | 'tooLarge' | 'failed';

export function CopyCodeImageButton({
  source,
  editorRef,
}: {
  source: string;
  editorRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    const editor = editorRef.current;
    if (!editor) return;
    clearTimeout(timer.current);
    setFeedback(null);
    setBusy(true);
    try {
      setFeedback(await copyCodeImage(editor, source));
      timer.current = setTimeout(() => setFeedback(null), 1800);
    } catch (error) {
      setFeedback(error instanceof CodeImageSizeError ? 'tooLarge' : 'failed');
    } finally {
      setBusy(false);
    }
  }

  const success = feedback === 'copied' || feedback === 'downloaded';
  const message = feedback ? t(`tools.syntaxEditor.image.${feedback}`) : '';

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        aria-busy={busy || undefined}
        disabled={busy || source.length === 0}
      >
        {success ? message : t('tools.syntaxEditor.image.copy')}
      </Button>
      <span
        role="status"
        className={feedback && !success ? 'basis-full text-xs text-danger' : 'sr-only'}
      >
        {message}
      </span>
    </>
  );
}
