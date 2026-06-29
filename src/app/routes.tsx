/**
 * Résolution du chemin courant vers un composant de page.
 *
 *   `/`            → page d'accueil (liste des outils)
 *   `/<outil>`     → composant de l'outil (chargé en `lazy()`, un chunk par outil)
 *   sinon          → page 404
 *
 * Les composants `lazy()` des outils sont construits UNE fois au chargement du
 * module (le registre est statique) et indexés par route : on évite ainsi de
 * recréer un composant à chaque render — ce qui remonterait l'arbre et relancerait
 * le chargement du chunk.
 */
import { createElement, lazy, Suspense, type ReactElement } from 'react';
import { useHashLocation } from './router';
import { TOOLS } from '../registry';
import { HomePage } from './HomePage';
import { NotFound } from './NotFound';
import { useI18n } from '../i18n/I18nProvider';

// On stocke des ÉLÉMENTS React (et non des composants) construits une seule fois :
// stables d'un render à l'autre, et on évite de lier un composant à une variable
// locale au render (que `react-hooks/static-components` interdit).
const TOOL_ELEMENTS = new Map<string, ReactElement>(
  TOOLS.map((tool) => [tool.path, createElement(lazy(tool.load))]),
);

/** Indicateur de chargement affiché pendant le téléchargement d'un chunk d'outil. */
function RouteFallback() {
  const { t } = useI18n();
  return (
    <p role="status" className="py-16 text-center text-fg-muted">
      {t('app.loading')}
    </p>
  );
}

/** Rend la page correspondant au chemin courant. */
export function RouterOutlet() {
  const path = useHashLocation();

  if (path === '/') return <HomePage />;

  const element = TOOL_ELEMENTS.get(path);
  if (!element) return <NotFound />;

  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}
