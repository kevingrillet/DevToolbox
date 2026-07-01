/**
 * Vérification du contraste des couleurs du QR code.
 *
 * Un QR n'est lisible par les scanners que si ses modules (premier plan) et son
 * fond sont suffisamment contrastés — et, classiquement, dans le bon sens
 * (modules sombres sur fond clair). Ce module calcule le ratio de contraste WCAG
 * entre deux couleurs et en déduit un statut exploité par l'UI pour avertir
 * l'utilisateur AVANT qu'il ne génère (et imprime) un QR illisible.
 *
 * Fonctions pures, sans dépendance à React : testables unitairement seules.
 */

/** Statut de lisibilité d'un couple (modules, fond). */
export type ContrastStatus = 'ok' | 'low' | 'inverted';

/** Ratio de contraste minimal en dessous duquel un QR risque de ne pas être scanné. */
export const MIN_CONTRAST_RATIO = 3;

/** Convertit une couleur hex (`#rgb` ou `#rrggbb`) en composantes 0-255, ou `null` si invalide. */
export function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  let h = match[1];
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Luminance relative (WCAG 2.x) d'une couleur hex, dans l'intervalle [0, 1]. */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** Ratio de contraste WCAG entre deux couleurs (de 1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Évalue la lisibilité d'un couple (modules, fond) :
 *  - `low`      : contraste insuffisant (risque de non-lecture) ;
 *  - `inverted` : les modules sont plus clairs que le fond — beaucoup de lecteurs
 *    échouent sur un QR « en négatif » ;
 *  - `ok`       : sûr.
 */
export function contrastStatus(dark: string, light: string): ContrastStatus {
  if (contrastRatio(dark, light) < MIN_CONTRAST_RATIO) return 'low';
  if (relativeLuminance(dark) > relativeLuminance(light)) return 'inverted';
  return 'ok';
}
