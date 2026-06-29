import { describe, it, expect } from 'vitest';
import { formatJson, minifyJson } from './format';

describe('format', () => {
  it('reformate avec indentation', () => {
    expect(formatJson({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
  it('minifie', () => {
    expect(minifyJson({ a: 1, b: [2, 3] })).toBe('{"a":1,"b":[2,3]}');
  });
});
