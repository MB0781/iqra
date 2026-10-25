/*
 * Service worker d'Iqra' : rend utilisables hors ligne les pages déjà visitées.
 * - Pages : réseau d'abord, copie en cache en secours.
 * - Fichiers du site (CSS, JS, polices, images, audio local) : cache d'abord.
 * - Audio externe (Quran.com) : non mis en cache (fichiers servis par un tiers).
 */
const VERSION = 'iqra-v1';
const BASE = new URL(self.registration.scope).pathname;
const ESSENTIELS = [BASE, `${BASE}parcours/`, `${BASE}catalogue.json`, `${BASE}manifest.webmanifest`, `${BASE}favicon.svg`];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      .then((c) => c.addAll(ESSENTIELS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;

  if (req.mode === 'navigate' || url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(req)
        .then((rep) => {
          if (rep.ok) {
            const copie = rep.clone();
            caches.open(VERSION).then((c) => c.put(req, copie));
          }
          return rep;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match(BASE))),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(
      (r) =>
        r ||
        fetch(req).then((rep) => {
          if (rep.ok && rep.type === 'basic') {
            const copie = rep.clone();
            caches.open(VERSION).then((c) => c.put(req, copie));
          }
          return rep;
        }),
    ),
  );
});
