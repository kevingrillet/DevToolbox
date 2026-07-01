/**
 * Palettes de couleurs prêtes à l'emploi pour le QR (modules + fond).
 * Toutes ont un contraste suffisant pour rester scannables (voir `contrast.ts`).
 */
export interface ColorPreset {
  /** Clé i18n du nom de la palette. */
  labelKey: string;
  dark: string;
  light: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { labelKey: 'presets.classic', dark: '#000000', light: '#ffffff' },
  { labelKey: 'presets.ink', dark: '#111827', light: '#ffffff' },
  { labelKey: 'presets.ocean', dark: '#1d4ed8', light: '#ffffff' },
  { labelKey: 'presets.forest', dark: '#047857', light: '#ecfdf5' },
  { labelKey: 'presets.berry', dark: '#7c3aed', light: '#f5f3ff' },
  { labelKey: 'presets.slate', dark: '#0f172a', light: '#e2e8f0' },
];
