/**
 * Couche adaptateur isolant les deux seules dépendances runtime du projet :
 * `marked` (Markdown → HTML) et `dompurify` (sanitization anti-XSS). Le reste de
 * l'app ne dépend que de cette interface : on pourrait changer de lib ici sans
 * toucher au store ni à l'UI (même principe que `qr.ts` du projet de référence).
 *
 * IMPORTANT : tout HTML affiché passe par `DOMPurify.sanitize` — on rend ensuite
 * via `dangerouslySetInnerHTML`, donc la sanitization est la barrière de sécurité.
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ gfm: true, breaks: false });

// Balises à risque explicitement bannies, en plus de ce que le profil HTML écarte
// déjà : contenu embarqué/exécutable (`script`, `iframe`, `object`, `embed`),
// injection de style (`style`), et surfaces de soumission (`form`, `input`…).
const FORBIDDEN_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'base',
  'link',
  'meta',
];

// Attributs bannis : tout `style` inline (exfiltration/clickjacking via CSS) et
// les attributs à risque. Les gestionnaires d'événements (`on*`) sont retirés par
// le hook ci-dessous (aucune liste noire n'étant exhaustive côté DOMPurify).
const FORBIDDEN_ATTRS = ['style', 'srcset', 'formaction', 'xlink:href'];

// Durcissement (exécuté après chaque nettoyage d'attributs) :
//  1. on retire de façon défensive TOUT attribut commençant par `on` (onload,
//     onclick, onerror…) — ceinture + bretelles par-dessus l'allow-list DOMPurify ;
//  2. tout lien ouvrant un nouvel onglet reçoit `rel="noopener noreferrer"`
//     (anti reverse-tabnabbing — DOMPurify autorise `target` mais n'ajoute pas `rel`).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (!(node instanceof Element)) return;
  for (const attr of Array.from(node.attributes)) {
    if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
  }
  if (node.tagName === 'A' && node.hasAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Rend du Markdown en HTML **sanitizé** (sûr à injecter dans le DOM).
 *
 * `USE_PROFILES: { html: true }` restreint la sortie au seul HTML : SVG et MathML
 * (inutiles pour un éditeur Markdown, et vecteurs d'attaque plus subtils) sont
 * écartés. On bannit en plus explicitement les balises/attributs à risque et on
 * force `ALLOWED_URI_REGEXP` à une liste blanche de protocoles sûrs (les schémas
 * dangereux comme `javascript:` ou `data:` sont donc neutralisés dans les `href`).
 * `target` est ré-autorisé (le profil HTML le retire) mais sécurisé par le `rel`
 * ajouté dans le hook ci-dessus.
 */
export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
    FORBID_TAGS: FORBIDDEN_TAGS,
    FORBID_ATTR: FORBIDDEN_ATTRS,
    // Protocoles autorisés dans les URI (href/src) : http(s), mailto, tel, ftp,
    // ancres (#…) et chemins relatifs. Tout le reste (javascript:, data:, vbscript:…)
    // est retiré.
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
}

const EXAMPLE_FR = `# Bienvenue 👋

Cet **exemple** montre ce que le moteur sait faire. _Modifiez-le_ ou videz tout
pour partir de zéro.

## Mise en forme

- **Gras**, _italique_, \`code en ligne\` et ~~barré~~
- [Un lien](https://example.com)
- Listes imbriquées :
  1. Premier
  2. Second

> Une citation, pour mettre en avant un passage.

## Bloc de code

\`\`\`ts
function salut(nom: string): string {
  return \`Bonjour, \${nom} !\`;
}
\`\`\`

## Tableau

| Outil    | Rôle              |
| -------- | ----------------- |
| Markdown | Rédaction         |
| Aperçu   | Rendu en direct   |

---

Le HTML généré est **nettoyé** (anti-XSS) avant affichage.
`;

const EXAMPLE_EN = `# Welcome 👋

This **example** shows what the engine can do. _Edit it_ or clear everything to
start fresh.

## Formatting

- **Bold**, _italic_, \`inline code\` and ~~strikethrough~~
- [A link](https://example.com)
- Nested lists:
  1. First
  2. Second

> A blockquote, to highlight a passage.

## Code block

\`\`\`ts
function hello(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table

| Tool     | Role           |
| -------- | -------------- |
| Markdown | Authoring      |
| Preview  | Live rendering |

---

The generated HTML is **sanitized** (anti-XSS) before display.
`;

/** Markdown d'exemple par défaut (façon dillinger.io), localisé fr/en. */
export function exampleMarkdown(lang = 'en'): string {
  return lang === 'fr' ? EXAMPLE_FR : EXAMPLE_EN;
}

/** Échappe les caractères sensibles d'une valeur insérée dans du HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Emballe un fragment HTML (déjà sanitizé) dans un document autonome pour l'export.
 * `lang` reflète la langue de l'UI ; `title` est échappé (il provient d'un appelant
 * de confiance aujourd'hui, mais on évite tout point d'injection latent).
 */
export function buildHtmlDocument(bodyHtml: string, title = 'Document', lang = 'en'): string {
  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body>
${bodyHtml}
  </body>
</html>
`;
}
