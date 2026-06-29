/**
 * Reformatage (indenté) et minification d'une valeur JSON déjà analysée.
 */
import type { JsonValue } from './parse';

export function formatJson(value: JsonValue): string {
  return JSON.stringify(value, null, 2);
}

export function minifyJson(value: JsonValue): string {
  return JSON.stringify(value);
}
