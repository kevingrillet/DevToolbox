import { describe, it, expect } from 'vitest';
import { htmlLinter } from './html';
import { runLint, defaultConfig } from '../types';

const ids = (src: string) =>
  runLint(htmlLinter, src, defaultConfig(htmlLinter)).map((i) => i.ruleId);

describe('html linter', () => {
  it('img-alt manquant', () => expect(ids('<img src="x.png">')).toContain('img-alt'));
  it('img avec alt non flaguée', () =>
    expect(ids('<img src="x.png" alt="x">')).not.toContain('img-alt'));
  it('duplicate-id', () =>
    expect(ids('<div id="a"></div><p id="a"></p>')).toContain('duplicate-id'));
  it('a-no-href', () => expect(ids('<a>clic</a>')).toContain('a-no-href'));
  it('a avec href non flaguée', () =>
    expect(ids('<a href="#">clic</a>')).not.toContain('a-no-href'));
  it('unclosed-tag', () => expect(ids('<div><span></div>')).toContain('unclosed-tag'));
  it('balises équilibrées non flaguées', () =>
    expect(ids('<div><span></span></div>')).not.toContain('unclosed-tag'));
});
