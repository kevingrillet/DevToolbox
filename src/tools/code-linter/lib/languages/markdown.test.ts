import { describe, it, expect } from 'vitest';
import { markdownLinter } from './markdown';
import { runLint, defaultConfig } from '../types';

const ids = (src: string) =>
  runLint(markdownLinter, src, defaultConfig(markdownLinter)).map((i) => i.ruleId);

describe('markdown linter', () => {
  it('empty-link (texte vide)', () => expect(ids('[](http://x)')).toContain('empty-link'));
  it('empty-link (URL vide)', () => expect(ids('[texte]()')).toContain('empty-link'));
  it('lien complet non flagué', () => expect(ids('[texte](http://x)')).not.toContain('empty-link'));
  it('heading-skip (# puis ###)', () => expect(ids('# A\n### C')).toContain('heading-skip'));
  it('incrément de niveau correct non flagué', () =>
    expect(ids('# A\n## B')).not.toContain('heading-skip'));
  it('code-fence-no-lang', () => expect(ids('```\ncode\n```')).toContain('code-fence-no-lang'));
  it('fence avec langage non flaguée', () =>
    expect(ids('```js\ncode\n```')).not.toContain('code-fence-no-lang'));
});
