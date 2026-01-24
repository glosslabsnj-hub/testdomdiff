// Service Worker for Push Notifications
// Redeemed Strength - Faith-Based Fitness

const CACHE_NAME = "redeemed-strength-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(clients.claim());
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
