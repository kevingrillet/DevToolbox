/**
 * Store de l'éditeur Markdown (pattern Command/Query).
 *
 * Query : `html` (fragment sanitizé pour l'aperçu) et `htmlDocument` (document
 * autonome pour l'export/copie), tous deux dérivés de l'entrée. Le texte peut être
 * conservé en cache (toggle persistant) ; sinon l'éditeur démarre vide.
 */
import { useCallback, useMemo } from 'react';
import { renderMarkdown, buildHtmlDocument, exampleMarkdown } from './lib/markdown';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { readTextFile } from '../../lib/readTextFile';

export interface MarkdownStore {
  input: string;
  html: string;
  htmlDocument: string;
  cacheEnabled: boolean;
  setInput: (text: string) => void;
  setInputFile: (file: File) => void;
  setCacheEnabled: (value: boolean) => void;
  reset: () => void;
}

export function useMarkdownStore(lang = 'en'): MarkdownStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:markdown:cache');
  // L'éditeur démarre sur un Markdown d'exemple (façon dillinger.io) plutôt que
  // vide, pour montrer d'emblée les capacités du moteur. Si le cache est activé,
  // le contenu mémorisé prend le pas sur l'exemple.
  const [input, setInput] = useCachedState(
    'devtools:markdown:input',
    cacheEnabled,
    exampleMarkdown(lang),
  );

  // Le rendu (marked + sanitization) ne suit que la saisie stabilisée.
  const debouncedInput = useDebouncedValue(input);
  const html = useMemo(() => renderMarkdown(debouncedInput), [debouncedInput]);
  // Le document exporté déclare la langue de l'UI (`lang`).
  const htmlDocument = useMemo(() => buildHtmlDocument(html, 'Document', lang), [html, lang]);

  const setInputFile = useCallback(
    (file: File) => {
      readTextFile(file, setInput);
    },
    [setInput],
  );

  // Réinitialiser restaure l'exemple (l'état « par défaut »), pas un éditeur vide.
  const reset = useCallback(() => setInput(exampleMarkdown(lang)), [setInput, lang]);

  return {
    input,
    html,
    htmlDocument,
    cacheEnabled,
    setInput,
    setInputFile,
    setCacheEnabled,
    reset,
  };
}
