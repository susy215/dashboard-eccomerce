import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// WebSocket está permanentemente deshabilitado - backend no lo soporta
export function setupAdminWebSocket(onMessage, onError, token) {
  console.log('🚫 WebSocket admin no disponible en backend - usando HTTP polling')
  return null
}

// Función para deshabilitar WebSocket (ya está deshabilitado)
export function disableWebSocket() {
  console.log('🚫 WebSocket ya está deshabilitado permanentemente')
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
