/**
 * Règle de validation JSON pour le linter : réutilise le parseur maison de l'outil
 * JSON Linter (erreur unique localisée). Évite de redévelopper un parseur.
 */
import { parseJson } from '../../../json-linter/lib/parse';
import { type LanguageLinter, type Rule } from '../types';

const jsonSyntax: Rule = {
  id: 'json-syntax',
  labelKey: 'tools.codeLinter.rules.json-syntax',
  defaultSeverity: 'error',
  check: (source) => {
    if (source.trim() === '') return [];
    const result = parseJson(source);
    if (result.ok) return [];
    return [
      {
        ruleId: 'json-syntax',
        line: result.error.line,
        column: result.error.column,
        detail: result.error.message,
      },
    ];
  },
};

export const jsonLinter: LanguageLinter = {
  id: 'json',
  labelKey: 'tools.codeLinter.languages.json',
  rules: [jsonSyntax],
};
