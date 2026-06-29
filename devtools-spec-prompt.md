# Prompt de spécification — DevTools Hub

> À copier-coller dans Claude Code / Copilot / autre agent de dev. Adapter les sections entre `[crochets]` si besoin.

## Contexte & objectif

Je veux créer un site statique **DevTools Hub** regroupant plusieurs petits outils pour développeurs, hébergé gratuitement sur **GitHub Pages**. C'est un mono-repo avec plusieurs outils indépendants partageant la même coquille (shell) applicative, le même système de design et la même architecture de code.

Je veux reprendre la stack et les patterns déjà utilisés dans mon projet [`QrCodeGenerator`](https://github.com/kevingrillet/QrCodeGenerator) :

- **Build** : Vite
- **UI** : React + TypeScript
- **Style** : Tailwind CSS v4 (config CSS-first, `@theme inline`, design tokens en variables CSS, plusieurs thèmes sélectionnables, mode clair/sombre)
- **Tests unitaires/composants** : Vitest + Testing Library
- **Tests e2e** : Playwright
- **Documentation composants** : Storybook
- **Qualité** : ESLint + Prettier
- **CI/CD** : GitHub Actions → déploiement GitHub Pages
- **i18n maison** (fr/en) sans dépendance externe, type `Messages` garanti complet
- **Aucune dépendance runtime lourde** : tout calcul/algorithme codé "from scratch" si raisonnable, sauf libs très ciblées et justifiées (comme `qr-code-styling` dans le projet de référence)
- 100% statique, **aucune donnée envoyée à un serveur** (tout tourne dans le navigateur)
- **Multi-page** : un routeur avec une route dédiée par outil (`/json-linter`, `/text-diff`, …), pas une SPA à onglets. Chaque outil doit être **lazy-loadé** (code-splitting par route) pour qu'un visiteur ne télécharge que le JS de l'outil consulté. Permet le deep-link, l'indexation, et un développement réellement outil-par-outil.
- **Pas de persistance de l'état des outils** (pas de `localStorage` pour le contenu saisi/édité). Seuls les **préférences globales** (thème choisi, mode clair/sombre, langue) sont persistées — exactement comme `useTheme`/`I18nProvider` dans le projet QR. Chaque outil démarre "vierge" à chaque visite/rechargement.
- **Composants partagés** : une vraie lib de design system interne (`src/components/ui/` — boutons, inputs, panels, badges, accordéons, etc.), avec **Storybook comme catalogue formel et source de vérité** dès le démarrage du socle (pas ajouté après-coup). Chaque composant partagé a sa story documentée (variants, états, a11y) avant d'être consommé par les outils.

## Architecture logicielle — pattern CQRS-like

Je veux une séparation claire **Command / Query**, dans l'esprit du pattern _Strategy + Registry_ déjà utilisé pour les payloads QR :

- **Queries** (lecture pure, sans effet de bord) : fonctions pures qui _dérivent_ un résultat à partir d'un état en entrée (ex. : parser un JSON et produire un arbre, calculer un diff entre deux chaînes, analyser un texte Markdown). Testables unitairement sans React, sans mutation.
- **Commands** (écriture, transformation d'état) : actions qui modifient l'état applicatif d'un outil (ex. : appliquer une correction au JSON, changer la couleur sélectionnée, réinitialiser un outil). Centralisées, pas de mutation directe dispersée dans les composants.
- Chaque outil expose son état + ses commands + ses queries via un **hook dédié** (ex. `useJsonLinterStore`), consommé par les composants de présentation. Les composants ne contiennent pas de logique métier.
- Toute logique métier réutilisable (parsing, diff, calcul de contraste, etc.) vit dans `src/lib/<outil>/`, **pure et testée**, indépendante de React — comme `src/lib/payloads/` et `src/lib/contrast.ts` dans le projet QR.
- Un **registre** centralise la liste des outils disponibles (nom, route, icône, description) pour générer automatiquement la page d'accueil et la navigation — comme le registre des types de payload QR.

## Structure de fichiers attendue

```
devtools-hub/
├── .github/workflows/        # CI + déploiement Pages
├── .storybook/
├── public/
├── src/
│   ├── app/                  # Shell applicatif (layout, router multi-page, navigation)
│   │   ├── routes.tsx        # Déclaration des routes + lazy() par outil
│   │   └── HomePage.tsx      # Page d'accueil générée depuis le registre
│   ├── components/ui/        # Design system partagé (Button, Input, Panel, Badge, Accordion...)
│   │   └── *.stories.tsx     # Storybook = catalogue source de vérité
│   ├── tools/
│   │   ├── json-linter/
│   │   │   ├── lib/          # queries/commands pures (parse, tree, query/search)
│   │   │   ├── components/   # UI spécifique (TreeView, SearchBar, ...)
│   │   │   ├── useJsonLinterStore.ts
│   │   │   └── index.ts      # export de la route + entrée registre
│   │   ├── text-diff/
│   │   ├── code-linter/
│   │   │   └── lib/languages/  # plugins par langage (js.ts, css.ts, html.ts, md.ts...)
│   │   ├── markdown-editor/
│   │   ├── color-palette-rgaa/
│   │   ├── encoder-decoder/
│   │   │   └── lib/formats/    # plugins par format (base64.ts, url.ts, jwt.ts...)
│   │   ├── fake-data-generator/
│   │   │   └── lib/generators/ # plugins par type de donnée
│   │   └── hash-checksum/
│   ├── lib/                  # utilitaires partagés (contrast.ts, etc.)
│   ├── i18n/                 # messages.ts (fr/en), I18nProvider
│   ├── theme.ts               # gestion des 4 thèmes (design tokens) + mode clair/sombre
│   ├── index.css              # @theme inline, tokens CSS des 4 thèmes
│   └── registry.ts            # registre des outils (nom, route, icône, description)
├── tests/                    # e2e Playwright
├── eslint.config.js
├── vite.config.ts
└── README.md
```

## Outils à développer (v1)

### 1. JSON Linter / Viewer

- Coller ou importer un JSON
- Validation + messages d'erreur clairs (ligne/colonne si possible)
- **Vue arborescente** repliable/dépliable, avec types affichés (string/number/bool/null/array/object)
- **Recherche / query** dans l'arbre : filtre par clé, par valeur, et idéalement support d'une syntaxe simple type JSONPath (`$.users[0].name`) ou au moins une recherche texte avec surlignage + navigation entre résultats
- Bonus : reformatage / minification, copie du nœud sélectionné

### 2. Comparateur de texte (Text Diff)

- Deux zones de texte (ou import de 2 fichiers)
- **Sélecteur de granularité** : l'utilisateur peut basculer entre diff **caractère**, **mot** et **ligne** à la volée sur le même contenu (pas figé au chargement) — chaque mode a son propre algorithme dans `lib/diff/` (`charDiff`, `wordDiff`, `lineDiff`), partageant un type de résultat commun (`DiffOp[]`) pour que le composant d'affichage reste unique
- Affichage type "before/after" avec surlignage ajout/suppression
- Options : ignorer la casse, ignorer les espaces, vue côte-à-côte vs unifiée

### 3. Linter de code (multi-langage, paramétrable)

- **Sélecteur de langage** dans l'UI (JS/TS, CSS, HTML, JSON déjà couvert par l'outil 1, Markdown — extensible facilement à d'autres langages)
- Chaque langage est un **plugin** dans `src/tools/code-linter/lib/languages/<lang>.ts` respectant une interface commune `LanguageLinter` (cf. pattern Strategy/Registry des payloads QR) : `{ id, label, lint(source: string, rules?: RuleConfig): LintResult[] }`. Ajouter un langage = ajouter un plugin + une entrée registre, sans toucher à l'UI.
- **Règles paramétrables** : panneau de configuration permettant d'activer/désactiver des règles par langage et d'ajuster leur sévérité (info/warning/error), avec un jeu de règles par défaut raisonnable
- Affichage des erreurs/warnings avec ligne/colonne, regroupées par règle et par sévérité
- v1 réaliste par langage : heuristiques/règles maison écrites à la main (regex + parsing simple) pour JS/TS, CSS, HTML — pas d'intégration d'ESLint complet (trop lourd en runtime browser). À documenter clairement comme "linter pédagogique/léger", pas un remplaçant d'ESLint/Stylelint en local
- **Jeu de règles par défaut v1 (raisonnable, à étendre ensuite)** :
  - **JS/TS** : `no-var` (var → let/const), `no-console` (warning sur `console.log` oublié), `eqeqeq` (`==`/`!=` au lieu de `===`/`!==`), `no-unused-vars` (détection heuristique simple, pas d'analyse de portée complète), `semi` (point-virgule manquant), `no-debugger`
  - **CSS** : couleurs dupliquées non factorisées (heuristique simple), `!important` détecté (warning), propriété dupliquée dans un même bloc, unité manquante sur une valeur numérique non-nulle
  - **HTML** : attribut `alt` manquant sur `<img>`, balises non fermées, attribut `id` dupliqué dans le document, lien `<a>` sans `href` ni `role`
  - **Markdown** : lien sans texte ni URL, titres qui sautent un niveau (`#` puis `###` directement), ligne de code sans langage spécifié sur un bloc ` `
  - Chaque règle reste **désactivable individuellement** et a une sévérité par défaut modifiable via le panneau de configuration

### 4. Éditeur Markdown

- Édition avec aperçu live (split view)
- Rendu Markdown → HTML sans dépendance lourde si possible (sinon une lib ciblée comme `marked` ou `markdown-it`, à isoler dans une couche adaptateur comme `qr.ts`)
- Bonus : export HTML, copie, sanitization du HTML généré (sécurité XSS)

### 5. Générateur de palette de couleurs RGAA (accessibilité)

- Entrée : une ou plusieurs couleurs de base
- Calcul des ratios de contraste WCAG/RGAA (réutiliser/étendre la logique de `contrast.ts` du projet QR)
- Suggestion de variantes (texte/fond) respectant les seuils AA/AAA selon la taille de texte
- Affichage visuel de la palette avec badges de conformité (AA, AAA, échec) et le ratio chiffré
- Bonus : export de la palette (CSS variables, JSON, Tailwind config)

### 6. Encodeur / Décodeur

- **Sélecteur de format** : Base64, URL (encode/decode), HTML entities, JWT (décodage uniquement — header + payload, **sans vérification de signature** puisque tout est client-side et qu'on n'a pas la clé)
- Entrée texte → sortie encodée/décodée en direct, avec bouton d'inversion (swap input/output) et copie rapide
- Pour le JWT : affichage structuré header/payload (avec timestamps `iat`/`exp` traduits en date lisible), alerte claire si le token est expiré ou malformé
- Architecture en plugins comme le linter (`Encoder { id, label, encode(input), decode(input) }`) pour pouvoir ajouter facilement Hex, ROT13, etc. plus tard

### 7. Générateur de données factices (faker-like)

- **v1 centrée sur le Lorem Ipsum** : générateur de texte factice paramétrable (nombre de mots / phrases / paragraphes, avec ou sans le `"Lorem ipsum dolor sit amet..."` classique en en-tête), copie rapide du résultat
- Architecture pensée dès le départ en **registre de générateurs** (`FakerGenerator { id, label, generate(seed?): unknown }`) pour que les types suivants (noms, emails, UUID, dates, adresses, etc.) s'ajoutent comme plugins sans toucher à l'UI — le **builder de schéma multi-champs** (composer plusieurs colonnes + export JSON/CSV/SQL) sera la suite logique une fois 2-3 générateurs disponibles, mais n'est pas requis pour la v1
- Génération **déterministe optionnelle** via seed dès la v1 (pratique pour reproduire un résultat), même avec un seul générateur disponible

### 8. Hash / Checksum

- Entrée : texte ou fichier (drag & drop)
- Calcul de plusieurs algorithmes en parallèle : MD5, SHA-1, SHA-256, SHA-512 (via `SubtleCrypto` natif du navigateur pour SHA-*, lib légère ou implémentation maison pour MD5 qui n'est pas dans `SubtleCrypto`)
- Affichage de tous les hash calculés avec copie individuelle
- **Comparateur de hash** : champ pour coller un hash attendu et vérifier la correspondance (utile pour vérifier l'intégrité d'un téléchargement)

## Exigences transverses

- **Accessibilité (RGAA/WCAG)** : navigation clavier complète, focus visible, contrastes suffisants sur l'UI elle-même, attributs ARIA pertinents — cohérent avec le fait qu'un des outils porte justement sur l'accessibilité
- **i18n fr/en** dès le départ, sur le modèle du projet QR
- **Thèmes** : répliquer les **4 identités visuelles** du projet QR (`default`, `atelier`, `blueprint`, `aurora`) + mode clair/sombre sur le thème `default`, exactement comme dans le projet de référence
- **Tests** : chaque module `lib/` (queries/commands purs) doit être testé unitairement à 100% ; au moins un parcours e2e par outil
- **Performance** : tout calcul lourd (diff, parsing JSON volumineux) doit éviter de bloquer l'UI (envisager Web Worker si nécessaire pour gros fichiers)
- **Aucun appel réseau** : tout doit fonctionner offline une fois chargé
- **Navigation** : page d'accueil listant les outils (générée depuis le registre), routing client (React Router ou équivalent léger), chaque outil sur sa propre route pour permettre le deep-link

## Ce que je veux en retour

1. Une proposition de structure de fichiers détaillée (au-delà du squelette ci-dessus)
2. Le détail de l'interface `Command`/`Query` par outil (types TypeScript), ainsi que les interfaces de plugin (`LanguageLinter`, `Encoder`, `FakerGenerator`)
3. Un **plan de développement strictement incrémental**, livrable étape par étape :
   - **Étape 0 — Socle** : shell applicatif, router multi-page avec lazy-loading, i18n, 4 thèmes + mode clair/sombre, registre d'outils vide, page d'accueil, Storybook + premiers composants `ui/` (Button, Panel, Input, Badge), CI/CD de base
   - **Étape 1 à N — un outil à la fois**, dans l'ordre que tu proposeras (probablement par complexité croissante), chaque étape se terminant par un outil livrable, testé (unitaire + e2e) et documenté
   - Pas d'étape ne mélangeant deux outils
4. Pour chaque outil, la liste des cas de test unitaires prioritaires sur la couche `lib/`
5. Le choix argumenté de dépendances externes strictement nécessaires (ex. pour le markdown, ou MD5 qui manque dans `SubtleCrypto`), en gardant la philosophie "runtime dependencies minimales" du projet QR
6. Une proposition d'ordre de priorité pour les 8 outils, avec justification (complexité, dépendances communes à factoriser en premier, etc.)

## Questions ouvertes à trancher avant de commencer

- Pour le **générateur de données factices**, une fois le Lorem Ipsum en place, quel devrait être le 2e générateur à ajouter (UUID ? noms/emails ? dates ?) — et faut-il prévoir une localisation fr/en cohérente avec l'i18n du site pour les futurs générateurs textuels (noms, adresses) ?
