/**
 * Contrats du couche métier de l'encodeur/décodeur (pattern Strategy + Registry).
 *
 * Un `Codec` est un plugin de transformation texte ↔ texte bidirectionnelle
 * (Base64, URL, entités HTML…). Ajouter un format = ajouter un `Codec` au registre
 * (`codecs.ts`), sans toucher à l'UI. Le JWT, à sens unique et à sortie structurée,
 * est traité à part (`jwt.ts`).
 */

/** Résultat d'une (dé)transformation : succès avec valeur, ou échec avec un code. */
export type CodecResult = { ok: true; value: string } | { ok: false; errorKey: string };

export interface Codec {
  /** Identifiant stable (slug), ex. `base64`. */
  id: string;
  /** Clé i18n du libellé affiché dans le sélecteur de format. */
  labelKey: string;
  /** Encode le texte source. */
  encode(input: string): CodecResult;
  /** Décode le texte source ; échoue proprement si l'entrée est invalide. */
  decode(input: string): CodecResult;
}
