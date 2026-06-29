/**
 * Seuils de conformité WCAG / RGAA pour le contraste du texte.
 *
 * Texte normal : AA ≥ 4.5:1, AAA ≥ 7:1.
 * Grand texte (≥ 18pt, ou 14pt gras) : AA ≥ 3:1, AAA ≥ 4.5:1.
 */
export type TextSize = 'normal' | 'large';
export type Level = 'AAA' | 'AA' | 'fail';

export const THRESHOLDS: Record<TextSize, { aa: number; aaa: number }> = {
  normal: { aa: 4.5, aaa: 7 },
  large: { aa: 3, aaa: 4.5 },
};

/** Niveau atteint par un rapport de contraste pour une taille de texte donnée. */
export function rate(ratio: number, size: TextSize): Level {
  const t = THRESHOLDS[size];
  if (ratio >= t.aaa) return 'AAA';
  if (ratio >= t.aa) return 'AA';
  return 'fail';
}
