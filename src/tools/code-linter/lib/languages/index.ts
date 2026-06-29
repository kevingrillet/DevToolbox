/**
 * Registre des langages du linter. Ajouter un langage = importer son plugin et
 * l'ajouter ici — l'UI (sélecteur, panneau de règles) s'adapte automatiquement.
 */
import type { LanguageLinter } from '../types';
import { javascriptLinter } from './javascript';
import { cssLinter } from './css';
import { htmlLinter } from './html';
import { markdownLinter } from './markdown';
import { csharpLinter } from './csharp';
import { yamlLinter } from './yaml';
import { jsonLinter } from './json';

export const LANGUAGES: LanguageLinter[] = [
  javascriptLinter,
  csharpLinter,
  cssLinter,
  htmlLinter,
  jsonLinter,
  markdownLinter,
  yamlLinter,
];

export const LANGUAGES_BY_ID = new Map<string, LanguageLinter>(
  LANGUAGES.map((language) => [language.id, language]),
);
