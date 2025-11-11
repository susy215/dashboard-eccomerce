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
    maxRetries: 10,
  })

  ws.onopen = () => {
    console.log('✅ WebSocket admin conectado')
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
    onError(error)
  }

  ws.onclose = (event) => {
    console.log('🔌 WebSocket admin cerrado:', event.code)
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
