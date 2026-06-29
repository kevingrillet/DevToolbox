import { describe, it, expect } from 'vitest';
import { CODECS, CODECS_BY_ID, FORMATS, FORMATS_BY_ID } from './codecs';

describe('registre des formats', () => {
  it('expose des codecs à id unique', () => {
    expect(new Set(CODECS.map((c) => c.id)).size).toBe(CODECS.length);
  });

  it('indexe correctement les codecs par id', () => {
    for (const codec of CODECS) expect(CODECS_BY_ID.get(codec.id)).toBe(codec);
  });

  it('ajoute le JWT aux formats du sélecteur (kind = jwt)', () => {
    const jwt = FORMATS_BY_ID.get('jwt');
    expect(jwt?.kind).toBe('jwt');
    expect(FORMATS.filter((f) => f.kind === 'codec')).toHaveLength(CODECS.length);
  });
});
