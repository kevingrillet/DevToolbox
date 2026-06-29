/**
 * Store du générateur de palette RGAA (pattern Command/Query).
 *
 * Source unique : la palette `colors`. Le vérificateur de contraste opère sur deux
 * couleurs sélectionnées par index (`fgIndex`/`bgIndex`). Les dérivés (ratio,
 * niveaux AA/AAA, suggestions, export) sont des queries pures. Aucune persistance.
 */
import { useCallback, useMemo, useState } from 'react';
import { contrastRatio, parseHex, toHex } from './lib/color';
import { rate, THRESHOLDS, type Level, type TextSize } from './lib/wcag';
import { suggestForeground } from './lib/suggest';
import { exportPalette, type ExportFormat } from './lib/export';

const DEFAULT_COLORS = ['#1d4ed8', '#ffffff', '#facc15'];

function clampIndex(index: number, length: number): number {
  return Math.min(Math.max(0, index), Math.max(0, length - 1));
}

export interface PaletteSuggestions {
  aa: string | null;
  aaa: string | null;
}

export interface ColorPaletteStore {
  colors: string[];
  fgIndex: number;
  bgIndex: number;
  textSize: TextSize;
  exportFormat: ExportFormat;
  fgHex: string;
  bgHex: string;
  ratio: number | null;
  levelNormal: Level | null;
  levelLarge: Level | null;
  suggestions: PaletteSuggestions;
  exportText: string;
  addColor: () => void;
  removeColor: (index: number) => void;
  setColor: (index: number, hex: string) => void;
  setFgIndex: (index: number) => void;
  setBgIndex: (index: number) => void;
  swap: () => void;
  setTextSize: (size: TextSize) => void;
  setExportFormat: (format: ExportFormat) => void;
  applySuggestion: (hex: string) => void;
  reset: () => void;
}

export function useColorPaletteStore(): ColorPaletteStore {
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [fgIndex, setFgIndexState] = useState(0);
  const [bgIndex, setBgIndexState] = useState(1);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');

  const fgHex = colors[fgIndex] ?? '';
  const bgHex = colors[bgIndex] ?? '';

  const { ratio, fgRgb, bgRgb } = useMemo(() => {
    const fg = parseHex(fgHex);
    const bg = parseHex(bgHex);
    return { fgRgb: fg, bgRgb: bg, ratio: fg && bg ? contrastRatio(fg, bg) : null };
  }, [fgHex, bgHex]);

  const levelNormal = ratio != null ? rate(ratio, 'normal') : null;
  const levelLarge = ratio != null ? rate(ratio, 'large') : null;

  const suggestions = useMemo<PaletteSuggestions>(() => {
    if (!fgRgb || !bgRgb) return { aa: null, aaa: null };
    const t = THRESHOLDS[textSize];
    const aa = suggestForeground(fgRgb, bgRgb, t.aa);
    const aaa = suggestForeground(fgRgb, bgRgb, t.aaa);
    return { aa: aa ? toHex(aa) : null, aaa: aaa ? toHex(aaa) : null };
  }, [fgRgb, bgRgb, textSize]);

  const exportText = useMemo(() => exportPalette(colors, exportFormat), [colors, exportFormat]);

  const addColor = useCallback(() => setColors((prev) => [...prev, '#888888']), []);

  const removeColor = useCallback(
    (index: number) =>
      setColors((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((_, i) => i !== index);
        setFgIndexState((fi) => clampIndex(fi > index ? fi - 1 : fi, next.length));
        setBgIndexState((bi) => clampIndex(bi > index ? bi - 1 : bi, next.length));
        return next;
      }),
    [],
  );

  const setColor = useCallback(
    (index: number, hex: string) =>
      setColors((prev) => prev.map((c, i) => (i === index ? hex : c))),
    [],
  );

  const setFgIndex = useCallback((index: number) => setFgIndexState(index), []);
  const setBgIndex = useCallback((index: number) => setBgIndexState(index), []);

  const swap = useCallback(() => {
    setFgIndexState(bgIndex);
    setBgIndexState(fgIndex);
  }, [fgIndex, bgIndex]);

  const applySuggestion = useCallback(
    (hex: string) => setColors((prev) => prev.map((c, i) => (i === fgIndex ? hex : c))),
    [fgIndex],
  );

  const reset = useCallback(() => {
    setColors(DEFAULT_COLORS);
    setFgIndexState(0);
    setBgIndexState(1);
    setTextSize('normal');
    setExportFormat('css');
  }, []);

  return {
    colors,
    fgIndex,
    bgIndex,
    textSize,
    exportFormat,
    fgHex,
    bgHex,
    ratio,
    levelNormal,
    levelLarge,
    suggestions,
    exportText,
    addColor,
    removeColor,
    setColor,
    setFgIndex,
    setBgIndex,
    swap,
    setTextSize,
    setExportFormat,
    applySuggestion,
    reset,
  };
}
