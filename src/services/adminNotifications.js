import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function setupAdminWebSocket(onMessage, onError, token) {
  if (!token) {
    console.warn('No hay token para WebSocket admin')
    return null
  }

  const wsUrl = `${API_URL.replace('http', 'ws')}/ws/admin/notifications/?token=${token}`

  const ws = new ReconnectingWebSocket(wsUrl, [], {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    maxRetries: 5, // Reducir intentos para no saturar
  })

  let connectionAttempts = 0

  ws.onopen = () => {
    console.log('✅ WebSocket admin conectado')
    connectionAttempts = 0
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('📨 Notificación admin:', data)
      onMessage(data)
    } catch (e) {
      console.error('Error parseando mensaje WS:', e)
      onError(e)
    }
  }

  ws.onerror = (error) => {
    console.error('❌ Error WebSocket admin:', error)
    connectionAttempts++
    onError(error)
  }

  ws.onclose = (event) => {
    console.log('🔌 WebSocket admin cerrado:', event.code, event.reason)

    // Si se cerró por error del servidor y hemos intentado varias veces,
    // probablemente el backend no tiene WebSocket implementado
    if (event.code !== 1000 && connectionAttempts >= 3) {
      console.warn('⚠️ WebSocket no disponible en el backend. Considera implementar Channels.')
    }
  }

  return ws
}

export function disconnectAdminWebSocket(ws) {
  if (ws) {
    ws.close()
  }
}

// API REST calls
export const adminNotificationsAPI = {
  getNotifications: () => axios.get('/api/notificaciones/admin/'),
  getUnreadCount: () => axios.get('/api/notificaciones/admin/no-leidas/'),
  markAsRead: (id) => axios.post(`/api/notificaciones/admin/${id}/marcar-leida/`),
  markAllAsRead: () => axios.post('/api/notificaciones/admin/marcar-todas-leidas/')
}
