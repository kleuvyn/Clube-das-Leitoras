// next-pwa já processa o cache core Offline e as estratégias fallback.
// Esse arquivo adiciona regras personalizadas (Push Notifications, Periodic Sync, Background Sync).

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Clube das Leitoras";
  const options = {
    body: data.body || "Nova notificação!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return self.clients.openWindow(event.notification.data.url);
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "clube-leitoras-background-sync") {
    // Exemplo: sincro-nizar dados de form offline
    console.log("[Service Worker] Realizando Background Sync...");
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "clube-leitoras-periodic-sync") {
    console.log("[Service Worker] Realizando Periodic Sync...");
  }
});
