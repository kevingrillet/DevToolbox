/**
 * Découpage du texte en tokens selon la granularité. Chaque token conserve son
 * texte d'origine (espaces et sauts de ligne inclus) afin que le réassemblage des
 * opérations redonne exactement le texte de départ.
 */

/** Caractères (par point de code, donc sûr en Unicode). */
export function charTokens(text: string): string[] {
  return Array.from(text);
}

/** Mots et blancs alternés : `"a b"` → `["a", " ", "b"]`. */
export function wordTokens(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token !== '');
}

/** Lignes, le saut de ligne restant attaché à sa ligne : `"a\nb"` → `["a\n", "b"]`. */
export function lineTokens(text: string): string[] {
  return text === '' ? [] : text.split(/(?<=\n)/);
}
