/**
 * Comparaison d'un hash attendu (collé par l'utilisateur) avec les hash calculés.
 * Permet de vérifier l'intégrité d'un téléchargement sans connaître l'algorithme
 * a priori : on normalise puis on cherche une correspondance parmi les résultats.
 */
import type { HashResult } from './hash';

/**
 * Normalise un hash saisi : minuscules, sans espaces, sans `:` ni préfixe `0x`,
 * pour ne garder que les chiffres hexadécimaux.
 */
export function normalizeHash(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^0x/, '')
    .replace(/[^0-9a-f]/g, '');
}

export interface HashComparison {
  /** Hash attendu, normalisé. */
  normalized: string;
  /** Id de l'algorithme dont le hash correspond, ou `null` si aucun. */
  matchedId: string | null;
}

export function compareHash(expected: string, results: HashResult[]): HashComparison {
  const normalized = normalizeHash(expected);
  if (normalized === '') return { normalized, matchedId: null };
  const match = results.find((result) => result.hex === normalized);
  return { normalized, matchedId: match ? match.id : null };
}
