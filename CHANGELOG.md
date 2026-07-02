# Changelog

Toutes les modifications notables de ce projet sont consignées ici.
Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [0.3.1] — 2026-07-02

### Ajouts

- **Générateur de QR — parité avec l'app dédiée QrCodeGenerator.** Report des
  garde-fous qui manquaient à l'outil porté (`src/tools/qr-generator/lib/limits.ts`,
  pur et testé) :
  - **capacité du QR** : au-delà de la contenance (fonction du niveau de correction),
    l'aperçu affiche un message clair (`tools.qr.preview.tooLong`, FR/EN) et bloque
    l'export au lieu de laisser le moteur `qr-code-styling` échouer ;
  - **poids du logo importé** : refus au-delà de 1 Mio avec message
    (`tools.qr.logo.tooLarge`, FR/EN).

### Corrections

- **Générateur de QR** : validation d'email plus stricte (exige un vrai TLD, rejette
  `x@x.x` / `a@b`, accepte les domaines internationalisés), alignée sur l'app dédiée.

## [0.3.0] — 2026-07-02

### Ajouts

- **Cache opt-in étendu** aux outils **JSON Linter** et **Encodeur / Décodeur**
  (toggle `Conserver en cache`, désactivé par défaut, via
  `usePersistentBoolean` + `useCachedState`). Hash, Faker et Palette en restent
  volontairement exclus (source fichier / sortie générée / état structuré — cache
  incohérent) ; justification dans `AGENTS.md`.
- **Garde-fous de taille d'entrée** (`src/lib/inputLimits.ts`, pur et testé) sur les
  outils à calcul lourd — **JSON, CSV, Linter de code** : au-delà d'un plafond de
  caractères, le traitement est suspendu et un message i18n clair (FR/EN) s'affiche,
  plutôt que de bloquer l'UI. Le **Comparateur de texte** conserve en plus son
  plafond matriciel dédié (`DiffTooLargeError`). Ce sont des seuils, pas des Web Workers.
- **Tests d'accessibilité unitaires** (convention `*.a11y.test.tsx` + helper
  `src/test/a11y.tsx`, repris du socle NodeTemplate) pour `ThemeToggle`,
  `ThemeSelector`, `LanguageSwitcher` et la carte dépliable `Section` (rôles, ARIA
  d'état, navigation clavier, effets observables).
- **Stories Storybook** pour les composants composites sans catalogue : `DiffView`,
  `JsonTreeView`, `QrForm` et la page `MarkdownEditorPage`.
- **Guide d'extension enrichi** « Ajouter un outil » dans `AGENTS.md` (procédure
  step-by-step : lib pure + tests, store, cache/garde-fou, présentation, registre,
  i18n FR/EN, story, test a11y, e2e + axe).

### Sécurité

- **Éditeur Markdown** : durcissement de la sanitization DOMPurify — balises à
  risque bannies (`script`, `style`, `iframe`, `object`, `embed`, `form`…), retrait
  défensif de **tout attribut d'événement** (`on*`) et des `style` inline, et liste
  blanche de protocoles d'URI (neutralise `javascript:`, `data:`, `vbscript:`…).
  Batterie de **tests XSS explicites** (`<svg onload>`, `<img onerror>`, href
  `javascript:`, `<iframe>`, `<style>`, `data:` …).
- **Parseur JSON maison** : **limite de profondeur d'imbrication** (1000 niveaux) qui
  lève une erreur localisée explicite au lieu d'un débordement de pile sur un document
  pathologiquement imbriqué. Tests OK / dépassement (objets et tableaux).
