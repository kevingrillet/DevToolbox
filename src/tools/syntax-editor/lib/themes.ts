import { SYNTAX_COLORS, type SyntaxPalette } from '../../../components/ui/syntax/themeStyle';
import { isCodeLanguage, type CodeLanguage } from '../../../lib/prism/languages';

/** Palettes des thèmes Prism adaptées au rendu à métriques fixes de l'éditeur. */
export const PRISM_THEMES = {
  prism: {
    label: 'Prism',
    palette: {
      background: '#f5f2f0',
      foreground: '#000000',
      comment: '#5f6e7d',
      keyword: '#006a88',
      string: '#805529',
      number: '#990055',
      function: '#a72946',
      operator: '#65482e',
      property: '#990055',
      tag: '#990055',
    },
  },
  dark: {
    label: 'Dark',
    palette: {
      background: '#4d4033',
      foreground: '#ffffff',
      comment: '#d3bfab',
      keyword: '#efa8b5',
      string: '#c7e561',
      number: '#efa8b5',
      function: '#ffc561',
      operator: '#f5ca68',
      property: '#efa8b5',
      tag: '#efa8b5',
    },
  },
  funky: {
    label: 'Funky',
    palette: {
      background: '#000000',
      foreground: '#ffffff',
      comment: '#aaaaaa',
      keyword: '#ff459b',
      string: '#ffff00',
      number: '#00ccff',
      function: '#ffa500',
      operator: '#9acd32',
      property: '#00ccff',
      tag: '#00ccff',
    },
  },
  okaidia: {
    label: 'Okaidia',
    palette: {
      background: '#272822',
      foreground: '#f8f8f2',
      comment: '#96a8b7',
      keyword: '#66d9ef',
      string: '#a6e22e',
      number: '#bc9cff',
      function: '#e6db74',
      operator: '#f8f8f2',
      property: '#ff659b',
      tag: '#ff659b',
    },
  },
  twilight: {
    label: 'Twilight',
    palette: {
      background: '#141414',
      foreground: '#ffffff',
      comment: '#909090',
      keyword: '#f9ee98',
      string: '#8f9d6a',
      number: '#cf795f',
      function: '#e9c062',
      operator: '#a7b2cc',
      property: '#f9ee98',
      tag: '#c29b69',
    },
  },
  coy: {
    label: 'Coy',
    palette: {
      background: '#fdfdfd',
      foreground: '#000000',
      comment: '#5f6e7d',
      keyword: '#116c88',
      string: '#805e3c',
      number: '#ab2525',
      function: '#267900',
      operator: '#805e3c',
      property: '#ab2525',
      tag: '#ab2525',
    },
  },
  solarizedLight: {
    label: 'Solarized Light',
    palette: {
      background: '#fdf6e3',
      foreground: '#4c626b',
      comment: '#5e6f70',
      keyword: '#586700',
      string: '#08736c',
      number: '#116fa6',
      function: '#805d00',
      operator: '#586e75',
      property: '#116fa6',
      tag: '#116fa6',
    },
  },
  tomorrowNight: {
    label: 'Tomorrow Night',
    palette: {
      background: '#2d2d2d',
      foreground: '#cccccc',
      comment: '#aaaaaa',
      keyword: '#cc99cd',
      string: '#7ec699',
      number: '#f08d49',
      function: '#f08d49',
      operator: '#67cdcc',
      property: '#f8c555',
      tag: '#e9898c',
    },
  },
} satisfies Record<string, { label: string; palette: SyntaxPalette }>;

export type BuiltInTheme = keyof typeof PRISM_THEMES;
export type ThemeId = 'auto' | BuiltInTheme | 'custom';

interface SyntaxEditorSettings {
  language: CodeLanguage;
  theme: ThemeId;
  custom: SyntaxPalette;
}

export const DEFAULT_CUSTOM_PALETTE: Readonly<SyntaxPalette> = {
  background: '#ffffff',
  foreground: '#171717',
  comment: '#505050',
  keyword: '#173b70',
  string: '#18543c',
  number: '#6b3800',
  function: '#552d67',
  operator: '#383838',
  property: '#07505f',
  tag: '#702c35',
};

export function isThemeId(value: unknown): value is ThemeId {
  return (
    typeof value === 'string' &&
    (value === 'auto' || value === 'custom' || Object.hasOwn(PRISM_THEMES, value))
  );
}

export function parseSyntaxSettings(input: string): SyntaxEditorSettings {
  let stored: Partial<SyntaxEditorSettings> | null = null;
  try {
    stored = input ? (JSON.parse(input) as Partial<SyntaxEditorSettings> | null) : null;
  } catch {
    // Une ancienne valeur ou un cache invalide ne doit pas empêcher l'édition.
  }

  const custom = { ...DEFAULT_CUSTOM_PALETTE };
  // L'ancienne palette personnalisée par défaut reprenait exactement Prism.
  const legacyDefault = SYNTAX_COLORS.every(
    (key) => stored?.custom?.[key] === PRISM_THEMES.prism.palette[key],
  );
  if (!legacyDefault) {
    for (const key of SYNTAX_COLORS) {
      const color = stored?.custom?.[key];
      if (typeof color === 'string' && /^#[\da-f]{6}$/i.test(color)) custom[key] = color;
    }
  }

  return {
    custom,
    language: isCodeLanguage(stored?.language) ? stored.language : 'javascript',
    theme: isThemeId(stored?.theme) ? stored.theme : 'auto',
  };
}
