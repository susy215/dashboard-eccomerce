import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Variable global para controlar si WebSocket debe reconectar
let websocketDisabled = false

export function setupAdminWebSocket(onMessage, onError, token) {
  if (!token) {
    console.warn('No hay token para WebSocket admin')
    return null
  }

  // Si WebSocket está deshabilitado, no crear conexión
  if (websocketDisabled) {
    console.log('🚫 WebSocket deshabilitado permanentemente')
    return null
  }

  const wsUrl = `${API_URL.replace('http', 'ws')}/ws/admin/notifications/?token=${token}`

  const ws = new ReconnectingWebSocket(wsUrl, [], {
    maxReconnectionDelay: 5000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    maxRetries: 3, // Solo 3 intentos
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
  }

  return ws
}

// Función para deshabilitar WebSocket permanentemente
export function disableWebSocket() {
  console.log('🚫 Deshabilitando WebSocket permanentemente')
  websocketDisabled = true
}

export function disconnectAdminWebSocket(ws) {
  if (ws) {
    ws.close()
  }
}

// API REST calls - según el YAML del backend
export const adminNotificationsAPI = {
  getNotifications: (token) => axios.get(`${API_URL}/api/notificaciones/historial/`, {
    headers: { 'Authorization': `Token ${token}` }
  }),
  getUnreadCount: (token) => axios.get(`${API_URL}/api/notificaciones/historial/?leida=false`, {
    headers: { 'Authorization': `Token ${token}` }
  }),
  markAsRead: (token, id) => axios.post(`${API_URL}/api/notificaciones/historial/marcar_todas_leidas/`, {}, {
    headers: { 'Authorization': `Token ${token}` }
  }),
  markAllAsRead: (token) => axios.post(`${API_URL}/api/notificaciones/historial/marcar_todas_leidas/`, {}, {
    headers: { 'Authorization': `Token ${token}` }
  })
}
