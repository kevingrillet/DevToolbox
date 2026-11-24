/**
 * Service worker — fonctionnement hors-ligne, sans dépendance ni build dédié.
 *
 * Stratégie :
 *  - navigations : réseau d'abord, repli sur l'app shell en cache (offline) ;
 *  - fichiers buildés avec hash : priorité au précache (le hash fixe le contenu) ;
 *  - autres GET de même origine : « stale-while-revalidate ».
 *
 * Précache : à l'install, on met en cache l'app shell ET tous les assets buildés
 * (chunks JS/CSS hashés, y compris les outils chargés à la demande). La liste et
 * le nom de cache (suffixé d'un hash du build) sont INJECTÉS au build par le
 * plugin `pwaPrecache` de `vite.config.ts` — d'où un vrai fonctionnement hors-ligne
 * dès la première visite, et une invalidation automatique à chaque déploiement
 * (le nom de cache change ⇒ l'ancien est purgé à l'`activate`).
 *
 * Les chemins sont relatifs au scope du SW, ce qui le rend compatible avec le
 * sous-chemin GitHub Pages (`/<repo>/`) sans coder en dur le nom du dépôt.
 */
const CACHE = 'devtools-hub-__BUILD_HASH__';
const APP_SHELL = ['./', './index.html', './favicon.svg', './manifest.webmanifest'];
// Remplacé au build par la liste des assets hashés émis par Vite (vide en dev,
// où le service worker n'est de toute façon pas enregistré).
const PRECACHE_ASSETS = [];
const PRECACHE_URLS = new Set(
  PRECACHE_ASSETS.map((path) => new URL(path, self.registration.scope).href),
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([...APP_SHELL, ...PRECACHE_ASSETS]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html').then((cached) => cached || caches.match('./')),
      ),
    );
    return;
  }

  if (PRECACHE_URLS.has(request.url)) {
    // Les modules et CSS peuvent être préchargés avec des en-têtes différents
    // de ceux de l'installation du SW (Vary: Origin en prévisualisation Vite).
    event.respondWith(
      caches
        .match(request, { cacheName: CACHE, ignoreVary: true })
        .then((cached) => cached || fetch(request)),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            void caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
