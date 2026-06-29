/**
 * Dictionnaires de traduction (français / anglais).
 *
 * Le français est la langue de référence. L'interface `Messages` garantit que
 * les deux dictionnaires ont la même structure : il est impossible d'oublier une
 * section. Les chaînes sont organisées par domaine et résolues via `t('a.b.c')`
 * (notation pointée) dans `I18nProvider`.
 *
 * Pour ajouter une chaîne : étendre l'interface `Messages`, puis renseigner la
 * valeur dans `fr` ET `en` (TypeScript refusera la compilation sinon). Chaque
 * outil ajoute son propre sous-objet sous `tools.<outilEnCamelCase>`.
 */
import type { ThemeName } from '../theme';

export type Lang = 'fr' | 'en';

export const LANGS: Lang[] = ['fr', 'en'];

/**
 * Clés des dictionnaires « dynamiques » du linter, énumérées en unions fermées
 * pour que TypeScript garantisse leur présence en fr ET en (un `Record<string,
 * string>` ne l'imposait pas). À tenir synchronisées avec les plugins de
 * `tools/code-linter/lib/languages/` (`Severity`, ids de langage, ids de règle).
 */
type LinterSeverityKey = 'info' | 'warning' | 'error';
type LinterLanguageKey = 'javascript' | 'csharp' | 'css' | 'html' | 'json' | 'markdown' | 'yaml';
type LinterRuleKey =
  | 'no-var'
  | 'no-console'
  | 'eqeqeq'
  | 'no-unused-vars'
  | 'semi'
  | 'no-debugger'
  | 'no-important'
  | 'duplicate-property'
  | 'missing-unit'
  | 'duplicate-color'
  | 'img-alt'
  | 'unclosed-tag'
  | 'duplicate-id'
  | 'a-no-href'
  | 'empty-link'
  | 'heading-skip'
  | 'code-fence-no-lang'
  | 'empty-catch'
  | 'console-writeline'
  | 'todo-comment'
  | 'no-tabs'
  | 'missing-space-after-colon'
  | 'duplicate-key'
  | 'json-syntax';

