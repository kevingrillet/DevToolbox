# AGENTS.md — DevTools Hub

Guide pour agents IA travaillant sur ce dépôt. Lis-le avant de coder.

## Le projet en une phrase

Site **statique** (GitHub Pages) regroupant plusieurs **outils pour développeurs**
indépendants, **100% client-side** : aucune donnée n'est envoyée à un serveur.
Construit sur le socle [NodeTemplate](https://github.com/kevingrillet/NodeTemplate).

## Commandes

| Commande            | Effet                                                              |
| ------------------- | ------------------------------------------------------------------ |
| `npm run dev`       | Serveur de dev (HMR).                                              |
| `npm run check`     | **À lancer avant de conclure** : format + lint + typecheck + test. |
| `npm run build`     | `tsc -b` + build Vite (vérifie aussi le code-splitting).           |
| `npm run test`      | Vitest (unitaires/composants).                                     |
| `npm run test:e2e`  | Playwright (e2e).                                                  |
| `npm run storybook` | Catalogue du design system (port 6006).                            |

Après une modif : `npm run format` puis `npm run check`. Tout doit être vert.

## Stack

Vite · React 19 + TypeScript (strict, `noUnusedLocals`/`noUnusedParameters`) ·
Tailwind v4 (CSS-first, `@theme inline`) · Vitest + Testing Library · Playwright ·
Storybook 10 · ESLint (flat) + Prettier · PWA.

**Dépendances runtime minimales** : `react`, `react-dom`, et libs ciblées justifiées
au cas par cas — `marked` + `dompurify` pour l'éditeur Markdown, `qr-code-styling`
pour le générateur de QR. Chaque exception est **isolée dans une couche adaptateur**
(ex. `qr-generator/lib/qr.ts`) et cantonnée au chunk de son outil. Toute autre logique
(parsing, diff, hash, lint, base64…) est **codée from scratch**, pure et testée.

## Architecture & conventions

### Routage et registre

- Routeur **maison à base de hash** (`src/app/router.tsx`) : `#/outil`. Évite les
  404 au rechargement sur Pages, zéro dépendance. `useHashLocation()`, `navigate()`,
  `<Link>`.
- `src/registry.ts` = **source unique** des outils (`ToolMeta` : id, path, icon,
  titleKey, descriptionKey, `load`). La page d'accueil et la navigation en dérivent.
- `src/app/routes.tsx` mappe les routes aux composants `lazy()`. Chaque outil =
  **un chunk JS** (code-splitting par route). Les composants lazy sont précompilés
  au niveau module (`createElement(lazy(...))`) — ne pas créer de composant pendant
  le render (la règle ESLint `react-hooks/static-components` l'interdit).

### Pattern Command / Query (par outil)

- **Queries** : fonctions **pures**, sans effet de bord, qui dérivent un résultat
  d'un état. Vivent dans `src/tools/<outil>/lib/`, testées **à 100%**, sans React.
- **Commands** : transformations d'état centralisées (pas de mutation éparpillée).
- Un hook `use<Outil>Store` expose `{ état, commands, queries }`. Les composants de
  présentation **ne contiennent aucune logique métier**.
- Outils extensibles (encodeur, linter, faker) : pattern **Strategy + Registry** —
  chaque format/langage/générateur est un plugin implémentant une interface commune
  (ex. `Codec`), ajouté au registre sans toucher à l'UI.

### Ajouter un outil (procédure)

1. `src/tools/<slug>/lib/` : la logique pure + ses tests (`*.test.ts`).
2. `use<Outil>Store.ts` : état + commands + queries.
3. `components/` si besoin (UI spécifique), puis `<Outil>Page.tsx` (présentation).
4. `index.ts` : `export { default } from './<Outil>Page';`.
5. Ajouter l'entrée dans `src/registry.ts` (`load: () => import('./tools/<slug>')`,
   plus `tags: [...]` — mots-clés techniques en minuscules, neutres en langue, pour
   la recherche/les badges de l'accueil).
6. Ajouter les clés i18n sous `tools.<outilEnCamelCase>` dans `messages.ts` (fr ET en).
7. Au moins **un parcours e2e** dans `tests/<slug>.spec.ts`.

Structure type : voir `src/tools/encoder-decoder/` (référence).

### Cache opt-in du contenu

Un outil peut proposer un interrupteur « Conserver en cache » (libellé partagé
`common.cache`). Brancher via `src/hooks/useCachedState.ts` :
`usePersistentBoolean('devtools:<tool>:cache')` pour le toggle, puis
`useCachedState('devtools:<tool>:<champ>', cacheEnabled)` pour chaque champ texte.
Désactivé par défaut → l'outil reste vierge ; activé → contenu restauré au rechargement.

### Linter de code — langages

`src/tools/code-linter/lib/languages/` : un plugin `LanguageLinter` par langage
(JS/TS, C#, CSS, HTML, JSON, Markdown, YAML). Le plugin JSON réutilise le parseur
de `json-linter/lib/parse`. Ajouter un langage = un plugin + une entrée au registre
`languages/index.ts` + ses labels i18n sous `tools.codeLinter.{languages,rules}`.

Un plugin peut exposer un reformateur optionnel `format?(source): string`
(best-effort, **indentation seule**, basé sur les helpers purs de `lib/format.ts` —
`reindentBrackets`/`reindentHtml`/`cleanup*`). Absent → pas de bouton « Reformater »
pour ce langage. Règle d'or : à défaut de pouvoir reformater sûrement, renvoyer la
source inchangée plutôt que risquer de la casser.

## Design system (`src/components/ui/`)

`Button`, `Input`, `Textarea`, `Select`, `Badge`, `Panel`, `Accordion`, `CopyButton`.
**Storybook est la source de vérité** : tout composant partagé a sa story (variants,
états, a11y) avant d'être consommé. Helper de classes : `src/lib/cx.ts`.

## Thèmes — règle absolue

4 identités (`default`/`atelier`/`blueprint`/`aurora`) × clair/sombre, choisies au
runtime. **Toujours utiliser les tokens** (`bg-canvas`, `bg-surface`, `text-fg`,
`text-fg-muted`, `bg-accent`/`text-accent-fg`, `accent-strong`, `text-danger`,
`text-warning`, `text-success`, `rounded-card`/`rounded-control`, `shadow-card`/`shadow-btn`).
**Jamais de couleur Tailwind en dur** (`text-red-500`…) : elle casserait dans une des
8 combinaisons. Tokens définis dans `src/index.css`.

## i18n

Maison, sans dépendance. `t('a.b.c')`. L'interface `Messages` (`src/i18n/messages.ts`)
garantit la complétude : toute clé doit exister en **fr ET en** (sinon erreur TS).

Un outil **porté depuis un projet externe** peut exposer un helper i18n local qui
préfixe son namespace pour garder ses composants inchangés — voir
`qr-generator/i18n.ts` (`useQrT` préfixe `tools.qr.*`). Les chaînes vivent toujours
sous `tools.<outil>.*` dans `messages.ts` (la règle fr+en reste valable) : seul
l'accès est préfixé.

## Accessibilité (RGAA/WCAG)

Navigation clavier complète, focus visible (géré globalement via `:focus-visible`),
ARIA pertinent, un seul `<h1>` par page (les pages portent leur titre, pas le header).
Un des outils porte sur l'accessibilité : l'app elle-même doit être exemplaire.

## Contraintes

- **Aucun appel réseau** : tout fonctionne offline une fois chargé.
- **Pas de persistance par défaut** : un outil démarre vierge. Seules les
  préférences globales (thème, mode, langue) et le **cache opt-in** (voir plus haut,
  désactivé par défaut) écrivent dans localStorage.
- Calcul lourd (gros JSON, diff volumineux) : envisager un Web Worker pour ne pas
  bloquer l'UI.

## Pièges connus

- Le lien d'évitement déplace le focus par programmation (il NE modifie pas le hash,
  sinon il changerait de route). Voir `Layout.tsx`.
- Les composants `ui/` sont **sans i18n** (réutilisables en Storybook) : passer les
  libellés en props (ex. `CopyButton`).
