/**
 * Hooks de mise en cache opt-in.
 *
 * Par défaut, les outils démarrent vierges (conformément à la philosophie du
 * projet). Mais l'utilisateur peut activer, par outil, la **conservation en cache**
 * de ses textes : la préférence (toggle) est toujours persistée ; le contenu n'est
 * persisté que lorsque le cache est activé, et nettoyé dès qu'il est désactivé.
 *
 * Clés localStorage préfixées `devtools:` pour éviter les collisions.
 */
import { useCallback, useEffect, useState } from 'react';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* localStorage indisponible : on ignore. */
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* idem */
  }
}

/** Booléen persisté dans localStorage (préférence de toggle). */
export function usePersistentBoolean(
  key: string,
  fallback = false,
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    const stored = read(key);
    return stored === 'true' ? true : stored === 'false' ? false : fallback;
  });
  const set = useCallback(
    (next: boolean) => {
      setValue(next);
      write(key, String(next));
    },
    [key],
  );
  return [value, set];
}

/**
 * État texte dont la persistance suit `enabled` : restauré au montage si le cache
 * était activé, ré-écrit à chaque changement tant qu'il l'est, supprimé sinon.
 */
export function useCachedState(
  key: string,
  enabled: boolean,
  initial = '',
): [string, (value: string) => void] {
  const [value, setValue] = useState<string>(() => (enabled ? (read(key) ?? initial) : initial));

  useEffect(() => {
    if (enabled) write(key, value);
    else remove(key);
  }, [enabled, key, value]);

  return [value, setValue];
}