export interface Messages {
  app: {
    title: string;
    /** Accroche affichée sous le titre sur la page d'accueil. */
    tagline: string;
    /** Texte de l'indicateur de chargement d'un outil (Suspense). */
    loading: string;
  };
  /** Libellés d'accessibilité réutilisables. */
  a11y: { skipToContent: string };
  theme: {
    toLight: string;
    toDark: string;
    light: string;
    dark: string;
    /** Libellé du sélecteur d'identité visuelle. */
    select: string;
    /** Noms des identités visuelles (clé = default | atelier | blueprint | aurora). */
    names: Record<ThemeName, string>;
  };
  language: { label: string; toggle: string };
  /** Navigation transverse du shell. */
  nav: { home: string; backToHome: string };
  /** Page d'accueil (liste des outils, générée depuis le registre). */
  home: {
    title: string;
    intro: string;
    /** Affiché quand le registre est vide. */
    empty: string;
    search: string;
    searchPlaceholder: string;
    noResults: string;
  };
  /** Page 404. */
  notFound: { title: string; body: string };
  /** Chaînes transverses réutilisées par plusieurs outils. */
  common: { cache: string; cacheHint: string };
  /**
   * Textes propres aux outils. Chaque étape « un outil » ajoute son sous-objet
   * (ex. `tools.encoder`), ce qui garantit la complétude fr/en par le typage.
   */
  tools: {
    encoder: {
      title: string;
      description: string;
      format: string;
      direction: string;
      encode: string;
      decode: string;
      input: string;
      output: string;
      inputPlaceholder: string;
      swap: string;
      reset: string;
      copy: string;
      copied: string;
      formats: { base64: string; url: string; htmlEntities: string; jwt: string };
      errors: { base64: string; url: string };
      jwt: {
        decodeOnly: string;
        header: string;
        payload: string;
        signature: string;
        signatureNote: string;
        claims: string;
        expired: string;
        valid: string;
        noExpiry: string;
        timeClaims: { iat: string; exp: string; nbf: string };
        errors: { empty: string; malformed: string; invalidJson: string };
      };
    };
    hashChecksum: {
      title: string;
      description: string;
      textLabel: string;
      textPlaceholder: string;
      chooseFile: string;
      orDrop: string;
      bytesUnit: string;
      results: string;
      computing: string;
      empty: string;
      copy: string;
      copied: string;
      reset: string;
      expectedLabel: string;
      expectedPlaceholder: string;
      match: string;
      noMatch: string;
    };
    faker: {
      title: string;
      description: string;
      generator: string;
      seed: string;
      seedPlaceholder: string;
      seedHint: string;
      regenerate: string;
      reset: string;
      copy: string;
      copied: string;
      output: string;
      generators: { lorem: string; uuid: string; person: string; number: string };
      fields: {
        unit: string;
        count: string;
        startWithLorem: string;
        hyphens: string;
        uppercase: string;
        locale: string;
        format: string;
        min: string;
        max: string;
        decimals: string;
      };
      units: { words: string; sentences: string; paragraphs: string };
      locales: { en: string; fr: string };
      personFormats: { full: string; first: string; last: string; email: string };
    };
    palette: {
      title: string;
      description: string;
      paletteTitle: string;
      addColor: string;
      remove: string;
      contrastTitle: string;
      foreground: string;
      background: string;
      swap: string;
      textSize: string;
      sizeNormal: string;
      sizeLarge: string;
      sample: string;
      ratioLabel: string;
      conformity: { AAA: string; AA: string; fail: string };
      rowNormal: string;
      rowLarge: string;
      suggestionsTitle: string;
      suggestionHint: string;
      applyAa: string;
      applyAaa: string;
      impossible: string;
      exportTitle: string;
      format: string;
      copy: string;
      copied: string;
      formats: { css: string; json: string; tailwind: string };
    };
    diff: {
      title: string;
      description: string;
      before: string;
      after: string;
      beforePlaceholder: string;
      afterPlaceholder: string;
      importFile: string;
      granularity: string;
      granularities: { char: string; word: string; line: string };
      ignoreCase: string;
      ignoreWhitespace: string;
      sortLines: string;
      view: string;
      views: { unified: string; split: string };
      swap: string;
      reset: string;
      result: string;
      identical: string;
      /** Badge affiché quand l'entrée dépasse le plafond du diff. */
      tooLarge: string;
      /** Explication invitant à réduire la taille ou changer de granularité. */
      tooLargeHint: string;
    };
    json: {
      title: string;
      description: string;
      input: string;
      inputPlaceholder: string;
      importFile: string;
      format: string;
      minify: string;
      reset: string;
      valid: string;
      invalid: string;
      /** Badge d'avertissement de précision numérique. */
      precision: string;
      /** Phrase d'explication précédant la liste des lignes concernées. */
      precisionHint: string;
      line: string;
      column: string;
      search: string;
      searchPlaceholder: string;
      prev: string;
      next: string;
      noMatches: string;
      expandAll: string;
      collapseAll: string;
      copyNode: string;
      copied: string;
      empty: string;
      types: {
        string: string;
        number: string;
        boolean: string;
        null: string;
        array: string;
        object: string;
      };
    };
    markdown: {
      title: string;
      description: string;
      editor: string;
      editorPlaceholder: string;
      preview: string;
      importFile: string;
      copyMarkdown: string;
      copyHtml: string;
      copied: string;
      reset: string;
      safetyNote: string;
    };
    codeLinter: {
      title: string;
      description: string;
      language: string;
      source: string;
      sourcePlaceholder: string;
      importFile: string;
      reset: string;
      rulesPanel: string;
      resetRules: string;
      results: string;
      severity: string;
      line: string;
      column: string;
      noIssues: string;
      languages: Record<LinterLanguageKey, string>;
      severities: Record<LinterSeverityKey, string>;
      rules: Record<LinterRuleKey, string>;
    };
    csv: {
      title: string;
      description: string;
      input: string;
      inputPlaceholder: string;
      importFile: string;
      delimiter: string;
      delimiters: { auto: string; comma: string; semicolon: string; tab: string };
      hasHeader: string;
      reset: string;
      empty: string;
    };
  };
}

