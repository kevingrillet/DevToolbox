import type { TokenStream } from 'prismjs';
import { describe, expect, it } from 'vitest';
import { INPUT_LIMITS } from '../inputLimits';
import { CODE_LANGUAGES, isCodeLanguage, type CodeLanguage } from './languages';
import { tokenizeCode } from './prism';

function textOf(tokens: TokenStream): string {
  if (typeof tokens === 'string') return tokens;
  if (Array.isArray(tokens)) return tokens.map(textOf).join('');
  return textOf(tokens.content);
}

const EXAMPLES: Record<Exclude<CodeLanguage, 'plain'>, string> = {
  bash: 'echo "hello"',
  csharp: 'class Demo { }',
  css: '.demo { color: red; }',
  csv: 'name,age\n"one,two",20',
  html: '<b>Hello &amp; world</b>',
  javascript: 'const value = true;',
  json: '{"ready": true}',
  markdown: '# Title\n**bold**',
  python: 'def greet():\n    return "hello"',
  sql: 'SELECT name FROM users;',
  typescript: 'const value: string = "code";',
  yaml: 'name: demo\nvalue: true',
};

describe('Prism', () => {
  it.each(Object.entries(EXAMPLES))(
    'charge la grammaire %s et préserve la source',
    (language, value) => {
      if (!isCodeLanguage(language)) throw new Error(`Grammaire inconnue ${language}`);
      const tokens = tokenizeCode(value, language);
      expect(Array.isArray(tokens) && tokens.some((token) => typeof token !== 'string')).toBe(true);
      expect(textOf(tokens ?? '')).toBe(value);
    },
  );

  it.each([';', '\t'])('reconnaît le délimiteur CSV %j en dehors des guillemets', (delimiter) => {
    const source = `"value${delimiter}value"${delimiter}next`;
    const tokens = tokenizeCode(source, 'csv', delimiter);
    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'punctuation', content: delimiter }),
      ]),
    );
    expect(textOf(tokens ?? '')).toBe(source);
  });

  it('laisse le texte brut ou trop long au champ natif', () => {
    expect(Object.keys(EXAMPLES)).toHaveLength(Object.keys(CODE_LANGUAGES).length - 1);
    expect(tokenizeCode('text', 'plain')).toBeNull();
    expect(tokenizeCode('', 'html')).toBeNull();
    expect(tokenizeCode('x'.repeat(INPUT_LIMITS.syntaxHighlight + 1), 'python')).toBeNull();
    expect(isCodeLanguage('constructor')).toBe(false);
  });
});
