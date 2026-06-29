/**
 * Manipulation de couleurs et calcul de contraste WCAG — implémentation maison
 * (le `contrast.ts` du projet QR n'étant pas disponible ici).
 *
 * Référence : WCAG 2.1, luminance relative et rapport de contraste.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

function clamp255(n: number): number {
  return Math.min(255, Math.max(0, n));
}

/** Parse `#rgb`, `#rrggbb` (avec ou sans `#`). Renvoie null si invalide. */
export function parseHex(input: string): RGB | null {
  const s = input.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }
  return null;
}

export function toHex({ r, g, b }: RGB): string {
  const h = (n: number) => Math.round(clamp255(n)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Luminance relative WCAG (0 = noir, 1 = blanc). */
export function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Rapport de contraste WCAG entre deux couleurs (de 1:1 à 21:1). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Interpole linéairement entre deux couleurs (t ∈ [0, 1]). */
export function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}