const fr: Messages = {
  app: {
    title: 'DevTools Hub',
    tagline: 'Des outils pour développeurs, directement dans votre navigateur.',
    loading: 'Chargement de l’outil…',
  },
  a11y: { skipToContent: 'Aller au contenu' },
  theme: {
    toLight: 'Activer le mode clair',
    toDark: 'Activer le mode sombre',
    light: 'Mode clair',
    dark: 'Mode sombre',
    select: 'Thème',
    names: {
      default: 'Défaut',
      atelier: 'Atelier',
      blueprint: 'Blueprint',
      aurora: 'Aurora',
    },
  },
  language: { label: 'Langue', toggle: 'Passer en anglais' },
  nav: { home: 'Accueil', backToHome: '← Retour à l’accueil' },
  home: {
    title: 'Outils',
    intro:
      'Une collection d’outils pour développeurs. Tout s’exécute localement : aucune donnée n’est envoyée à un serveur.',
    empty: 'Aucun outil pour le moment — ils arrivent bientôt.',
    search: 'Rechercher',
    searchPlaceholder: 'Filtrer les outils (nom, description, tag)…',
    noResults: 'Aucun outil ne correspond à votre recherche.',
  },
  notFound: {
    title: 'Page introuvable',
    body: 'La page demandée n’existe pas ou a été déplacée.',
  },
  common: {
    cache: 'Conserver en cache',
    cacheHint: 'Mémorise le contenu dans ce navigateur.',
  },
  tools: {
    encoder: {
      title: 'Encodeur / Décodeur',
      description: 'Base64, URL, entités HTML et décodage de JWT — en direct, hors-ligne.',
      format: 'Format',
      direction: 'Sens',
      encode: 'Encoder',
      decode: 'Décoder',
      input: 'Entrée',
      output: 'Sortie',
      inputPlaceholder: 'Coller le texte à transformer…',
      swap: 'Intervertir entrée et sortie',
      reset: 'Réinitialiser',
      copy: 'Copier la sortie',
      copied: 'Copié ✓',
      formats: {
        base64: 'Base64',
        url: 'URL',
        htmlEntities: 'Entités HTML',
        jwt: 'JWT (décodage)',
      },
      errors: {
        base64: 'Entrée Base64 invalide.',
        url: 'Séquence d’encodage URL invalide.',
      },
      jwt: {
        decodeOnly: 'Le JWT est décodé uniquement : la signature n’est pas vérifiée.',
        header: 'En-tête',
        payload: 'Charge utile (payload)',
        signature: 'Signature',
        signatureNote: 'Signature non vérifiée (clé absente côté client).',
        claims: 'Dates',
        expired: 'Expiré',
        valid: 'Valide',
        noExpiry: 'Sans expiration',
        timeClaims: {
          iat: 'Émis le (iat)',
          exp: 'Expire le (exp)',
          nbf: 'Valide à partir du (nbf)',
        },
        errors: {
          empty: 'Saisissez un jeton JWT.',
          malformed: 'Jeton malformé : trois segments séparés par « . » attendus.',
          invalidJson: 'Segments illisibles : base64url ou JSON invalide.',
        },
      },
    },
    hashChecksum: {
      title: 'Hash / Checksum',
      description:
        'Calcule MD5, SHA-1, SHA-256 et SHA-512 d’un texte ou d’un fichier, en local. Vérifie l’intégrité en collant un hash attendu.',
      textLabel: 'Texte',
      textPlaceholder: 'Saisir le texte à hacher…',
      chooseFile: 'Choisir un fichier',
      orDrop: 'ou glisser-déposer un fichier ici',
      bytesUnit: 'octets',
      results: 'Empreintes',
      computing: 'Calcul en cours…',
      empty: 'Saisissez un texte ou déposez un fichier pour calculer ses empreintes.',
      copy: 'Copier',
      copied: 'Copié ✓',
      reset: 'Réinitialiser',
      expectedLabel: 'Hash attendu',
      expectedPlaceholder: 'Coller un hash pour vérifier la correspondance…',
      match: 'Correspond à',
      noMatch: 'Aucune correspondance',
    },
    faker: {
      title: 'Générateur de données factices',
      description:
        'Génère du Lorem Ipsum, des UUID v4, des identités (en/fr) ou des nombres. Une graine rend le résultat reproductible ; sinon, « Régénérer » varie la sortie.',
      generator: 'Générateur',
      seed: 'Graine',
      seedPlaceholder: 'Laisser vide pour de l’aléatoire…',
      seedHint: 'Une même graine reproduit exactement la même sortie.',
      regenerate: 'Régénérer',
      reset: 'Réinitialiser',
      copy: 'Copier',
      copied: 'Copié ✓',
      output: 'Sortie',
      generators: {
        lorem: 'Lorem Ipsum',
        uuid: 'UUID v4',
        person: 'Identités',
        number: 'Nombres',
      },
      fields: {
        unit: 'Unité',
        count: 'Quantité',
        startWithLorem: 'Commencer par « Lorem ipsum… »',
        hyphens: 'Avec tirets',
        uppercase: 'Majuscules',
        locale: 'Langue',
        format: 'Format',
        min: 'Minimum',
        max: 'Maximum',
        decimals: 'Décimales',
      },
      units: { words: 'Mots', sentences: 'Phrases', paragraphs: 'Paragraphes' },
      locales: { en: 'Anglais', fr: 'Français' },
      personFormats: {
        full: 'Nom complet',
        first: 'Prénom',
        last: 'Nom de famille',
        email: 'E-mail',
      },
    },
    palette: {
      title: 'Palette de couleurs RGAA',
      description:
        'Vérifie les rapports de contraste WCAG, propose des couleurs de texte accessibles et exporte la palette — le tout en local.',
      paletteTitle: 'Palette',
      addColor: 'Ajouter une couleur',
      remove: 'Supprimer la couleur',
      contrastTitle: 'Contraste',
      foreground: 'Texte',
      background: 'Fond',
      swap: 'Intervertir',
      textSize: 'Taille du texte',
      sizeNormal: 'Texte normal',
      sizeLarge: 'Grand texte',
      sample: 'Exemple Aa 123',
      ratioLabel: 'Rapport de contraste :',
      conformity: { AAA: 'AAA', AA: 'AA', fail: 'Échec' },
      rowNormal: 'Texte normal',
      rowLarge: 'Grand texte',
      suggestionsTitle: 'Suggestions de texte',
      suggestionHint: 'Variantes de la couleur de texte atteignant le seuil, sur le fond choisi.',
      applyAa: 'Appliquer (AA)',
      applyAaa: 'Appliquer (AAA)',
      impossible: 'Inatteignable sur ce fond',
      exportTitle: 'Export',
      format: 'Format',
      copy: 'Copier',
      copied: 'Copié ✓',
      formats: { css: 'CSS (variables)', json: 'JSON', tailwind: 'Tailwind' },
    },
    diff: {
      title: 'Comparateur de texte',
      description:
        'Compare deux textes par caractère, mot ou ligne. Vue unifiée ou côte-à-côte, avec options de casse et d’espaces.',
      before: 'Avant',
      after: 'Après',
      beforePlaceholder: 'Coller le texte d’origine…',
      afterPlaceholder: 'Coller le texte modifié…',
      importFile: 'Importer un fichier',
      granularity: 'Granularité',
      granularities: { char: 'Caractère', word: 'Mot', line: 'Ligne' },
      ignoreCase: 'Ignorer la casse',
      ignoreWhitespace: 'Ignorer les espaces',
      sortLines: 'Trier les lignes',
      view: 'Affichage',
      views: { unified: 'Unifié', split: 'Côte à côte' },
      swap: 'Intervertir',
      reset: 'Réinitialiser',
      result: 'Différences',
      identical: 'Identique',
      tooLarge: 'Entrée trop volumineuse',
      tooLargeHint:
        'Les textes sont trop volumineux pour une comparaison à cette granularité. Réduisez la taille, ou choisissez la granularité « Ligne ».',
    },
    json: {
      title: 'JSON Linter / Viewer',
      description:
        'Valide un JSON (erreurs localisées), l’explore en arbre et le recherche (texte ou JSONPath). Reformatage et minification inclus.',
      input: 'JSON',
      inputPlaceholder: 'Coller du JSON…',
      importFile: 'Importer un fichier',
      format: 'Reformater',
      minify: 'Minifier',
      reset: 'Réinitialiser',
      valid: 'JSON valide',
      invalid: 'JSON invalide',
      precision: 'Précision',
      precisionHint:
        'Certains nombres dépassent la précision des entiers JavaScript : leur valeur peut être altérée au reformatage —',
      line: 'Ligne',
      column: 'colonne',
      search: 'Recherche',
      searchPlaceholder: 'Texte, ou JSONPath ($.users[0].name)…',
      prev: 'Précédent',
      next: 'Suivant',
      noMatches: 'Aucun résultat',
      expandAll: 'Tout déplier',
      collapseAll: 'Tout replier',
      copyNode: 'Copier le nœud',
      copied: 'Copié ✓',
      empty: 'Saisissez du JSON pour l’explorer.',
      types: {
        string: 'chaîne',
        number: 'nombre',
        boolean: 'booléen',
        null: 'null',
        array: 'tableau',
        object: 'objet',
      },
    },
    markdown: {
      title: 'Éditeur Markdown',
      description:
        'Édite du Markdown avec aperçu en direct. Le HTML généré est nettoyé (anti-XSS) ; export par copie.',
      editor: 'Markdown',
      editorPlaceholder: 'Écrire en Markdown…',
      preview: 'Aperçu',
      importFile: 'Importer un fichier',
      copyMarkdown: 'Copier le Markdown',
      copyHtml: 'Copier le HTML',
      copied: 'Copié ✓',
      reset: 'Réinitialiser',
      safetyNote: 'HTML nettoyé (anti-XSS)',
    },
    codeLinter: {
      title: 'Linter de code',
      description:
        'Linter pédagogique multi-langage (heuristiques maison) — pas un remplaçant d’ESLint/Stylelint. Règles activables et sévérité ajustable.',
      language: 'Langage',
      source: 'Code',
      sourcePlaceholder: 'Coller du code…',
      importFile: 'Importer un fichier',
      reset: 'Réinitialiser',
      rulesPanel: 'Règles',
      resetRules: 'Réinitialiser les règles',
      results: 'Problèmes',
      severity: 'Sévérité',
      line: 'Ligne',
      column: 'col.',
      noIssues: 'Aucun problème détecté.',
      languages: {
        javascript: 'JS / TS',
        csharp: 'C#',
        css: 'CSS',
        html: 'HTML',
        json: 'JSON',
        markdown: 'Markdown',
        yaml: 'YAML',
      },
      severities: { info: 'Info', warning: 'Avertissement', error: 'Erreur' },
      rules: {
        'no-var': 'Préférer let/const à var',
        'no-console': 'console.log oublié',
        eqeqeq: 'Utiliser === / !== (égalité stricte)',
        'no-unused-vars': 'Variable déclarée mais non utilisée',
        semi: 'Point-virgule manquant',
        'no-debugger': 'Instruction debugger',
        'no-important': '!important à éviter',
        'duplicate-property': 'Propriété dupliquée dans le bloc',
        'missing-unit': 'Unité manquante sur une valeur',
        'duplicate-color': 'Couleur dupliquée (à factoriser)',
        'img-alt': 'Attribut alt manquant sur <img>',
        'unclosed-tag': 'Balise non fermée',
        'duplicate-id': 'id dupliqué dans le document',
        'a-no-href': 'Lien <a> sans href ni role',
        'empty-link': 'Lien sans texte ou sans URL',
        'heading-skip': 'Niveau de titre sauté',
        'code-fence-no-lang': 'Bloc de code sans langage',
        'empty-catch': 'Bloc catch vide',
        'console-writeline': 'Console.WriteLine oublié',
        'todo-comment': 'Commentaire TODO/FIXME',
        'no-tabs': 'Tabulation en indentation (interdite en YAML)',
        'missing-space-after-colon': 'Espace manquant après « : »',
        'duplicate-key': 'Clé dupliquée',
        'json-syntax': 'JSON invalide',
      },
    },
    csv: {
      title: 'Visualiseur CSV',
      description:
        'Affiche un CSV sous forme de table triable (clic sur un en-tête). Délimiteur détecté ou choisi ; tout en local.',
      input: 'CSV',
      inputPlaceholder: 'Coller des données CSV…',
      importFile: 'Importer un fichier',
      delimiter: 'Délimiteur',
      delimiters: { auto: 'Auto', comma: 'Virgule', semicolon: 'Point-virgule', tab: 'Tabulation' },
      hasHeader: 'Première ligne = en-tête',
      reset: 'Réinitialiser',
      empty: 'Saisissez ou importez un CSV pour l’afficher.',
    },
  },
};

