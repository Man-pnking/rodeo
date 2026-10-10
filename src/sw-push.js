/* global clients */
// Custom service worker code for Web Push
// This file is injected into the generated service worker by vite-plugin-pwa.

self.addEventListener("push", (event) => {
  // eslint-disable-next-line no-useless-assignment
  let payload = {};
  if (!event.data) return;

  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Rodeo", body: event.data.text() };
  }

  const {
    title = "Rodeo",
    body = "New notification",
    icon = "/icon.svg",
    badge = "/icon.svg",
    url = "/",
    tag,
  } = payload;

  const options = {
    body,
    icon,
    badge,
    tag,
    data: { url },
    vibrate: [80, 40, 80],
    renotify: !!tag,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if (c.url.includes(self.location.origin)) {
          c.focus();
          c.navigate(url);
          return;
        }
      }
      if (clients.openWindow) {
        await clients.openWindow(url);
      }
    })()
  );
});