- **`useCachedState`** : accès `localStorage` durcis (gestion explicite de
  `QuotaExceededError` et d'un storage indisponible, dégradation gracieuse) + tests.

### Outillage et CI

- **Couverture Vitest** : `npm run test:cov` (reporters `text`/`text-summary`/
  `json-summary`/`lcov`) et **seuils** dans `vite.config.ts` (lines/functions/
  statements 80, branches 75). La CI publie un résumé de couverture + l'artefact
  `coverage/`.
- **axe-core** dans le smoke e2e (`@axe-core/playwright`, `scanSeriousA11yViolations`
  sur l'accueil, clair + sombre).
- **Lighthouse CI** (`@lhci/cli`, `lighthouserc.json`, workflow `lighthouse.yml`) :
  accessibilité bloquante (≥ 0.9), performance/best-practices/SEO en avertissement.
  `.lighthouseci/` ignoré par Git et nettoyé par les scripts `clean`.

## [0.2.0] — 2026-07-01

### Ajouts

- **Nouvel outil : Générateur de QR code** (`/qr-generator`) — 8 types de contenu
  (texte, URL, WiFi, vCard, e-mail, SMS, téléphone, géo) via un **registre de
  payloads** (pattern Registry/Factory, UI générée depuis les données) ; payloads
  encodés selon leurs formats standard (WIFI:, vCard 3.0/RFC 6350, mailto, geo:…)
  avec échappement des caractères réservés. Personnalisation (couleurs, forme des
  modules, niveau de correction, densité, logo central), **avertissement de
  contraste** pour la lisibilité, export **PNG / SVG** et copie presse-papier.
  Chunk dédié, lazy-loadé.
- **Linter de code** : bouton **« Reformater »** (best-effort, indentation seule —
  jamais le contenu d'une ligne) pour les langages le supportant. Réindentation par
  brackets (JS/TS, C#, CSS, JSON, conscients des chaînes/commentaires) ou par
  profondeur de balises (HTML) ; nettoyage conservateur pour YAML/Markdown. Couche
  pure `lib/format.ts` ; un plugin langage expose un `format?` optionnel.
- **Éditeur Markdown** : démarre désormais avec un **contenu d'exemple** localisé
  (FR/EN) illustrant les capacités du moteur ; « Réinitialiser » le recharge.
- **Visualiseur CSV** : **export CSV** du tableau (échappement des cellules selon le
  délimiteur).

### Modifications

- **Comparateur de texte** : « trier les lignes » devient une **commande** (tri en
  place des deux textes source) plutôt qu'un interrupteur appliqué au diff ; la
  granularité **par défaut passe de « mot » à « ligne »**. Découplage du rendu en
  lignes (`components/rows.ts`) pour la vue côte-à-côte.
- **Comparateur de texte** : **numéros de ligne sur les zones de saisie** Avant/Après
  (gouttière synchronisée au défilement, `components/LineNumberedTextarea.tsx`) et
  **en-tête « Avant / Après »** au-dessus des gouttières de la zone Différences (vues
  unifiée et côte-à-côte).

### Corrections

- **Comparateur de texte (granularité ligne)** : la dernière ligne d'un texte (sans
  saut de ligne final) n'était jamais appariée à une ligne identique terminée par
  `\n`, créant des « lignes différentes » fantômes en fin de comparaison. La clé de
  comparaison ignore désormais le `\r?\n` final (valeur réassemblée inchangée).

### Dépendances

- Ajout de la dépendance runtime **`qr-code-styling`** (génération/stylage/export du
  QR), isolée dans l'adaptateur `qr-generator/lib/qr.ts`. Nouvelle exception assumée
  au principe « tout from scratch » (au même titre que `marked`/`dompurify`),
  cantonnée à un chunk dédié.

### Outillage et documentation

- **Hooks Git versionnés** (`.githooks/`, activés automatiquement par le script npm
  `prepare` à chaque `npm install`) : `commit-msg` (sujet conforme Conventional
  Commits), `pre-commit` (`npm run check`) et `pre-push` (`test:e2e` +
  `build-storybook`, parité CI).
- **Fins de ligne normalisées en LF** via `.gitattributes` (`eol=lf`).
- **Documentation agents migrée vers `AGENTS.md`** (ex-`CLAUDE.md`) ; `CLAUDE.md` et
  `.github/copilot-instructions.md` ne sont plus que des renvois vers `AGENTS.md`.
  Ajout de références Claude Code et du garde-fou `--no-verify`.

## [0.1.0]

### Ajouts (finalisation v1)

- **Nouvel outil : Visualiseur CSV** (`/csv-viewer`) — parser maison (guillemets,
  échappements `""`, sauts de ligne dans les champs), détection du délimiteur,
  table **triable par colonne** (tri numérique ou texte, asc/desc).
- **Conservation en cache opt-in** (toggle persistant) du contenu saisi pour Text
  Diff, Éditeur Markdown, Linter et CSV — via les hooks partagés
  `usePersistentBoolean` / `useCachedState` (`src/hooks/`). Désactivé par défaut.
- **Comparateur de texte** : option « trier les lignes » (compare deux listes sans
  tenir compte de l'ordre).
- **Linter** : langages ajoutés **C#**, **YAML**, **JSON** (validation via le
  parseur JSON maison de l'outil JSON Linter).
- **Accueil** : tri alphabétique par titre **localisé** (re-trié au changement de
  langue), **recherche** (nom / description / tags), tags affichés en badges.
- Nouveau **favicon** (glyphe `</>` sur fond accent) + icône maskable.

### Étape 8 — Outil : Linter de code

- Huitième et dernier outil de la v1 (`/code-linter`), chunk dédié.
- Couche `lib/` pure et testée : runner générique (activation + sévérité par règle)
  et **4 plugins langage** (JS/TS, CSS, HTML, Markdown) implémentant l'interface
  `LanguageLinter`, avec le jeu de règles heuristiques v1 (regex/parsing léger).
- `useCodeLinterStore` : config des règles mémorisée **par langage** ; issues
  dérivées et groupées par sévérité.
- Panneau de configuration (activer/désactiver, ajuster la sévérité info/warning/
  error), résultats avec ligne/colonne. Documenté comme linter **pédagogique**,
  pas un remplaçant d'ESLint/Stylelint.

### Étape 7 — Outil : Éditeur Markdown

- Septième outil (`/markdown-editor`), chunk dédié.
- Premières (et seules) **dépendances runtime** ajoutées : `marked` (rendu) et
  `dompurify` (sanitization anti-XSS), isolées dans une couche adaptateur
  `lib/markdown.ts` (le reste de l'app ne dépend que de cette interface).
- Édition + **aperçu live** en split view ; le HTML affiché est systématiquement
  sanitizé avant injection. Export par copie (Markdown ou document HTML complet).
- Grâce au code-splitting, ces deux libs ne sont téléchargées qu'en visitant l'outil.

### Étape 6 — Outil : JSON Linter / Viewer

- Sixième outil (`/json-linter`), chunk dédié.
- Couche `lib/` pure et testée : **parseur JSON maison** (descente récursive) avec
  erreurs localisées (ligne/colonne), construction d'un **arbre typé** (chemins
  JSONPath), **JSONPath** simple (`$.a[0]['b']`), recherche texte/JSONPath,
  reformatage et minification.
- `useJsonLinterStore` : validation + arbre + recherche dérivés ; pliage, sélection,
  navigation entre résultats, dépliage automatique des ancêtres de la sélection.
- Arbre repliable avec types affichés, surlignage des correspondances, copie du
  nœud sélectionné.

### Étape 5 — Outil : Comparateur de texte

- Cinquième outil (`/text-diff`), chunk dédié.
- Couche `lib/diff/` pure et testée : cœur LCS générique + tokenizers caractère /
  mot / ligne, produisant tous un `DiffOp[]` commun ; options « ignorer la casse »
  et « ignorer les espaces » via une clé de comparaison (texte affiché préservé).
- `useTextDiffStore` : deux textes (saisie ou import de fichier), granularité et
  options modifiables à la volée, statistiques d'ajouts/suppressions.
- `DiffView` unique pour les deux vues (unifiée et côte-à-côte), surlignage
  ajout/suppression via `color-mix` sur les tokens de thème.

### Étape 4 — Outil : Palette de couleurs RGAA

- Quatrième outil (`/color-palette-rgaa`), chunk dédié.
- Couche `lib/` pure et testée : luminance relative et rapport de contraste WCAG
  (maison), seuils AA/AAA (texte normal / grand texte), suggestion de couleur de
  texte accessible (recherche binaire vers noir/blanc), export CSS / JSON / Tailwind.
- `useColorPaletteStore` : palette éditable comme source unique, vérificateur de
  contraste sur deux couleurs sélectionnées, suggestions applicables en un clic.
- Page : aperçu réel (fond/texte), ratio chiffré, badges de conformité (AAA / AA /
  Échec) pour texte normal et grand texte, export copiable.
- Nouveau composant tool-local `ColorField` (sélecteur natif + saisie hex synchronisés).

### Étape 3 — Outil : Générateur de données factices

- Troisième outil (`/fake-data-generator`), chunk dédié.
- Couche `lib/` pure et testée : RNG déterministe (`mulberry32` + FNV-1a),
  générateurs **Lorem Ipsum** (mots / phrases / paragraphes, en-tête classique
  optionnel) et **UUID v4** (tirets / casse), registre de générateurs.
- Architecture **Strategy + Registry à UI pilotée par les données** : chaque
  générateur déclare ses champs (`FakerField` : nombre / booléen / liste) et la
  page les rend génériquement — un nouveau générateur ne touche pas à l'UI.
- Génération **déterministe par graine** ; sans graine, « Régénérer » fait varier
  la sortie (rendu stable entre deux re-rendus).
- Nouveau composant design system : `Checkbox` (+ story + test).

### Étape 2 — Outil : Hash / Checksum

- Deuxième outil (`/hash-checksum`), chunk dédié.
- Couche `lib/` pure et testée : **MD5 maison** (RFC 1321, validé contre `node:crypto`
  sur toutes les frontières de blocs), SHA-1/256/512 via `SubtleCrypto`, registre
  d'algorithmes, normalisation + comparaison de hash.
- `useHashChecksumStore` : source texte **ou** fichier (glisser-déposer / sélecteur),
  hachage asynchrone lancé par les commands (compteur de requête anti-course),
  comparateur dérivé qui met en évidence l'empreinte correspondant à un hash attendu.
- Copie individuelle de chaque empreinte.

### Étape 1 — Outil : Encodeur / Décodeur

- Premier outil (`/encoder-decoder`), chargé en chunk dédié via le registre.
- Couche `lib/` pure et testée : Base64 (maison, sûr en UTF-8), URL, entités HTML
  (encode/decode), décodage de JWT (header/payload + expiration, sans vérification
  de signature). Pattern Strategy + Registry (`Codec`, `FORMATS`).
- `useEncoderStore` (Command/Query) : format, sens encode/décode, interversion,
  réinitialisation ; sortie dérivée en direct, aucune persistance.
- Vue JWT structurée (`JwtView`) : badge d'expiration, dates `iat`/`exp`/`nbf`
  lisibles, signature rappelée comme non vérifiée.
- Ajouts au design system : `Textarea`, `Select`, `CopyButton` (+ stories + tests).

### Étape 0 — Socle applicatif

- Projet initialisé à partir du socle [Node Template](https://github.com/kevingrillet/NodeTemplate)
  (React 19 + TypeScript 6 + Vite 8, Tailwind v4, 4 thèmes runtime × clair/sombre,
  i18n maison FR/EN, PWA offline, Vitest + Playwright + Storybook, ESLint/Prettier, CI/CD Pages).
- Routeur maison à base de _hash_ (`#/outil`) : deep-link et rechargement sans 404
  sur GitHub Pages, zéro dépendance runtime, _code-splitting_ par outil via `lazy()`.
- Registre d'outils (`src/registry.ts`) : source unique alimentant la page d'accueil
  et la navigation (vide en v0, un outil = une entrée).
- Shell applicatif : `Layout` (en-tête + contrôles thème/langue + lien d'évitement),
  `HomePage` générée depuis le registre, page `NotFound`.
- Design system interne (`src/components/ui/`) documenté dans Storybook comme source
  de vérité : `Button`, `Input`, `Panel`, `Badge`, `Accordion`.
- Token de couleur `--color-success` ajouté (badges de conformité, états positifs).
