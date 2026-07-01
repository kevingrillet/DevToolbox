/**
 * Payload "URL".
 *
 * Normalise l'adresse saisie : si aucun schéma (`http://`, `https://`, `ftp://`…)
 * n'est présent, on préfixe `https://` afin que le QR ouvre bien un lien cliquable.
 * Une chaîne vide reste vide (aucun QR ne sera généré tant que rien n'est saisi).
 */
const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;

export function buildUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed === '') return '';
  if (SCHEME_REGEX.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
