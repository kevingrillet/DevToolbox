import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Plugin de précache PWA : après le build, réécrit `dist/sw.js` (copié depuis
 * `public/`) pour y injecter (1) la liste des assets hashés émis par Vite — afin
 * que le service worker les précache et offre un vrai hors-ligne dès la première
 * visite, outils chargés à la demande compris — et (2) un nom de cache suffixé
 * d'un hash du build, qui change à chaque modification et déclenche donc la purge
 * de l'ancien cache à l'`activate`. Zéro dépendance runtime.
 */
function pwaPrecache(): Plugin {
  const assets: string[] = [];
  let outDir = 'dist';
  let root = process.cwd();
  return {
    name: 'devtools-pwa-precache',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
      root = config.root;
    },
    generateBundle(_options, bundle) {
      for (const fileName of Object.keys(bundle)) {
        if (/\.(?:js|css)$/.test(fileName)) assets.push(`./${fileName}`);
      }
    },
    closeBundle() {
      const swPath = resolve(root, outDir, 'sw.js');
      let code: string;
      try {
        code = readFileSync(swPath, 'utf8');
      } catch {
        return; // pas de sw.js dans la sortie : rien à injecter.
      }
      assets.sort();
      const hash = createHash('sha256').update(assets.join('|')).digest('hex').slice(0, 8);
      const next = code
        .replace('devtools-hub-__BUILD_HASH__', `devtools-hub-${hash}`)
        .replace(
          'const PRECACHE_ASSETS = [];',
          `const PRECACHE_ASSETS = ${JSON.stringify(assets)};`,
        );
      writeFileSync(swPath, next);
    },
  };
}

/**
 * Configuration Vite + Vitest.
 *
 * `base: './'` génère des chemins d'assets RELATIFS dans le build. C'est ce qui
 * permet au site de fonctionner sur GitHub Pages sous un sous-chemin de projet
 * (`https://<user>.github.io/<repo>/`) sans avoir à coder en dur le nom du dépôt.
 */
export default defineConfig({
  base: './',
  plugins: [react(), pwaPrecache()],
  // Configuration des tests unitaires/composants (Vitest).
  // Les tests d'intégration end-to-end sont gérés séparément par Playwright.
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // On exclut les tests Playwright (dossier tests/) de Vitest.
    exclude: ['node_modules', 'dist', 'tests/**', '.storybook/**'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/test/**', 'src/main.tsx'],
    },
  },
});
