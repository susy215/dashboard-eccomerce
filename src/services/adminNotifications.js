import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
let wsConnection = null
let eventSource = null

/**
 * Configurar conexión WebSocket para notificaciones de admin
 */
export function setupWebSocketAdmin(onMessage, onError, token) {
  if (!token) {
    console.warn('No hay token para WebSocket')
    return null
  }

  try {
    // Usar WebSocket directo o Socket.IO según el backend
    const wsUrl = `${API_URL.replace('http', 'ws')}/api/admin/notificaciones/ws/?token=${token}`

    wsConnection = new ReconnectingWebSocket(wsUrl, [], {
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      maxRetries: 10,
    })

    wsConnection.onopen = () => {
      console.log('✅ WebSocket admin conectado')
    }

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Notificación admin recibida:', data)
        onMessage(data)
      } catch (e) {
        console.error('Error parseando mensaje WebSocket:', e)
        onError(e)
      }
    }

    wsConnection.onerror = (error) => {
      console.error('❌ Error WebSocket admin:', error)
      onError(error)
    }

    wsConnection.onclose = (event) => {
      console.log('🔌 WebSocket admin cerrado:', event.code, event.reason)
    }

    return wsConnection
  } catch (error) {
    console.error('Error configurando WebSocket:', error)
    onError(error)
    return null
  }
}

/**
 * Configurar Server-Sent Events (SSE) como fallback
 */
export function setupSSEAdmin(onMessage, onError, token) {
  if (!token) {
    console.warn('No hay token para SSE')
    return null
  }

  try {
    const sseUrl = `${API_URL}/api/admin/notificaciones/sse/?token=${token}`
    eventSource = new EventSource(sseUrl)

    eventSource.onopen = () => {
      console.log('✅ SSE admin conectado')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Notificación admin SSE:', data)
        onMessage(data)
      } catch (e) {
        console.error('Error parseando mensaje SSE:', e)
        onError(e)
      }
    }

    eventSource.onerror = (error) => {
      console.error('❌ Error SSE admin:', error)
      // Intentar reconectar con WebSocket
      if (wsConnection?.readyState === WebSocket.CLOSED) {
        console.log('Intentando fallback a WebSocket...')
        setupWebSocketAdmin(onMessage, onError, token)
      }
      onError(error)
    }

    return eventSource
  } catch (error) {
    console.error('Error configurando SSE:', error)
    onError(error)
    return null
  }
}

/**
 * Desconectar todas las conexiones
 */
export function disconnectAdminNotifications() {
  if (wsConnection) {
    wsConnection.close()
    wsConnection = null
  }

  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}

/**
 * Obtener historial de notificaciones
 */
export async function getAdminNotificationsHistory(page = 1, limit = 20) {
  try {
    const response = await axios.get(`${API_URL}/api/admin/notificaciones/historial/`, {
      params: { page, limit },
      headers: {
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error obteniendo historial de notificaciones:', error)
    throw error
  }
}

/**
 * Obtener notificaciones no leídas
 */
export async function getUnreadAdminNotifications() {
  try {
    // Usar endpoint correcto según API disponible
    const response = await axios.get(`${API_URL}/api/notificaciones/historial/?leida=false`, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    })
    return {
      count: response.data.count || response.data.results?.length || 0,
      results: response.data.results || []
    }
  } catch (error) {
    console.error('Error obteniendo notificaciones no leídas:', error)
    // Retornar datos vacíos en caso de error
    return { count: 0, results: [] }
  }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await axios.post(`${API_URL}/api/admin/notificaciones/marcar-leida/`, {
      id: notificationId
    }, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error marcando notificación como leída:', error)
    throw error
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await axios.post(`${API_URL}/api/admin/notificaciones/marcar-todas-leidas/`, {}, {
      headers: {
        'Authorization': `Token ${localStorage.getItem('auth_token')}`
      }
    })
    return response.data
  } catch (error) {
    console.error('Error marcando todas como leídas:', error)
    throw error
  }
}

/**
 * Configurar sistema de notificaciones con fallback automático
 */
export function setupAdminNotificationSystem(onMessage, onError, token) {
  // Por ahora solo usar polling HTTP ya que el backend no tiene WebSocket/SSE
  console.log('🚀 Usando polling HTTP (backend no tiene WebSocket/SSE implementado)...')
  return setupPollingAdmin(onMessage, onError, token)

  // Código comentado para cuando el backend implemente WebSocket/SSE:
  /*
  // Intentar WebSocket primero
  if ('WebSocket' in window) {
    console.log('🚀 Intentando conectar con WebSocket...')
    const ws = setupWebSocketAdmin(onMessage, onError, token)
    if (ws) return ws
  }

  // Fallback a SSE
  if ('EventSource' in window) {
    console.log('🚀 Intentando conectar con SSE...')
    const sse = setupSSEAdmin(onMessage, onError, token)
    if (sse) return sse
  }

  // Último fallback: polling HTTP
  console.log('🚀 Usando polling HTTP como fallback...')
  return setupPollingAdmin(onMessage, onError, token)
  */
}

/**
 * Polling HTTP como último recurso
 */
function setupPollingAdmin(onMessage, onError, token) {
  let pollInterval = null
  let lastNotificationId = null

  const poll = async () => {
    try {
      const notifications = await getUnreadAdminNotifications()
      if (notifications.results && notifications.results.length > 0) {
        // Procesar solo notificaciones nuevas
        const newNotifications = lastNotificationId
          ? notifications.results.filter(n => n.id > lastNotificationId)
          : notifications.results

        newNotifications.forEach(notification => {
          onMessage(notification)
        })

        if (notifications.results.length > 0) {
          lastNotificationId = Math.max(...notifications.results.map(n => n.id))
        }
      }
    } catch (error) {
      console.error('Error en polling:', error)
      onError(error)
    }
  }

  // Iniciar polling cada 15 segundos (más responsivo)
  pollInterval = setInterval(poll, 15000)

  // Primera verificación inmediata
  poll()

  return {
    close: () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }
  }
}
