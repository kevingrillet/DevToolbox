import { useMemo } from 'react';
import { useCachedState, usePersistentBoolean } from '../../hooks/useCachedState';
import { INPUT_LIMITS, isInputTooLarge } from '../../lib/inputLimits';
import { isCodeLanguage } from '../../lib/prism/languages';
import type { SyntaxColor } from '../../components/ui/syntax/themeStyle';
import { DEFAULT_CUSTOM_PALETTE, isThemeId, parseSyntaxSettings, PRISM_THEMES } from './lib/themes';

export function useSyntaxEditorStore() {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:syntax-editor:cache');
  const [source, setSource] = useCachedState('devtools:syntax-editor:source', cacheEnabled);
  const [settingsText, setSettingsText] = useCachedState(
    'devtools:syntax-editor:settings',
    cacheEnabled,
  );
  const settings = useMemo(() => parseSyntaxSettings(settingsText), [settingsText]);
  const { theme, language, custom } = settings;
  const palette =
    theme === 'auto' ? undefined : theme === 'custom' ? custom : PRISM_THEMES[theme].palette;

  const update = (patch: Partial<typeof settings>) =>
    setSettingsText(JSON.stringify({ ...settings, ...patch }));

  return {
    source,
    language,
    theme,
    custom,
    palette,
    tooLarge: language !== 'plain' && isInputTooLarge(source, INPUT_LIMITS.syntaxHighlight),
    cacheEnabled,
    setCacheEnabled,
    setSource,
    setLanguage: (value: string) => {
      if (isCodeLanguage(value)) update({ language: value });
    },
    setTheme: (value: string) => {
      if (isThemeId(value)) update({ theme: value });
    },
    setColor: (key: SyntaxColor, color: string) => update({ custom: { ...custom, [key]: color } }),
    resetColors: () => update({ custom: DEFAULT_CUSTOM_PALETTE }),
    resetSource: () => setSource(''),
  };
}
