/**
 * Registre des formats de l'encodeur/décodeur.
 *
 * `CODECS` liste les codecs bidirectionnels (Strategy + Registry). `FORMATS`
 * ajoute le JWT (sens unique, sortie structurée) pour le sélecteur de l'UI, via
 * un discriminant `kind`. Ajouter Hex, ROT13… = ajouter un `Codec` ici.
 */
import type { Codec } from './types';
import { base64Codec } from './base64';
import { urlCodec } from './url';
import { htmlEntitiesCodec } from './htmlEntities';

export const CODECS: Codec[] = [base64Codec, urlCodec, htmlEntitiesCodec];

export const CODECS_BY_ID = new Map<string, Codec>(CODECS.map((codec) => [codec.id, codec]));

export type FormatKind = 'codec' | 'jwt';

export interface FormatMeta {
  id: string;
  labelKey: string;
  kind: FormatKind;
}

export const FORMATS: FormatMeta[] = [
  ...CODECS.map((codec): FormatMeta => ({ id: codec.id, labelKey: codec.labelKey, kind: 'codec' })),
  { id: 'jwt', labelKey: 'tools.encoder.formats.jwt', kind: 'jwt' },
];

export const FORMATS_BY_ID = new Map<string, FormatMeta>(FORMATS.map((f) => [f.id, f]));
