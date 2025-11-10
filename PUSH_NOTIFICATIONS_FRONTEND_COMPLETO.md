# 📱 Sistema Completo de Push Notifications - Frontend React

## 🎯 Descripción General

Este documento explica cómo implementar y usar el sistema completo de notificaciones push en una aplicación React, tanto para PWA como para aplicaciones web tradicionales. Incluye ejemplos completos de código, configuración y manejo de diferentes tipos de notificaciones.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
Frontend React App
├── Service Worker (sw.js)
├── Hook usePushNotifications
├── Servicio notifications.js
├── Componente NotificationPrompt
└── Integración en App.jsx
```

### Backend API Endpoints

```javascript
// Endpoints utilizados
GET    /api/notificaciones/vapid-public-key/
POST   /api/notificaciones/subscriptions/
DELETE /api/notificaciones/subscriptions/
GET    /api/notificaciones/subscriptions/
GET    /api/notificaciones/historial/
```

## 📋 Requisitos Previos

### 1. **Navegadores Soportados**
```javascript
const isSupported = 'serviceWorker' in navigator &&
                   'PushManager' in window &&
                   'Notification' in window
```

### 2. **Dependencias**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "axios": "^1.0.0",
    "lucide-react": "^0.294.0"
  }
}
```

### 3. **Configuración HTTPS**
> **IMPORTANTE**: Las notificaciones push requieren HTTPS en producción.

## 🔧 Implementación Paso a Paso

### Paso 1: Service Worker (`public/sw.js`)

```javascript
// Service Worker para notificaciones push
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado')
  event.waitUntil(self.clients.claim())
})

// Escuchar eventos push
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event)

  if (!event.data) {
    console.warn('Push sin datos')
    return
  }

  let notification = {}
  try {
    notification = event.data.json()
  } catch (e) {
    notification = {
      title: 'Mi App',
      body: event.data.text() || 'Nueva notificación'
    }
  }

  const options = {
    body: notification.body || notification.message || 'Nueva actualización',
    icon: notification.icon || '/icon-192x192.png',
    badge: notification.badge || '/icon-192x192.png',
    image: notification.image,
    vibrate: [100, 50, 100],
    data: {
      url: notification.url || notification.data?.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: notification.id || Date.now(),
      ...notification.data
    },
    actions: [
      { action: 'open', title: 'Ver', icon: '/icon-192x192.png' },
      { action: 'close', title: 'Cerrar', icon: '/icon-192x192.png' }
    ],
    tag: notification.tag || 'app-notification',
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification(
      notification.title || 'Mi App',
      options
    )
  )
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event)
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana abierta
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag)
})
```

### Paso 2: Servicio de Notificaciones (`src/services/notifications.js`)

