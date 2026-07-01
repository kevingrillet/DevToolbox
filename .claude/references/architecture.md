# Architecture

Site web **statique** (GitHub Pages), **100% client-side**. Complète l'`AGENTS.md`
du dépôt (qui fait foi). Volontairement court.

## Stack commune

Vite · React + TypeScript strict · Tailwind CSS (CSS-first, `@theme inline`) ·
Vitest + Testing Library · Playwright · Storybook · ESLint (flat) + Prettier ·
PWA (offline) · CI/CD GitHub Actions (qualité + tests → déploiement Pages).

> Versions exactes : voir `package.json` (ne pas les figer ici pour éviter l'obsolescence).

## Principes transverses

- Dépendances runtime minimales (`react`, `react-dom` + libs domaine justifiées, isolées).
- Thèmes runtime à 2 axes indépendants : identité (`data-theme`) × clair/sombre (`dark`).
- i18n maison FR/EN typée (`src/i18n/`).
- Déploiement : `deploy.yml` à chaque push sur `main` ; `base: './'` (sous-chemin Pages).

## Ce dépôt : DevToolbox (hub d'outils dev)

Plusieurs **outils indépendants** regroupés, **aucun appel réseau** (tout offline).
Bâti sur le socle NodeTemplate.

- **Routeur maison à base de hash** (`src/app/router.tsx`) : `#/outil`, zéro dépendance,
  pas de 404 au rechargement sur Pages (`useHashLocation`, `navigate`, `<Link>`).
- **`src/registry.ts`** = source **unique** des outils (`ToolMeta` : id, path, icon,
  titleKey, descriptionKey, `load`, `tags`). Accueil + navigation en dérivent.
- **`src/app/routes.tsx`** : routes → composants `lazy()`, **un chunk JS par outil**.
- **Command / Query par outil** : logique **pure** et testée dans `tools/<outil>/lib/`
  (sans React) ; un hook `use<Outil>Store` expose `{ état, commands, queries }`. Les
  composants restent fins (présentation + état UI).
- **Strategy + Registry** pour les outils extensibles (codecs, langages du linter,
  générateurs faker) : chaque variante = un plugin implémentant une interface commune.
- **Cache opt-in** (`src/hooks/useCachedState.ts`) : désactivé par défaut ; sinon rien
  n'est persisté hors préférences globales (thème/mode/langue).

Structure de référence : `src/tools/encoder-decoder/`.
