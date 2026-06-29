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

// Durcissement : tout lien ouvrant un nouvel onglet reçoit `rel="noopener
// noreferrer"` (anti reverse-tabnabbing — la config DOMPurify par défaut autorise
// `target` mais n'ajoute pas `rel`).
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node instanceof Element && node.tagName === 'A' && node.hasAttribute('target')) {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Rend du Markdown en HTML **sanitizé** (sûr à injecter dans le DOM).
 *
 * `USE_PROFILES: { html: true }` restreint la sortie au seul HTML : SVG et MathML
 * (inutiles pour un éditeur Markdown, et vecteurs d'attaque plus subtils) sont
 * écartés. `target` est ré-autorisé explicitement (le profil HTML le retire) afin
 * de préserver l'intention de l'auteur, mais sécurisé par le `rel` ajouté ci-dessus.
 */
export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md, { async: false }) as string;
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true }, ADD_ATTR: ['target'] });
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
