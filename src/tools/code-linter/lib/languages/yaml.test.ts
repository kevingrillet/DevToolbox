import { describe, it, expect } from 'vitest';
import { yamlLinter } from './yaml';
import { runLint, defaultConfig } from '../types';

const ids = (src: string) =>
  runLint(yamlLinter, src, defaultConfig(yamlLinter)).map((i) => i.ruleId);

describe('yaml linter', () => {
  it('no-tabs (tabulation en indentation)', () =>
    expect(ids('key:\n\tvalue: 1')).toContain('no-tabs'));
  it('missing-space-after-colon', () =>
    expect(ids('key:value')).toContain('missing-space-after-colon'));
  it('espace après « : » non flagué', () =>
    expect(ids('key: value')).not.toContain('missing-space-after-colon'));
  it('URL non flaguée', () =>
    expect(ids('url: http://example.com')).not.toContain('missing-space-after-colon'));
  it('duplicate-key', () => expect(ids('key: 1\nkey: 2')).toContain('duplicate-key'));
});
