/** Point d'entrée : monte l'application React dans le DOM. */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Le thème (identité + mode clair/sombre) est appliqué AVANT le rendu par le
// script anti-flash de index.html, puis géré au runtime par `useTheme`.

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Élément racine #root introuvable');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA : enregistre le service worker (cache l'app shell pour un fonctionnement
// hors-ligne). Ignoré en dev et si l'API n'est pas disponible. `import.meta.env.BASE_URL`
// tient compte du sous-chemin GitHub Pages (`base: './'`).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* enregistrement impossible : l'app fonctionne sans, on ignore. */
    });
  });
}