```javascript
import api from './apiClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Obtener la clave pública VAPID del backend
 */
export async function getVapidPublicKey() {
  try {
    const response = await fetch(`${API_URL}/api/notificaciones/vapid-public-key/`)
    const data = await response.json()
    // Soportar ambas variantes: public_key o publicKey y limpiar espacios
    const key = data.publicKey || data.public_key || ''
    return String(key).trim()
  } catch (error) {
    console.error('Error al obtener clave VAPID:', error)
    throw error
  }
}

/**
 * Convertir clave VAPID de base64 a Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Convertir ArrayBuffer a Base64
 */
function arrayBufferToBase64(buffer) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

/**
 * Verificar si las notificaciones están soportadas
 */
export function isNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

/**
 * Obtener el estado del permiso de notificaciones
 */
export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

/**
 * Suscribirse a notificaciones push
 */
export async function subscribeToPushNotifications(token) {
  // Verificar soporte
  if (!isNotificationSupported()) {
    console.warn('Notificaciones push no soportadas en este navegador')
    return { success: false, error: 'not_supported' }
  }

  try {
    // Registrar service worker
    let registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      console.log('Service Worker registrado:', registration)

      // Esperar a que esté activo
      await navigator.serviceWorker.ready
    }

    // Solicitar permiso
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado')
      return { success: false, error: 'permission_denied' }
    }

    // Verificar si ya existe una suscripción
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      // Obtener clave VAPID del backend
      const vapidPublicKey = await getVapidPublicKey()
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Crear nueva suscripción (con intento de recuperación)
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
      } catch (e) {
        // Si falla, intenta limpiar suscripción existente y reintentar una vez
        try {
          const existing = await registration.pushManager.getSubscription()
          if (existing) await existing.unsubscribe()
        } catch {}
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
      }
    }

    // Evitar POST innecesario si el endpoint ya fue enviado previamente desde este dispositivo
    const lastEndpoint = localStorage.getItem('push_endpoint')
    if (subscription.endpoint !== lastEndpoint) {
      try {
        await api.post('/notificaciones/subscriptions/', {
          endpoint: subscription.endpoint,
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
          user_agent: navigator.userAgent
        })
        localStorage.setItem('push_endpoint', subscription.endpoint)
      } catch (e) {
        const msg = e?.response?.data
        const isDuplicate = e?.response?.status === 400 && (
          (typeof msg === 'string' && /already exists|ya existe/i.test(msg)) ||
          (msg && msg.endpoint && /already exists|ya existe/i.test(String(msg.endpoint)))
        )
        if (!isDuplicate) throw e
        // Duplicado: tratar como éxito idempotente
        localStorage.setItem('push_endpoint', subscription.endpoint)
      }
    }

    console.log('✅ Suscrito a notificaciones push')
    return { success: true, subscription }
  } catch (error) {
    console.error('Error al suscribirse a notificaciones:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Desuscribirse de notificaciones push
 */
export async function unsubscribeFromPushNotifications() {
  if (!isNotificationSupported()) {
    return { success: false, error: 'not_supported' }
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      return { success: true }
    }

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      return { success: true }
    }

    // Desuscribirse localmente
    await subscription.unsubscribe()

    // Notificar al backend (opcional, el backend puede manejar suscripciones inactivas)
    try {
      await api.delete('/notificaciones/subscriptions/', {
        data: { endpoint: subscription.endpoint }
      })
    } catch (e) {
      // Si falla la eliminación en el backend, no es crítico
      console.warn('No se pudo eliminar la suscripción del backend:', e)
    }

    console.log('✅ Desuscrito de notificaciones push')
    return { success: true }
  } catch (error) {
    console.error('Error al desuscribirse:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtener el estado actual de la suscripción
 */
export async function getSubscriptionStatus() {
  if (!isNotificationSupported()) {
    return {
      supported: false,
      subscribed: false,
      permission: 'denied'
    }
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    const subscription = registration
      ? await registration.pushManager.getSubscription()
      : null

    return {
      supported: true,
      subscribed: !!subscription,
      permission: Notification.permission,
      subscription
    }
  } catch (error) {
    console.error('Error al verificar suscripción:', error)
    return {
      supported: true,
      subscribed: false,
      permission: Notification.permission,
      error: error.message
    }
  }
}

/**
 * Mostrar notificación de prueba
 */
export async function showTestNotification() {
  if (!isNotificationSupported()) {
    throw new Error('Notificaciones no soportadas')
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Sin permisos para mostrar notificaciones')
  }

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    throw new Error('Service Worker no registrado')
  }

  await registration.showNotification('Mi App', {
    body: '¡Las notificaciones están funcionando correctamente!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'test-notification'
  })
}
```

### Paso 3: Hook Personalizado (`src/hooks/usePushNotifications.jsx`)

```javascript
import { useState, useEffect } from 'react'
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getSubscriptionStatus,
  isNotificationSupported
} from '../services/notifications'

export function usePushNotifications(token) {
  const [subscribed, setSubscribed] = useState(false)
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verificar soporte
    setSupported(isNotificationSupported())

    // Verificar estado de suscripción
    if (isNotificationSupported() && token) {
      getSubscriptionStatus().then(status => {
        setSubscribed(status.subscribed)
      })
    }
  }, [token])

  const subscribe = async () => {
    if (!token) return false

    setLoading(true)
    try {
      const result = await subscribeToPushNotifications(token)
      if (result.success) {
        setSubscribed(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error al suscribirse:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const result = await unsubscribeFromPushNotifications()
      if (result.success) {
        setSubscribed(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error al desuscribirse:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    subscribed,
    supported,
    loading,
    subscribe,
    unsubscribe
  }
}
```

### Paso 4: Componente de Prompt (`src/components/common/NotificationPrompt.jsx`)

