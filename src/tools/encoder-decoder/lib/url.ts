/**
 * Encodage/décodage URL (pourcentage). On s'appuie sur `encodeURIComponent` /
 * `decodeURIComponent`, primitives standard et correctes pour l'encodage
 * pourcentage : les réécrire « from scratch » n'aurait aucun intérêt. On se
 * contente d'emballer le résultat dans `CodecResult` et de capturer les entrées
 * malformées au décodage (ex. `%E0%A4%A` → `URIError`).
 */
import type { Codec, CodecResult } from './types';

export const urlCodec: Codec = {
  id: 'url',
  labelKey: 'tools.encoder.formats.url',
  encode(input: string): CodecResult {
    try {
      return { ok: true, value: encodeURIComponent(input) };
    } catch {
      return { ok: false, errorKey: 'tools.encoder.errors.url' };
    }
  },
  decode(input: string): CodecResult {
    try {
      return { ok: true, value: decodeURIComponent(input) };
    } catch {
      return { ok: false, errorKey: 'tools.encoder.errors.url' };
    }
  },
};
