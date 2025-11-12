import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// API REST calls para notificaciones de admin
export const adminNotificationsAPI = {
  // Obtener historial completo de notificaciones
  getNotifications: (token) => axios.get(`${API_URL}/api/notificaciones/historial/`, {
    headers: { 'Authorization': `Token ${token}` }
  }),

  // Obtener solo notificaciones no leídas (para polling eficiente)
  getUnreadCount: (token) => axios.get(`${API_URL}/api/notificaciones/historial/?leida=false`, {
    headers: { 'Authorization': `Token ${token}` }
  }),

  // Marcar notificación individual como leída (si el backend lo soporta)
  markAsRead: (token, notificationId) => axios.post(`${API_URL}/api/notificaciones/marcar-leida/`, {
    id: notificationId
  }, {
    headers: { 'Authorization': `Token ${token}` }
  }),

  // Marcar todas las notificaciones como leídas
  markAllAsRead: (token) => axios.post(`${API_URL}/api/notificaciones/historial/marcar_todas_leidas/`, {}, {
    headers: { 'Authorization': `Token ${token}` }
  })
}

// Nota: WebSocket está deshabilitado porque el backend Django actual no lo soporta.
// Se usa HTTP polling cada 30 segundos como alternativa robusta.
// Para habilitar WebSocket en el futuro, implementar Channels en el backend Django.