```javascript
import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import Button from '../ui/Button'

export default function NotificationPrompt({ token }) {
  const { supported, subscribed, loading, subscribe } = usePushNotifications(token)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('notification_prompt_dismissed')
    if (isDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleSubscribe = async () => {
    const success = await subscribe()
    if (success) {
      setDismissed(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('notification_prompt_dismissed', 'true')
  }

  // No mostrar si no está soportado, ya está suscrito, o fue desm...
  if (!supported || subscribed || dismissed) {
    return null
  }

  return (
    <div className="relative rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-transparent p-4 shadow-sm animate-in slide-in-from-top-2 fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Cerrar"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Activa las notificaciones</h3>
          <p className="text-sm text-[rgb(var(--muted))] mb-3">
            Recibe alertas cuando tus pedidos cambien de estado o haya nuevas promociones.
          </p>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Activando...' : 'Activar notificaciones'}
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Paso 5: Integración en la App (`src/App.jsx`)

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTES } from './constants/routes'
import AppLayout from './layouts/AppLayout'
// ... otros imports
import { useAuth } from './hooks/useAuth'
import { subscribeToPushNotifications, isNotificationSupported } from './services/notifications'

export default function App() {
  const { user } = useAuth()

  // Suscribirse a notificaciones push cuando el usuario inicia sesión
  useEffect(() => {
    if (!user) return

    // Solo intentar suscribirse si el navegador lo soporta
    if (!isNotificationSupported()) {
      console.log('Notificaciones push no soportadas en este navegador')
      return
    }

    // Intentar suscribirse automáticamente (silenciosamente)
    const token = localStorage.getItem('auth_token')
    if (token) {
      subscribeToPushNotifications(token).catch((error) => {
        console.log('No se pudo suscribir automáticamente a notificaciones:', error)
        // No mostrar error al usuario, es una funcionalidad opcional
      })
    }
  }, [user])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Rutas aquí */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

### Paso 6: Layout con Prompt (`src/layouts/AppLayout.jsx`)

```javascript
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/navigation/Navbar'
import Footer from '../components/navigation/Footer'
import GlobalLoader from '../components/common/GlobalLoader'
import Toaster from '../components/common/Toaster'
import GlobalOverlay from '../components/common/GlobalOverlay'
import InstallPWA from '../components/common/InstallPWA'
import PullToRefreshIndicator from '../components/common/PullToRefreshIndicator'
import NotificationPrompt from '../components/common/NotificationPrompt'
import { useAuth } from '../hooks/useAuth'

