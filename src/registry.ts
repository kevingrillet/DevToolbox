/**
 * Registre des outils — source UNIQUE de vérité de la liste des outils.
 *
 * La page d'accueil et la navigation en sont dérivées automatiquement : ajouter
 * un outil = ajouter une entrée ici (avec son import paresseux), sans toucher au
 * shell ni au routeur. C'est l'équivalent du registre des types de payload du
 * projet QrCodeGenerator.
 *
 * En v0 (socle), le registre est volontairement VIDE : chaque étape « un outil »
 * y poussera son entrée.
 */
import type { ComponentType } from 'react';

export interface ToolMeta {
  /** Identifiant stable et unique (slug kebab-case), ex. `json-linter`. */
  id: string;
  /** Route interne sans le « # », ex. `/json-linter`. Unique. */
  path: string;
  /** Icône (emoji) affichée sur la carte d'accueil et dans la navigation. */
  icon: string;
  /** Clé i18n du nom de l'outil (ex. `tools.jsonLinter.title`). */
  titleKey: string;
  /** Clé i18n de la description courte (ex. `tools.jsonLinter.description`). */
  descriptionKey: string;
  /**
   * Mots-clés (techniques, neutres en langue) pour la recherche et l'affichage
   * en badges sur l'accueil.
   */
  tags: string[];
  /**
   * Import paresseux du composant racine de l'outil. Permet le _code-splitting_
   * par route : le JS de l'outil n'est téléchargé qu'à sa première visite.
   */
  load: () => Promise<{ default: ComponentType }>;
}

/** Liste ordonnée des outils disponibles (ordre d'affichage sur l'accueil). */
export const TOOLS: ToolMeta[] = [
  {
    id: 'encoder-decoder',
    path: '/encoder-decoder',
    icon: '🔁',
    titleKey: 'tools.encoder.title',
    descriptionKey: 'tools.encoder.description',
    tags: ['base64', 'url', 'html', 'jwt', 'encode', 'decode'],
    load: () => import('./tools/encoder-decoder'),
  },
  {
    id: 'hash-checksum',
    path: '/hash-checksum',
    icon: '🔐',
    titleKey: 'tools.hashChecksum.title',
    descriptionKey: 'tools.hashChecksum.description',
    tags: ['md5', 'sha', 'hash', 'checksum', 'crypto'],
    load: () => import('./tools/hash-checksum'),
  },
  {
    id: 'fake-data-generator',
    path: '/fake-data-generator',
    icon: '🎲',
    titleKey: 'tools.faker.title',
    descriptionKey: 'tools.faker.description',
    tags: ['lorem', 'uuid', 'faker', 'random', 'seed'],
    load: () => import('./tools/fake-data-generator'),
  },
  {
    id: 'color-palette-rgaa',
    path: '/color-palette-rgaa',
    icon: '🎨',
    titleKey: 'tools.palette.title',
    descriptionKey: 'tools.palette.description',
    tags: ['color', 'contrast', 'wcag', 'rgaa', 'a11y', 'palette'],
    load: () => import('./tools/color-palette-rgaa'),
  },
  {
    id: 'text-diff',
    path: '/text-diff',
    icon: '🔀',
    titleKey: 'tools.diff.title',
    descriptionKey: 'tools.diff.description',
    tags: ['diff', 'compare', 'text', 'merge'],
    load: () => import('./tools/text-diff'),
  },
  {
    id: 'json-linter',
    path: '/json-linter',
    icon: '🧩',
    titleKey: 'tools.json.title',
    descriptionKey: 'tools.json.description',
    tags: ['json', 'tree', 'jsonpath', 'format', 'minify'],
    load: () => import('./tools/json-linter'),
  },
  {
    id: 'markdown-editor',
    path: '/markdown-editor',
    icon: '📝',
    titleKey: 'tools.markdown.title',
    descriptionKey: 'tools.markdown.description',
    tags: ['markdown', 'md', 'html', 'preview'],
    load: () => import('./tools/markdown-editor'),
  },
  {
    id: 'code-linter',
    path: '/code-linter',
    icon: '🔍',
    titleKey: 'tools.codeLinter.title',
    descriptionKey: 'tools.codeLinter.description',
    tags: ['lint', 'javascript', 'css', 'html', 'json', 'yaml', 'csharp', 'markdown'],
    load: () => import('./tools/code-linter'),
  },
  {
    id: 'csv-viewer',
    path: '/csv-viewer',
    icon: '📑',
    titleKey: 'tools.csv.title',
    descriptionKey: 'tools.csv.description',
    tags: ['csv', 'table', 'sort', 'sheet'],
    load: () => import('./tools/csv-viewer'),
  },
];

/** Retrouve un outil par sa route (`/json-linter`). */
export function findToolByPath(path: string): ToolMeta | undefined {
  return TOOLS.find((tool) => tool.path === path);
}
