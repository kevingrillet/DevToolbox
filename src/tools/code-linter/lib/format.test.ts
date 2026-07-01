import { describe, expect, it } from 'vitest';
import {
  reindentBrackets,
  reindentHtml,
  cleanupGeneric,
  cleanupMarkdown,
  cleanupYaml,
} from './format';

const JS = { lineComment: '//', blockComment: ['/*', '*/'] as [string, string], template: true };

describe('reindentBrackets', () => {
  it('réindente selon la profondeur d’accolades', () => {
    const input = 'function f() {\nreturn 1;\n}';
    expect(reindentBrackets(input, JS)).toBe('function f() {\n  return 1;\n}');
  });

  it('imbrique sur plusieurs niveaux et dédente les fermetures', () => {
    const input = 'if (a) {\nif (b) {\nx();\n}\n}';
    expect(reindentBrackets(input, JS)).toBe('if (a) {\n  if (b) {\n    x();\n  }\n}');
  });

  it('ignore les accolades dans les chaînes et commentaires', () => {
    const input = 'const s = "{";\n// }\nf();';
    // Aucune profondeur réelle ouverte → tout reste au niveau 0.
    expect(reindentBrackets(input, JS)).toBe('const s = "{";\n// }\nf();');
  });

  it('préserve le contenu des littéraux gabarits multi-lignes', () => {
    const input = 'const t = `\n  garde   moi\n`;';
    expect(reindentBrackets(input, JS)).toBe('const t = `\n  garde   moi\n`;');
  });

  it('renvoie une source vide inchangée', () => {
    expect(reindentBrackets('   ', JS)).toBe('   ');
  });
});

describe('reindentHtml', () => {
  it('indente par profondeur de balises', () => {
    const input = '<ul>\n<li>a</li>\n</ul>';
    expect(reindentHtml(input)).toBe('<ul>\n  <li>a</li>\n</ul>');
  });

  it('ne descend pas sur les éléments vides (void)', () => {
    const input = '<div>\n<br>\n<img src="x">\n</div>';
    expect(reindentHtml(input)).toBe('<div>\n  <br>\n  <img src="x">\n</div>');
  });
});

describe('cleanupGeneric', () => {
  it('retire les espaces de fin, réduit les lignes vides et ajoute un saut final', () => {
    expect(cleanupGeneric('a   \n\n\n\nb')).toBe('a\n\nb\n');
  });
});

describe('cleanupMarkdown', () => {
  it('préserve le saut de ligne dur (2 espaces) mais nettoie le reste', () => {
    expect(cleanupMarkdown('ligne  \nautre   \t\n')).toBe('ligne  \nautre\n');
  });
});

describe('cleanupYaml', () => {
  it('convertit les tabulations d’indentation en espaces', () => {
    expect(cleanupYaml('root:\n\tkey: value')).toBe('root:\n  key: value\n');
  });
});