const en: Messages = {
  app: {
    title: 'DevTools Hub',
    tagline: 'Developer tools, right in your browser.',
    loading: 'Loading tool…',
  },
  a11y: { skipToContent: 'Skip to content' },
  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    light: 'Light mode',
    dark: 'Dark mode',
    select: 'Theme',
    names: {
      default: 'Default',
      atelier: 'Atelier',
      blueprint: 'Blueprint',
      aurora: 'Aurora',
    },
  },
  language: { label: 'Language', toggle: 'Switch to French' },
  nav: { home: 'Home', backToHome: '← Back to home' },
  home: {
    title: 'Tools',
    intro:
      'A collection of developer tools. Everything runs locally: no data is ever sent to a server.',
    empty: 'No tools yet — coming soon.',
    search: 'Search',
    searchPlaceholder: 'Filter tools (name, description, tag)…',
    noResults: 'No tool matches your search.',
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you requested does not exist or has moved.',
  },
  common: {
    cache: 'Keep cached',
    cacheHint: 'Remembers the content in this browser.',
  },
  tools: {
    encoder: {
      title: 'Encoder / Decoder',
      description: 'Base64, URL, HTML entities and JWT decoding — live and offline.',
      format: 'Format',
      direction: 'Direction',
      encode: 'Encode',
      decode: 'Decode',
      input: 'Input',
      output: 'Output',
      inputPlaceholder: 'Paste the text to transform…',
      swap: 'Swap input and output',
      reset: 'Reset',
      copy: 'Copy output',
      copied: 'Copied ✓',
      formats: {
        base64: 'Base64',
        url: 'URL',
        htmlEntities: 'HTML entities',
        jwt: 'JWT (decode)',
      },
      errors: {
        base64: 'Invalid Base64 input.',
        url: 'Invalid URL encoding sequence.',
      },
      jwt: {
        decodeOnly: 'The JWT is only decoded: the signature is not verified.',
        header: 'Header',
        payload: 'Payload',
        signature: 'Signature',
        signatureNote: 'Signature not verified (no key available client-side).',
        claims: 'Dates',
        expired: 'Expired',
        valid: 'Valid',
        noExpiry: 'No expiry',
        timeClaims: {
          iat: 'Issued at (iat)',
          exp: 'Expires at (exp)',
          nbf: 'Not before (nbf)',
        },
        errors: {
          empty: 'Enter a JWT token.',
          malformed: 'Malformed token: three dot-separated segments expected.',
          invalidJson: 'Unreadable segments: invalid base64url or JSON.',
        },
      },
    },
    hashChecksum: {
      title: 'Hash / Checksum',
      description:
        'Computes MD5, SHA-1, SHA-256 and SHA-512 of a text or file, locally. Verify integrity by pasting an expected hash.',
      textLabel: 'Text',
      textPlaceholder: 'Enter the text to hash…',
      chooseFile: 'Choose a file',
      orDrop: 'or drag and drop a file here',
      bytesUnit: 'bytes',
      results: 'Digests',
      computing: 'Computing…',
      empty: 'Enter text or drop a file to compute its digests.',
      copy: 'Copy',
      copied: 'Copied ✓',
      reset: 'Reset',
      expectedLabel: 'Expected hash',
      expectedPlaceholder: 'Paste a hash to check for a match…',
      match: 'Matches',
      noMatch: 'No match',
    },
    faker: {
      title: 'Fake data generator',
      description:
        'Generates Lorem Ipsum, UUID v4, identities (en/fr) or numbers. A seed makes the result reproducible; otherwise “Regenerate” varies the output.',
      generator: 'Generator',
      seed: 'Seed',
      seedPlaceholder: 'Leave empty for randomness…',
      seedHint: 'The same seed reproduces the exact same output.',
      regenerate: 'Regenerate',
      reset: 'Reset',
      copy: 'Copy',
      copied: 'Copied ✓',
      output: 'Output',
      generators: {
        lorem: 'Lorem Ipsum',
        uuid: 'UUID v4',
        person: 'Identities',
        number: 'Numbers',
      },
      fields: {
        unit: 'Unit',
        count: 'Quantity',
        startWithLorem: 'Start with “Lorem ipsum…”',
        hyphens: 'With hyphens',
        uppercase: 'Uppercase',
        locale: 'Language',
        format: 'Format',
        min: 'Minimum',
        max: 'Maximum',
        decimals: 'Decimals',
      },
      units: { words: 'Words', sentences: 'Sentences', paragraphs: 'Paragraphs' },
      locales: { en: 'English', fr: 'French' },
      personFormats: {
        full: 'Full name',
        first: 'First name',
        last: 'Last name',
        email: 'Email',
      },
    },
    palette: {
      title: 'RGAA color palette',
      description:
        'Checks WCAG contrast ratios, suggests accessible text colors and exports the palette — all locally.',
      paletteTitle: 'Palette',
      addColor: 'Add a color',
      remove: 'Remove color',
      contrastTitle: 'Contrast',
      foreground: 'Text',
      background: 'Background',
      swap: 'Swap',
      textSize: 'Text size',
      sizeNormal: 'Normal text',
      sizeLarge: 'Large text',
      sample: 'Sample Aa 123',
      ratioLabel: 'Contrast ratio:',
      conformity: { AAA: 'AAA', AA: 'AA', fail: 'Fail' },
      rowNormal: 'Normal text',
      rowLarge: 'Large text',
      suggestionsTitle: 'Text suggestions',
      suggestionHint: 'Variants of the text color reaching the threshold on the chosen background.',
      applyAa: 'Apply (AA)',
      applyAaa: 'Apply (AAA)',
      impossible: 'Unreachable on this background',
      exportTitle: 'Export',
      format: 'Format',
      copy: 'Copy',
      copied: 'Copied ✓',
      formats: { css: 'CSS (variables)', json: 'JSON', tailwind: 'Tailwind' },
    },
    diff: {
      title: 'Text diff',
      description:
        'Compare two texts by character, word or line. Unified or side-by-side view, with case and whitespace options.',
      before: 'Before',
      after: 'After',
      beforePlaceholder: 'Paste the original text…',
      afterPlaceholder: 'Paste the modified text…',
      importFile: 'Import a file',
      granularity: 'Granularity',
      granularities: { char: 'Character', word: 'Word', line: 'Line' },
      ignoreCase: 'Ignore case',
      ignoreWhitespace: 'Ignore whitespace',
      sortLines: 'Sort lines',
      view: 'View',
      views: { unified: 'Unified', split: 'Side by side' },
      swap: 'Swap',
      reset: 'Reset',
      result: 'Differences',
      identical: 'Identical',
      tooLarge: 'Input too large',
      tooLargeHint:
        'The texts are too large to compare at this granularity. Reduce the size, or switch to the “Line” granularity.',
    },
    json: {
      title: 'JSON Linter / Viewer',
      description:
        'Validates JSON (located errors), explores it as a tree and searches it (text or JSONPath). Reformat and minify included.',
      input: 'JSON',
      inputPlaceholder: 'Paste JSON…',
      importFile: 'Import a file',
      format: 'Reformat',
      minify: 'Minify',
      reset: 'Reset',
      valid: 'Valid JSON',
      invalid: 'Invalid JSON',
      precision: 'Precision',
      precisionHint:
        'Some numbers exceed JavaScript’s safe integer precision: their value may be altered on reformatting —',
      line: 'Line',
      column: 'column',
      search: 'Search',
      searchPlaceholder: 'Text, or JSONPath ($.users[0].name)…',
      prev: 'Previous',
      next: 'Next',
      noMatches: 'No matches',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all',
      copyNode: 'Copy node',
      copied: 'Copied ✓',
      empty: 'Enter JSON to explore it.',
      types: {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        null: 'null',
        array: 'array',
        object: 'object',
      },
    },
    markdown: {
      title: 'Markdown editor',
      description:
        'Edit Markdown with a live preview. The generated HTML is sanitized (anti-XSS); export by copy.',
      editor: 'Markdown',
      editorPlaceholder: 'Write in Markdown…',
      preview: 'Preview',
      importFile: 'Import a file',
      copyMarkdown: 'Copy Markdown',
      copyHtml: 'Copy HTML',
      copied: 'Copied ✓',
      reset: 'Reset',
      safetyNote: 'Sanitized HTML (anti-XSS)',
    },
    codeLinter: {
      title: 'Code linter',
      description:
        'A teaching-oriented multi-language linter (in-house heuristics) — not a replacement for ESLint/Stylelint. Toggleable rules and adjustable severity.',
      language: 'Language',
      source: 'Code',
      sourcePlaceholder: 'Paste code…',
      importFile: 'Import a file',
      reset: 'Reset',
      rulesPanel: 'Rules',
      resetRules: 'Reset rules',
      results: 'Issues',
      severity: 'Severity',
      line: 'Line',
      column: 'col.',
      noIssues: 'No issues found.',
      languages: {
        javascript: 'JS / TS',
        csharp: 'C#',
        css: 'CSS',
        html: 'HTML',
        json: 'JSON',
        markdown: 'Markdown',
        yaml: 'YAML',
      },
      severities: { info: 'Info', warning: 'Warning', error: 'Error' },
      rules: {
        'no-var': 'Prefer let/const over var',
        'no-console': 'Leftover console.log',
        eqeqeq: 'Use === / !== (strict equality)',
        'no-unused-vars': 'Declared but unused variable',
        semi: 'Missing semicolon',
        'no-debugger': 'debugger statement',
        'no-important': 'Avoid !important',
        'duplicate-property': 'Duplicate property in block',
        'missing-unit': 'Missing unit on a value',
        'duplicate-color': 'Duplicate color (factor out)',
        'img-alt': 'Missing alt attribute on <img>',
        'unclosed-tag': 'Unclosed tag',
        'duplicate-id': 'Duplicate id in document',
        'a-no-href': '<a> link without href or role',
        'empty-link': 'Link without text or URL',
        'heading-skip': 'Skipped heading level',
        'code-fence-no-lang': 'Code fence without language',
        'empty-catch': 'Empty catch block',
        'console-writeline': 'Leftover Console.WriteLine',
        'todo-comment': 'TODO/FIXME comment',
        'no-tabs': 'Tab indentation (forbidden in YAML)',
        'missing-space-after-colon': 'Missing space after “:”',
        'duplicate-key': 'Duplicate key',
        'json-syntax': 'Invalid JSON',
      },
    },
    csv: {
      title: 'CSV viewer',
      description:
        'Displays CSV as a sortable table (click a header). Delimiter auto-detected or chosen; all local.',
      input: 'CSV',
      inputPlaceholder: 'Paste CSV data…',
      importFile: 'Import a file',
      delimiter: 'Delimiter',
      delimiters: { auto: 'Auto', comma: 'Comma', semicolon: 'Semicolon', tab: 'Tab' },
      hasHeader: 'First row is header',
      reset: 'Reset',
      empty: 'Enter or import a CSV to display it.',
    },
  },
};

export const messages: Record<Lang, Messages> = { fr, en };
