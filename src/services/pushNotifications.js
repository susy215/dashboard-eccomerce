import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Convertir VAPID key para usar con Push API
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Convertir ArrayBuffer a Base64
function arrayBufferToBase64(buffer) {
  if (!buffer) return ''
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

// Obtener clave VAPID del backend
export async function getVapidPublicKey(token) {
  try {
    const response = await axios.get(`${API_URL}/api/notificaciones/vapid-public-key/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    return response.data.public_key
  } catch (error) {
    console.error('Error obteniendo clave VAPID:', error)
    throw error
  }
}

// Solicitar permiso de notificaciones
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Este navegador no soporta notificaciones')
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    throw new Error('Los permisos de notificación están bloqueados. Habilítalos en la configuración del navegador.')
  }

  const permission = await Notification.permission
  if (permission === 'default') {
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  return permission === 'granted'
}

// Registrar service worker
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Workers no soportados en este navegador')
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('✅ Service Worker registrado:', registration.scope)

    // Esperar a que esté listo
    await navigator.serviceWorker.ready

    return registration
  } catch (error) {
    console.error('❌ Error registrando Service Worker:', error)
    throw error
  }
}

// Suscribirse a push notifications
export async function subscribeToPushNotifications(token) {
  try {
    console.log('🚀 Iniciando suscripción push...')

    // 1. Registrar service worker
    const registration = await registerServiceWorker()

    // 2. Solicitar permisos
    const hasPermission = await requestNotificationPermission()
    if (!hasPermission) {
      throw new Error('Permisos de notificación denegados')
    }

    // 3. Obtener clave VAPID
    const vapidPublicKey = await getVapidPublicKey(token)
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

    // 4. Crear suscripción push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    })

    console.log('📱 Suscripción push creada:', subscription.endpoint)

    // 5. Enviar al backend
    const subscriptionData = {
      endpoint: subscription.endpoint,
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
      user_agent: navigator.userAgent
    }

    await axios.post(`${API_URL}/api/notificaciones/subscriptions/`, subscriptionData, {
      headers: { 'Authorization': `Token ${token}` }
    })

    console.log('✅ Suscripción enviada al backend')
    return subscription

  } catch (error) {
    console.error('❌ Error en suscripción push:', error)
    throw error
  }
}

// Desuscribirse de push notifications
export async function unsubscribeFromPushNotifications(token) {
  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return

    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return

    // Eliminar del backend
    try {
      await axios.delete(`${API_URL}/api/notificaciones/subscriptions/${subscription.endpoint}/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
    } catch (backendError) {
      console.warn('Error eliminando del backend:', backendError)
    }

    // Cancelar suscripción local
    await subscription.unsubscribe()
    console.log('✅ Desuscrito de push notifications')

  } catch (error) {
    console.error('❌ Error desuscribiéndose:', error)
  }
}

// Verificar si está suscrito
export async function isSubscribedToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) return false

    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch (error) {
    console.error('Error verificando suscripción:', error)
    return false
  }
}

// Verificar soporte completo
export function isPushSupported() {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}
