import {
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from 'react';
import { cx } from '../../lib/cx';
import { INPUT_LIMITS, isInputTooLarge } from '../../lib/inputLimits';
import type { CodeLanguage } from '../../lib/prism/languages';
import { tokenizeCode } from '../../lib/prism/prism';
import type { TextareaProps } from './Textarea';
import { renderTokens } from './syntax/Tokens';
import { syntaxThemeStyle, type SyntaxPalette } from './syntax/themeStyle';
import './syntax/syntax.css';

export interface CodeTextareaProps extends Omit<TextareaProps, 'value' | 'defaultValue' | 'wrap'> {
  value: string;
  language?: CodeLanguage;
  palette?: SyntaxPalette;
  editorRef?: Ref<HTMLDivElement>;
  csvDelimiter?: string;
}

export function CodeTextarea({
  value,
  language = 'plain',
  palette,
  editorRef,
  csvDelimiter,
  label,
  hint,
  error,
  id,
  rows = 8,
  className,
  onScroll,
  ...rest
}: CodeTextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint && `${textareaId}-hint`;
  const errorId = error && `${textareaId}-error`;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const input = useRef<HTMLTextAreaElement>(null);
  const highlight = useRef<HTMLElement>(null);
  const [gutter, setGutter] = useState({ first: 0, count: rows + 1, offset: 0 });

  // Le navigateur normalise les fins de ligne du textarea pour l'affichage.
  const source = useMemo(() => value.replace(/\r\n?/g, '\n'), [value]);
  const lineCount = useMemo(() => {
    let count = 1;
    for (let index = source.indexOf('\n'); index !== -1; index = source.indexOf('\n', index + 1)) {
      count++;
    }
    return count;
  }, [source]);

  const deferredSource = useDeferredValue(source);
  const tooLarge = isInputTooLarge(value, INPUT_LIMITS.syntaxHighlight);
  const tokens = useMemo(() => {
    if (tooLarge) return null;
    const result = tokenizeCode(deferredSource, language, csvDelimiter);
    return result ? renderTokens(result) : null;
  }, [deferredSource, language, csvDelimiter, tooLarge]);
  const highlighted = source === deferredSource && tokens !== null;

  const syncScroll = useCallback((field: HTMLTextAreaElement) => {
    const { scrollTop, scrollLeft, clientHeight } = field;
    if (highlight.current) {
      highlight.current.style.transform = `translate(${-scrollLeft}px, ${-scrollTop}px)`;
    }
    const lineHeight = Number.parseFloat(getComputedStyle(field).lineHeight);
    if (lineHeight > 0 && clientHeight > 0) {
      const first = Math.floor(scrollTop / lineHeight);
      const count = Math.ceil(clientHeight / lineHeight) + 1;
      const offset = first * lineHeight - scrollTop;
      setGutter((previous) =>
        previous.first === first && previous.count === count && previous.offset === offset
          ? previous
          : { first, count, offset },
      );
    }
  }, []);

  useEffect(() => {
    const field = input.current;
    if (!field || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => syncScroll(field));
    observer.observe(field);
    return () => observer.disconnect();
  }, [syncScroll]);

  useLayoutEffect(() => {
    const field = input.current;
    if (highlight.current && field) {
      highlight.current.style.transform = `translate(${-field.scrollLeft}px, ${-field.scrollTop}px)`;
    }
  }, [source, highlighted]);

  const firstLine = Math.min(gutter.first, lineCount - 1);
  const numbers = Array.from(
    { length: Math.min(gutter.count, lineCount - firstLine) },
    (_, index) => firstLine + index + 1,
  ).join('\n');

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-fg">
          {label}
        </label>
      )}
      <div
        ref={editorRef}
        className={cx(
          'syntax-editor syntax-surface rounded-control border font-mono',
          error && 'border-danger',
        )}
        style={syntaxThemeStyle(palette)}
      >
        <div
          aria-hidden="true"
          className="syntax-editor-gutter"
          style={{
            width: `calc(${String(lineCount).length}ch + 1rem + var(--default-border-width))`,
          }}
        >
          <div
            className="syntax-editor-numbers"
            style={{ transform: `translateY(${gutter.offset}px)` }}
          >
            {numbers}
          </div>
        </div>
        <div className="relative min-w-0">
          {highlighted && (
            <pre className="syntax-editor-highlight" aria-hidden="true">
              <code ref={highlight}>{tokens}</code>
            </pre>
          )}
          <textarea
            {...rest}
            ref={input}
            id={textareaId}
            rows={rows}
            value={value}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            data-highlighted={highlighted}
            className={cx('syntax-editor-input resize-y', className)}
            onScroll={(event) => {
              syncScroll(event.currentTarget);
              onScroll?.(event);
            }}
          />
        </div>
      </div>
      {hint && (
        <p id={hintId || undefined} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId || undefined} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
