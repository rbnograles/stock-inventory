/**
 * Keeps the HomeStock PWA shell available offline without caching authenticated
 * Supabase API responses. The worker only caches same-origin app assets, which
 * prevents production inventory reads from replaying stale data while still
 * giving the installed app a fast, resilient startup path.
 */
const CACHE_NAME = "homestock-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];
const STATIC_PATHS = ["/assets/", "/icons/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

const isCacheable = (request, response) => {
  if (!response || response.status !== 200) {
    return false;
  }

  const url = new URL(request.url);
  return url.origin === self.location.origin;
};

const isStaticAsset = (url) =>
  STATIC_PATHS.some((path) => url.pathname.startsWith(path)) ||
  url.pathname === "/manifest.webmanifest";

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    if (isCacheable(request, response)) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put("/index.html", response.clone());
    }
    return response;
  } catch {
    return caches.match("/index.html");
  }
};

const cacheFirstAsset = async (request) => {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (isCacheable(request, response)) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
};

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstAsset(event.request));
  }
});