export default function AppLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const token = localStorage.getItem('auth_token')
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalLoader />
      <GlobalOverlay />
      <Toaster />
      <InstallPWA />
      <PullToRefreshIndicator />
      <Navbar />
      <main className="flex-1 pwa-safe-bottom">
        <div key={location.pathname} className="page-anim">
          {/* Prompt de notificaciones */}
          {!isAuthPage && user && <NotificationPrompt token={token} />}
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
```

## 🎯 Tipos de Notificaciones Implementadas

### 1. **Notificación de Promociones** 🎁
```javascript
// Payload que envía el backend
{
  title: "🎉 ¡Nueva Promoción Disponible!",
  body: "{descuento} en {nombre_promocion}",
  icon: "/icon-192x192.png",
  badge: "/icon-192x192.png",
  data: {
    url: "/productos?promocion={codigo_promocion}",
    type: "promocion",
    promocion_id: 123
  },
  tag: "promocion-{codigo}"
}
```

### 2. **Notificación de Estado de Pedido** 📦
```javascript
{
  title: "Pedido Actualizado",
  body: "Tu pedido #{id} ha sido {estado}",
  icon: "/icon-192x192.png",
  data: {
    url: "/orders/{id}",
    type: "order_update",
    order_id: 456
  },
  tag: "order-{id}"
}
```

### 3. **Notificación de Mensajes** 💬
```javascript
{
  title: "Nuevo Mensaje",
  body: "Tienes un nuevo mensaje de {remitente}",
  icon: "/icon-192x192.png",
  data: {
    url: "/messages",
    type: "message",
    message_id: 789
  },
  tag: "message-{id}"
}
```

## 🔧 Configuración del Backend

### Django Settings para VAPID
```python
# settings.py
WEBPUSH_SETTINGS = {
    "VAPID_PUBLIC_KEY": "TU_CLAVE_PUBLICA_VAPID_AQUI",
    "VAPID_PRIVATE_KEY": "TU_CLAVE_PRIVADA_VAPID_AQUI",
    "VAPID_ADMIN_EMAIL": "admin@tuapp.com"
}
```

### Modelo de Notificación
```python
# models.py
class Notificacion(models.Model):
    TIPO_CHOICES = [
        ('promocion', 'Nueva Promoción'),
        ('order_update', 'Actualización de Pedido'),
        ('message', 'Mensaje'),
        ('system', 'Sistema'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    url = models.URLField(blank=True)
    datos = models.JSONField(blank=True, null=True)
    leida = models.BooleanField(default=False)
    creada = models.DateTimeField(auto_now_add=True)
```

### Servicio de Push
```python
# push_service.py
from webpush import send_user_notification

def send_to_user(user, payload):
    """Enviar notificación push a un usuario específico"""
    try:
        send_user_notification(
            user=user,
            payload=json.dumps(payload),
            ttl=86400  # 24 horas
        )
        return True
    except Exception as e:
        logger.error(f"Error enviando push a {user}: {e}")
        return False

def send_promocion_to_clientes(promocion):
    """Enviar notificación de nueva promoción a todos los clientes"""
    payload = {
        "title": f"🎉 ¡Nueva Promoción Disponible!",
        "body": f"{promocion.descuento}% en {promocion.nombre}",
        "icon": "/icon-192x192.png",
        "badge": "/icon-192x192.png",
        "data": {
            "url": f"/productos?promocion={promocion.codigo}",
            "type": "promocion",
            "promocion_id": promocion.id
        },
        "tag": f"promocion-{promocion.codigo}"
    }

    clientes = User.objects.filter(role='cliente', is_active=True)
    for cliente in clientes:
        send_to_user(cliente, payload)
```

## 🧪 Testing y Debugging

### Verificar Soporte del Navegador
```javascript
console.log('Service Worker soportado:', 'serviceWorker' in navigator)
console.log('Push Manager soportado:', 'PushManager' in window)
console.log('Notificaciones soportadas:', 'Notification' in window)
console.log('Permiso actual:', Notification.permission)
```

### Probar Notificación Local
```javascript
// En la consola del navegador
navigator.serviceWorker.getRegistration().then(reg => {
  reg.showNotification('Test', {
    body: 'Notificación de prueba funcionando',
    icon: '/icon-192x192.png',
    tag: 'test'
  })
})
```

### Verificar Suscripción
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => reg.pushManager.getSubscription())
  .then(sub => console.log('Suscripción:', sub))
```

## 🚀 Despliegue

### 1. **Configurar HTTPS**
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name tuapp.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        expires off;
    }

    # Static files
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. **Variables de Entorno**
```bash
# .env.production
VITE_API_URL=https://api.tuapp.com
VITE_APP_NAME=Mi App
```

### 3. **Build de Producción**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🔒 Seguridad

### Validación de Permisos
```javascript
// Solo mostrar prompt si:
const shouldShowPrompt = isNotificationSupported() &&
                        Notification.permission === 'default' &&
                        !localStorage.getItem('notification_prompt_dismissed') &&
                        user && // Usuario autenticado
                        !subscribed // No está suscrito
```

### Manejo de Errores
```javascript
try {
  const result = await subscribeToPushNotifications(token)
  if (!result.success) {
    // Manejar diferentes tipos de error
    switch (result.error) {
      case 'not_supported':
        console.warn('Navegador no soporta notificaciones')
        break
      case 'permission_denied':
        console.warn('Usuario denegó permisos')
        break
      default:
        console.error('Error desconocido:', result.error)
    }
  }
} catch (error) {
  console.error('Error crítico:', error)
}
```

## 📱 Optimizaciones PWA

### Manifest.json
```json
{
  "name": "Mi App PWA",
  "short_name": "MiApp",
  "description": "Aplicación con notificaciones push",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Cache Strategy para SW
```javascript
// En sw.js - agregar caching
self.addEventListener('fetch', (event) => {
  // Cache first strategy para assets estáticos
  if (event.request.url.includes('/static/') ||
      event.request.url.includes('/icon-')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }
})
```

## 🎨 Personalización

### Estilos del Prompt
```css
.notification-prompt {
  @apply relative rounded-xl border border-blue-500/20
         bg-gradient-to-r from-blue-500/5 to-transparent
         p-4 shadow-sm animate-in slide-in-from-top-2 fade-in;
}

.notification-prompt .bell-icon {
  @apply h-5 w-5 text-blue-600 dark:text-blue-400;
}

.notification-prompt .close-btn {
  @apply absolute top-2 right-2 rounded-full p-1
         hover:bg-black/10 dark:hover:bg-white/10 transition-colors;
}
```

### Temas de Notificación
```javascript
const notificationThemes = {
  success: {
    icon: '/success-icon.png',
    badge: '/success-badge.png',
    vibrate: [100, 50, 100]
  },
  warning: {
    icon: '/warning-icon.png',
    badge: '/warning-badge.png',
    vibrate: [200, 100, 200, 100, 200]
  },
  error: {
    icon: '/error-icon.png',
    badge: '/error-badge.png',
    vibrate: [500, 200, 500]
  }
}
```

## 📊 Métricas y Analytics

### Seguimiento de Engagement
```javascript
// En sw.js
self.addEventListener('notificationclick', (event) => {
  // Enviar analytics
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/notification-click', {
      type: event.notification.data?.type,
      url: event.notification.data?.url,
      timestamp: Date.now()
    })
  }
})
```

### Tasa de Conversión
```javascript
// Métricas útiles
const metrics = {
  supportedBrowsers: 0,
  subscribedUsers: 0,
  notificationClicks: 0,
  conversionRate: 0
}
```

¡El sistema está completamente implementado y listo para usar! 🎉
