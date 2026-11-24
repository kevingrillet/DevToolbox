import type { CSSProperties } from 'react';
import { parseHex, relativeLuminance } from '../../../tools/color-palette-rgaa/lib/color';

export const SYNTAX_COLORS = [
  'background',
  'foreground',
  'comment',
  'keyword',
  'string',
  'number',
  'function',
  'operator',
  'property',
  'tag',
] as const;

export type SyntaxColor = (typeof SYNTAX_COLORS)[number];
export type SyntaxPalette = Record<SyntaxColor, string>;

export function syntaxThemeStyle(palette?: SyntaxPalette): CSSProperties | undefined {
  if (!palette) return undefined;
  const background = parseHex(palette.background);
  return {
    colorScheme: background && relativeLuminance(background) < 0.179 ? 'dark' : 'light',
    ...Object.fromEntries(SYNTAX_COLORS.map((key) => [`--syntax-${key}`, palette[key]])),
  };
}
