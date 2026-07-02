/**
 * Garde-fous de taille d'entrée pour les outils à calcul lourd.
 *
 * Certains traitements (analyse JSON récursive + arbre, parsing CSV, lint) ont un
 * coût qui croît avec la taille de l'entrée. Au-delà d'un plafond, on n'exécute
 * PAS le traitement et on affiche un message i18n clair : l'UI reste réactive.
 * Ce sont volontairement de simples garde-fous (seuil + message), PAS des Web
 * Workers — l'objectif est d'éviter de bloquer/planter l'onglet, pas de traiter
 * des entrées démesurées en arrière-plan.
 *
 * Les seuils sont exprimés en NOMBRE DE CARACTÈRES (proxy simple et déterministe
 * de la charge). Ils sont larges (plusieurs Mo de texte) : un usage normal ne les
 * atteint jamais, seuls les collages/imports pathologiques les déclenchent.
 */
export const INPUT_LIMITS = {
  /** JSON Linter/Viewer : parsing récursif + construction d'arbre. ~2 Mo. */
  json: 2_000_000,
  /** Visualiseur CSV : parsing + normalisation en table. ~2 Mo. */
  csv: 2_000_000,
  /** Comparateur de texte : garde-fou d'entrée en complément du plafond matriciel
   *  du diff (`DiffTooLargeError`). ~2 Mo par côté. */
  textDiff: 2_000_000,
  /** Linter de code : passes regex/parsing léger. ~1 Mo. */
  codeLinter: 1_000_000,
} as const;

/** Vrai si `text` dépasse `max` caractères. Pur, sans effet de bord. */
export function isInputTooLarge(text: string, max: number): boolean {
  return text.length > max;
}
