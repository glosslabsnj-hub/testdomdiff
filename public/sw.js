// Service Worker for Push Notifications & Caching
// Redeemed Strength - Faith-Based Fitness

const CACHE_NAME = "redeemed-strength-v2";
const STATIC_CACHE = "rs-static-v1";
const DYNAMIC_CACHE = "rs-dynamic-v1";

// Assets to pre-cache
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    }).then(() => clients.claim())
  );
});

// Fetch event - cache-first for static, network-first for API
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls - always network
  if (url.hostname.includes("supabase")) return;

  // Skip chrome-extension and other non-http
  if (!url.protocol.startsWith("http")) return;

  // Static assets - cache first
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first, fallback to cache
  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
});

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");
  
  let data = {
    title: "Redeemed Strength",
    body: "You have a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "general",
    data: { url: "/" },
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || data.tag,
        data: { url: payload.url || "/" },
      };
    }
  } catch (e) {
    console.error("[SW] Error parsing push data:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: "open", title: "Open" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user clicking the notification
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event.action);
  
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
});
