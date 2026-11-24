import Prism from 'prismjs';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-csv';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-yaml';
import { INPUT_LIMITS, isInputTooLarge } from '../inputLimits';
import type { CodeLanguage } from './languages';

// React rend les tokens dans ses propres composants, sans mutation du DOM par Prism.
Prism.manual = true;

const CSV_GRAMMARS = {
  ';': { value: /[^\r\n;"]+|"(?:[^"]|"")*"(?!")/, punctuation: /;/ },
  '\t': { value: /[^\r\n\t"]+|"(?:[^"]|"")*"(?!")/, punctuation: /\t/ },
} satisfies Record<string, Prism.Grammar>;

export function tokenizeCode(
  source: string,
  language: CodeLanguage,
  csvDelimiter?: string,
): Prism.TokenStream | null {
  if (
    language === 'plain' ||
    source === '' ||
    isInputTooLarge(source, INPUT_LIMITS.syntaxHighlight)
  ) {
    return null;
  }
  const grammar =
    language === 'csv' && (csvDelimiter === ';' || csvDelimiter === '\t')
      ? CSV_GRAMMARS[csvDelimiter]
      : Prism.languages[language];
  if (!grammar) return null;

  try {
    return Prism.tokenize(source, grammar);
  } catch {
    return null;
  }
}
