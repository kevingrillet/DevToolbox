/**
 * Lit le contenu texte d'un `File` et le transmet à `onText`. Centralise le motif
 * `file.text().then(...)` jusque-là recopié dans chaque outil, en ajoutant la
 * gestion d'erreur absente (lecture refusée, fichier illisible). Aucune validation
 * de taille ici : c'est à chaque outil de borner le coût de son traitement.
 */
export function readTextFile(
  file: File,
  onText: (text: string) => void,
  onError?: (error: unknown) => void,
): void {
  file.text().then(onText, (error: unknown) => onError?.(error));
}
