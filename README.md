# DevTools Hub

Collection d'**outils pour développeurs**, regroupés dans un même site **statique**,
hébergeable gratuitement sur **GitHub Pages**. Chaque outil tourne **100% dans le
navigateur** : aucune donnée n'est envoyée à un serveur.

Construit sur le socle [Node Template](https://github.com/kevingrillet/NodeTemplate) :
mêmes stack, thèmes, i18n et outillage.

---

## Stack

| Rôle                         | Outil                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Build / dev                  | [Vite](https://vitejs.dev/)                                                           |
| UI                           | [React](https://react.dev/) + TypeScript                                              |
| Style                        | [Tailwind CSS](https://tailwindcss.com/) v4 (config CSS-first, `@theme inline`)       |
| Routage                      | Maison — _hash router_, code-splitting par outil (voir [Architecture](#architecture)) |
| Thèmes                       | Maison — runtime, 4 identités × clair/sombre                                          |
| i18n                         | Maison — FR/EN, sans dépendance                                                       |
| Tests unitaires / composants | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)       |
| Tests e2e                    | [Playwright](https://playwright.dev/)                                                 |
| Documentation des composants | [Storybook](https://storybook.js.org/)                                                |
| Qualité                      | ESLint + Prettier                                                                     |
| PWA                          | manifest + service worker (offline)                                                   |
| CI/CD                        | GitHub Actions                                                                        |

Les dépendances _runtime_ sont volontairement minimales (`react`, `react-dom`, plus
quelques libs ciblées et justifiées au cas par cas — `marked`/`dompurify` pour
l'éditeur Markdown, `qr-code-styling` pour le générateur de QR). Chacune est isolée
dans une couche adaptateur et cantonnée au chunk de son outil. Toute autre logique
métier (parsing, diff, hash, lint…) est codée « from scratch », pure et testée.

---

## Démarrage

> Node **≥ 24** requis (voir `.nvmrc`).

```bash
npm install
npm run dev          # serveur de développement
```

### Commandes

| Commande            | Effet                                                  |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Serveur de développement (HMR).                        |
| `npm run build`     | Vérifie les types puis construit le site dans `dist/`. |
| `npm run preview`   | Sert le build de production localement.                |
| `npm run test`      | Tests unitaires / composants (Vitest).                 |
| `npm run test:cov`  | Tests avec couverture.                                 |
| `npm run test:e2e`  | Tests end-to-end (Playwright).                         |
| `npm run lint`      | ESLint.                                                |
| `npm run format`    | Formate le code (Prettier).                            |
| `npm run typecheck` | Vérification des types sans émission.                  |
| `npm run storybook` | Storybook en local (port 6006).                        |
| `npm run check`     | Chaîne complète : format + lint + typecheck + test.    |

---

## Architecture

Mono-repo d'outils indépendants partageant une coquille (shell), un design system
et des conventions communes.

```
src/
├─ app/             Shell : router (hash), routes (lazy), Layout, HomePage, NotFound
├─ components/
│  ├─ ui/           Design system (Button, Input, Textarea, Select, Checkbox, Badge, Panel, Accordion, CopyButton) + stories
│  └─ …             Contrôles thème/langue
├─ tools/           Un dossier par outil (lib/ pur + components/ + use<Tool>Store + index)
├─ lib/             Utilitaires partagés purs (cx, …)
├─ hooks/           useTheme, useCachedState (cache opt-in)
├─ i18n/            I18nProvider + messages (FR/EN)
├─ registry.ts      Registre des outils (id, route, icône, clés i18n, tags, import lazy)
├─ theme.ts         Déclaration des thèmes
└─ index.css        Tokens des thèmes (variables CSS)
tests/              specs Playwright (e2e)
```

### Routage (maison, hash-based)

Le routeur (`src/app/router.tsx`) lit `location.hash` (`#/json-linter`). Ce choix
évite les 404 au rechargement d'un deep-link sur GitHub Pages (pas de réécriture
serveur nécessaire) et n'ajoute **aucune dépendance runtime**. Chaque outil est
chargé en `lazy()` (un _chunk_ JS par outil) : un visiteur ne télécharge que le code
de l'outil consulté.

### Registre d'outils

`src/registry.ts` est la **source unique** de la liste des outils (id, route, icône,
clés i18n titre/description, import paresseux). La page d'accueil et la navigation en
sont dérivées. **Ajouter un outil = ajouter une entrée** dans le registre — sans
toucher au shell.

### Pattern Command / Query (CQRS-like)

Chaque outil sépare strictement :

- **Queries** — fonctions **pures**, sans effet de bord, qui dérivent un résultat
  d'un état (parser un JSON, calculer un diff…). Testables sans React.
- **Commands** — transformations d'état centralisées (appliquer une correction,
  réinitialiser…). Pas de mutation dispersée dans les composants.

La logique vit dans `src/tools/<outil>/lib/` (pure, testée à 100%) ; un hook dédié
(`use<Outil>Store`) expose état + commands + queries aux composants de présentation,
qui ne portent aucune logique métier. Les outils extensibles (linter, encodeur,
générateur de données) utilisent un pattern **Strategy + Registry** : chaque langage /
format / générateur est un plugin respectant une interface commune.

---

## Outils (v1)

Tous client-side, accessibles depuis l'accueil et en deep-link (`#/<route>`) :

| Outil                | Route                   | Résumé                                                                                                          |
| -------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| Encodeur / Décodeur  | `#/encoder-decoder`     | Base64, URL, entités HTML, décodage JWT (sans vérif. de signature).                                             |
| Hash / Checksum      | `#/hash-checksum`       | MD5 (maison) + SHA-1/256/512 (SubtleCrypto), texte/fichier, comparateur.                                        |
| Données factices     | `#/fake-data-generator` | Lorem Ipsum + UUID v4, déterministe par graine (registre de plugins).                                           |
| Palette RGAA         | `#/color-palette-rgaa`  | Contraste WCAG, conformité AA/AAA, suggestions, export CSS/JSON/Tailwind.                                       |
| Comparateur de texte | `#/text-diff`           | Diff caractère/mot/ligne, options casse/espaces, unifié ou côte-à-côte.                                         |
| JSON Linter / Viewer | `#/json-linter`         | Validation localisée, arbre repliable, recherche texte/JSONPath, format/minify.                                 |
| Éditeur Markdown     | `#/markdown-editor`     | Aperçu live, HTML sanitizé (anti-XSS), export par copie, contenu d'exemple localisé.                            |
| Linter de code       | `#/code-linter`         | JS/TS, C#, CSS, HTML, JSON, YAML, Markdown — règles heuristiques **pédagogiques**, **reformatage** best-effort. |
| Visualiseur CSV      | `#/csv-viewer`          | Parser maison (guillemets/échappements), table **triable** par colonne, export CSV.                             |
| Générateur de QR     | `#/qr-generator`        | Texte/URL/WiFi/vCard/géo…, personnalisation (couleurs, forme, logo), export PNG/SVG.                            |

> Le linter de code est volontairement **léger et pédagogique** (heuristiques
> regex/parsing simple) : ce n'est pas un remplaçant d'ESLint/Stylelint.

**Recherche & tri** : l'accueil trie les outils par titre (localisé) et offre une
recherche par nom, description ou tag. **Cache opt-in** : Text Diff, Markdown,
Linter et CSV proposent un interrupteur « Conserver en cache » (persistance locale
du contenu, désactivé par défaut). Hors cela, les outils démarrent vierges.

---

## Thèmes

Deux axes **indépendants**, choisis au runtime et persistés dans `localStorage` :
l'**identité visuelle** (`default` / `atelier` / `blueprint` / `aurora`, via
`data-theme`) et le **mode clair/sombre** (classe `dark`). Les tokens vivent dans
`src/index.css` ; `src/theme.ts` + `src/hooks/useTheme.ts` gèrent l'état et l'anti-flash.

---

## i18n

Implémentation maison sans dépendance. `t('a.b.c')` résout une clé pointée dans le
dictionnaire de la langue active. Les dictionnaires `fr` et `en` partagent l'interface
`Messages`, ce qui garantit qu'aucune clé n'est oubliée.

**Ajouter une chaîne** : étendre l'interface `Messages` (`src/i18n/messages.ts`), puis
renseigner la valeur dans `fr` **et** `en`.

---

## Déploiement (GitHub Pages)

Le workflow `.github/workflows/deploy.yml` construit et publie `dist/` à chaque push
sur `main`. `base: './'` produit des chemins relatifs, compatibles avec un hébergement
sous sous-chemin (`https://<user>.github.io/<repo>/`). Le routage par _hash_ garantit
que les deep-links et rechargements fonctionnent sans configuration serveur.

Activez Pages dans les réglages du dépôt (source : **GitHub Actions**).

---

## Licence

[GNU General Public License v3.0 ou ultérieure](./LICENSE).
