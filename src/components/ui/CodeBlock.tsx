import { useMemo } from 'react';
import type { CodeLanguage } from '../../lib/prism/languages';
import { tokenizeCode } from '../../lib/prism/prism';
import { renderTokens } from './syntax/Tokens';
import './syntax/syntax.css';

export function CodeBlock({ value, language }: { value: string; language: CodeLanguage }) {
  const content = useMemo(() => {
    const tokens = tokenizeCode(value, language);
    return tokens ? renderTokens(tokens) : value;
  }, [value, language]);

  return (
    <pre className="syntax-surface overflow-x-auto rounded-control p-3 font-mono text-xs">
      <code>{content}</code>
    </pre>
  );
}
