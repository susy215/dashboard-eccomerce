self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activado')
  event.waitUntil(self.clients.claim())
})

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log('📨 Push recibido:', data)

    const options = {
      body: data.body || data.mensaje,
      icon: data.icon || '/admin-icon.png',
      badge: data.badge || '/admin-badge.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard',
        id: data.id
      },
      actions: [
        { action: 'view', title: 'Ver detalles' },
        { action: 'close', title: 'Cerrar' }
      ],
      requireInteraction: true,
      silent: false
    }

    event.waitUntil(
      self.registration.showNotification(data.title || data.titulo, options)
    )
  }
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificación clickeada:', event.action)

  event.notification.close()

  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/dashboard'

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }

        // Si no hay ventana, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
    )
  }
})

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
