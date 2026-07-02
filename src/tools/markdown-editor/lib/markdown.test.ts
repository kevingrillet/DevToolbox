import { describe, it, expect } from 'vitest';
import { renderMarkdown, buildHtmlDocument } from './markdown';

describe('renderMarkdown', () => {
  it('rend titres, gras et listes', () => {
    expect(renderMarkdown('# Titre')).toContain('<h1>Titre</h1>');
    expect(renderMarkdown('**fort**')).toContain('<strong>fort</strong>');
    expect(renderMarkdown('- a\n- b')).toContain('<li>a</li>');
  });

  it('supprime les balises <script> (XSS)', () => {
    const html = renderMarkdown('<script>alert(1)</script>contenu');
    expect(html).not.toContain('<script>');
    expect(html).toContain('contenu');
  });

  it('retire les gestionnaires d’événements (onerror)', () => {
    expect(renderMarkdown('<img src=x onerror="alert(1)">')).not.toContain('onerror');
  });

  it('neutralise les href « javascript: »', () => {
    expect(renderMarkdown('[lien](javascript:alert(1))').toLowerCase()).not.toContain(
      'javascript:',
    );
  });

  it('ajoute rel="noopener noreferrer" sur les liens target', () => {
    const html = renderMarkdown('<a href="https://example.com" target="_blank">x</a>');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('écarte le SVG (profil HTML uniquement)', () => {
    const html = renderMarkdown('<svg><script>alert(1)</script></svg>');
    expect(html.toLowerCase()).not.toContain('<svg');
    expect(html.toLowerCase()).not.toContain('<script');
  });
});

describe('renderMarkdown — durcissement anti-XSS', () => {
  // Chaque vecteur classique doit ressortir neutralisé (ni balise dangereuse, ni
  // gestionnaire d'événement, ni protocole exécutable) tout en gardant le contenu.
  const vectors: Array<[string, string]> = [
    ['<svg onload=alert(1)>', 'onload'],
    ['<img src=x onerror="alert(1)">', 'onerror'],
    ['<div onclick="alert(1)">clic</div>', 'onclick'],
    ['<body onload=alert(1)>', 'onload'],
    ['<iframe src="javascript:alert(1)"></iframe>', '<iframe'],
    ['<object data="data:text/html,<script>alert(1)</script>"></object>', '<object'],
    ['<embed src="x.svg">', '<embed'],
    ['<style>body{background:url(javascript:alert(1))}</style>', '<style'],
    ['<a href="javascript:alert(1)">x</a>', 'javascript:'],
    ['<a href="vbscript:msgbox(1)">x</a>', 'vbscript:'],
    ['<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>', 'data:text/html'],
  ];

  it.each(vectors)('neutralise %s', (input, forbidden) => {
    const html = renderMarkdown(input).toLowerCase();
    expect(html).not.toContain(forbidden.toLowerCase());
  });

  it('retire un gestionnaire d’événement même sur une balise autorisée', () => {
    const html = renderMarkdown('<p onmouseover="steal()">texte</p>');
    expect(html.toLowerCase()).not.toContain('onmouseover');
    // Le contenu légitime est préservé.
    expect(html).toContain('texte');
  });

  it('supprime les attributs style inline', () => {
    const html = renderMarkdown('<p style="position:fixed;top:0">x</p>');
    expect(html.toLowerCase()).not.toContain('style=');
    expect(html).toContain('x');
  });

  it('conserve les liens http(s) légitimes', () => {
    const html = renderMarkdown('[ok](https://example.com)');
    expect(html).toContain('href="https://example.com"');
  });
});

describe('buildHtmlDocument', () => {
  it('emballe le fragment dans un document complet', () => {
    const doc = buildHtmlDocument('<p>hi</p>', 'T');
    expect(doc).toContain('<!doctype html>');
    expect(doc).toContain('<title>T</title>');
    expect(doc).toContain('<p>hi</p>');
  });

  it('déclare la langue fournie', () => {
    expect(buildHtmlDocument('<p>x</p>', 'T', 'fr')).toContain('<html lang="fr">');
    expect(buildHtmlDocument('<p>x</p>')).toContain('<html lang="en">');
  });

  it('échappe le titre (pas de point d’injection)', () => {
    const doc = buildHtmlDocument('<p>x</p>', '</title><script>');
    expect(doc).not.toContain('<script>');
    expect(doc).toContain('&lt;/title&gt;&lt;script&gt;');
  });
});
