/**
 * Routeur maison minimaliste, basé sur le _hash_ de l'URL (`#/json-linter`).
 *
 * Pourquoi le hash plutôt que l'History API ? Sur GitHub Pages (hébergement
 * statique, pas de réécriture serveur), un deep-link rechargé vers `/json-linter`
 * renverrait un 404 ; avec le hash, le serveur ne voit que `/` et le routage se
 * fait côté client. Bénéfice secondaire : zéro dépendance runtime.
 *
 * API : `useHashLocation()` (chemin courant, réactif), `navigate()` (changement
 * programmatique) et `<Link>` (navigation déclarative, accessible — un simple
 * `<a href="#/...">` qui supporte clic-milieu, « ouvrir dans un nouvel onglet », etc.).
 */
/* eslint-disable react-refresh/only-export-components --
   Ce module regroupe volontairement l'API publique du routeur : les helpers
   (currentPath, navigate, toHref), le hook useHashLocation et le composant Link.
   Le Fast Refresh ne s'y applique pas, la contrainte « un seul composant exporté »
   n'a pas de sens ici. */
import { useEffect, useState, type AnchorHTMLAttributes } from 'react';

/** Normalise une valeur de hash brute en chemin canonique (`/`, `/outil`). */
function normalize(rawHash: string): string {
  // rawHash = window.location.hash, ex. '#/json-linter', '', '#', '#/'.
  const raw = rawHash.replace(/^#/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  if (path === '/') return '/';
  // Retire un éventuel slash final (sauf racine) pour que '/x' et '/x/' coïncident.
  return path.replace(/\/+$/, '') || '/';
}

/** Chemin courant déduit de `location.hash` (`/` par défaut). */
export function currentPath(): string {
  if (typeof window === 'undefined') return '/';
  return normalize(window.location.hash);
}

/** Navigue vers un chemin (déclenche `hashchange`, donc le re-render). */
export function navigate(to: string): void {
  const path = to.startsWith('/') ? to : `/${to}`;
  window.location.hash = path;
}

/** Construit la valeur `href` d'un lien interne (`#/...`). */
export function toHref(to: string): string {
  return `#${to.startsWith('/') ? to : `/${to}`}`;
}

/**
 * S'abonne au chemin courant et le renvoie. Tout composant qui l'utilise se
 * re-render à chaque changement de hash.
 */
export function useHashLocation(): string {
  const [path, setPath] = useState<string>(currentPath);
  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    // Resynchronise au montage au cas où le hash aurait changé entre l'init du
    // state et la pose de l'écouteur.
    onChange();
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Chemin interne cible (ex. `/json-linter`). */
  to: string;
}

/** Lien de navigation interne. Rendu en `<a href="#/...">` natif et accessible. */
export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={toHref(to)} {...rest}>
      {children}
    </a>
  );
}
