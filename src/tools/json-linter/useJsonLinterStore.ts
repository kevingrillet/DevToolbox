/**
 * Store du JSON Linter / Viewer (pattern Command/Query).
 *
 * Queries dérivées de l'entrée : résultat d'analyse (valeur ou erreur localisée),
 * arbre typé, correspondances de recherche. État d'interaction : nœuds dépliés,
 * sélection manuelle, index de correspondance. Les ancêtres de la sélection sont
 * dépliés automatiquement (dérivé, sans effet). L'entrée peut être conservée en
 * cache (toggle opt-in, désactivé par défaut).
 */
import { useCallback, useMemo, useState } from 'react';
import { parseJson, type ParseError, type ParseWarning } from './lib/parse';
import { buildTree, type TreeNode } from './lib/tree';
import { searchTree } from './lib/search';
import { formatJson, minifyJson } from './lib/format';
import { usePersistentBoolean, useCachedState } from '../../hooks/useCachedState';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { readTextFile } from '../../lib/readTextFile';
import { INPUT_LIMITS, isInputTooLarge } from '../../lib/inputLimits';

export interface JsonLinterStore {
  input: string;
  query: string;
  error: ParseError | null;
  warnings: ParseWarning[];
  valid: boolean;
  tree: TreeNode | null;
  matches: string[];
  matchPosition: number;
  matchSet: Set<string>;
  selected: string | null;
  selectedJson: string;
  cacheEnabled: boolean;
  /** L'entrée dépasse le plafond de taille : le traitement est suspendu. */
  tooLarge: boolean;
  isOpen: (path: string) => boolean;
  setInput: (text: string) => void;
  setInputFile: (file: File) => void;
  setCacheEnabled: (value: boolean) => void;
  setQuery: (query: string) => void;
  toggleNode: (path: string) => void;
  selectNode: (path: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  nextMatch: () => void;
  prevMatch: () => void;
  format: () => void;
  minify: () => void;
  reset: () => void;
}

export function useJsonLinterStore(): JsonLinterStore {
  const [cacheEnabled, setCacheEnabled] = usePersistentBoolean('devtools:json:cache');
  const [input, setInputValue] = useCachedState('devtools:json:input', cacheEnabled);
  const [query, setQueryState] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['$']));
  const [manualSelected, setManualSelected] = useState<string | null>(null);
  const [matchIndex, setMatchIndex] = useState(0);

  // Garde-fou de taille : au-delà du plafond, on ne parse pas (message dédié).
  const tooLarge = isInputTooLarge(input, INPUT_LIMITS.json);

  // Le parsing (et la construction de l'arbre) ne suit que la saisie stabilisée :
  // la frappe reste fluide même sur de gros documents.
  const debouncedInput = useDebouncedValue(input);
  const parsed = useMemo(() => {
    if (isInputTooLarge(debouncedInput, INPUT_LIMITS.json)) return null;
    return debouncedInput.trim() === '' ? null : parseJson(debouncedInput);
  }, [debouncedInput]);
  const tree = useMemo(() => (parsed?.ok ? buildTree(parsed.value) : null), [parsed]);
  const error = parsed && !parsed.ok ? parsed.error : null;
  const warnings = parsed?.ok ? parsed.warnings : [];

  const { byId, parentOf } = useMemo(() => {
    const nodes = new Map<string, TreeNode>();
    const parents = new Map<string, string>();
    if (tree) {
      const walk = (node: TreeNode, parent: string | null) => {
        nodes.set(node.path, node);
        if (parent) parents.set(node.path, parent);
        node.children.forEach((child) => walk(child, node.path));
      };
      walk(tree, null);
    }
    return { byId: nodes, parentOf: parents };
  }, [tree]);

  const matches = useMemo(
    () => (tree && parsed?.ok ? searchTree(tree, parsed.value, query) : []),
    [tree, parsed, query],
  );
  const matchSet = useMemo(() => new Set(matches), [matches]);

  const matchPosition = matches.length > 0 ? Math.min(matchIndex, matches.length - 1) : 0;
  const activeMatch = matches.length > 0 ? matches[matchPosition] : null;
  const selected = manualSelected ?? activeMatch;

  const ancestorsOpen = useMemo(() => {
    const set = new Set<string>();
    if (selected) {
      set.add(selected);
      let current = parentOf.get(selected);
      while (current) {
        set.add(current);
        current = parentOf.get(current);
      }
    }
    return set;
  }, [selected, parentOf]);

  const isOpen = useCallback(
    (path: string) => expanded.has(path) || ancestorsOpen.has(path),
    [expanded, ancestorsOpen],
  );

  const selectedNode = selected ? (byId.get(selected) ?? null) : null;
  const selectedJson = selectedNode ? formatJson(selectedNode.raw) : '';

  const setInput = useCallback(
    (text: string) => {
      setInputValue(text);
      setMatchIndex(0);
      setManualSelected(null);
    },
    [setInputValue],
  );

  const setInputFile = useCallback(
    (file: File) => {
      readTextFile(file, setInput);
    },
    [setInput],
  );

  const setQuery = useCallback((next: string) => {
    setQueryState(next);
    setMatchIndex(0);
    setManualSelected(null);
  }, []);

  const toggleNode = useCallback(
    (path: string) =>
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      }),
    [],
  );

  const selectNode = useCallback((path: string) => setManualSelected(path), []);

  const expandAll = useCallback(() => {
    const all = new Set<string>();
    byId.forEach((node) => {
      if (!node.primitive) all.add(node.path);
    });
    setExpanded(all);
  }, [byId]);

  const collapseAll = useCallback(() => setExpanded(new Set()), []);

  const nextMatch = useCallback(() => {
    setManualSelected(null);
    setMatchIndex((i) => (matches.length ? (i + 1) % matches.length : 0));
  }, [matches.length]);

  const prevMatch = useCallback(() => {
    setManualSelected(null);
    setMatchIndex((i) => (matches.length ? (i - 1 + matches.length) % matches.length : 0));
  }, [matches.length]);

  // Reformatage/minification : on re-parse l'entrée COURANTE (pas la version
  // debouncée) pour que l'action reflète exactement ce qui est affiché.
  const format = useCallback(() => {
    const current = parseJson(input);
    if (current.ok) setInput(formatJson(current.value));
  }, [input, setInput]);

  const minify = useCallback(() => {
    const current = parseJson(input);
    if (current.ok) setInput(minifyJson(current.value));
  }, [input, setInput]);

  const reset = useCallback(() => {
    setInputValue('');
    setQueryState('');
    setExpanded(new Set(['$']));
    setManualSelected(null);
    setMatchIndex(0);
  }, [setInputValue]);

  return {
    input,
    query,
    error,
    warnings,
    valid: !!parsed?.ok,
    tree,
    matches,
    matchPosition,
    matchSet,
    selected,
    selectedJson,
    cacheEnabled,
    tooLarge,
    isOpen,
    setInput,
    setInputFile,
    setCacheEnabled,
    setQuery,
    toggleNode,
    selectNode,
    expandAll,
    collapseAll,
    nextMatch,
    prevMatch,
    format,
    minify,
    reset,
  };
}
