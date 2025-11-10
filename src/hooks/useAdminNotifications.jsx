import { useState, useEffect, useCallback, useRef } from 'react'
import {
  setupAdminNotificationSystem,
  disconnectAdminNotifications,
  getAdminNotificationsHistory,
  getUnreadAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/adminNotifications'

export function useAdminNotifications(token) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const connectionRef = useRef(null)

  // Conectar al sistema de notificaciones
  const connect = useCallback(() => {
    if (!token || connectionRef.current) return

    console.log('🔌 Conectando a notificaciones admin...')

    const handleMessage = (notification) => {
      console.log('📨 Nueva notificación admin:', notification)

      // Agregar al estado
      setNotifications(prev => [notification, ...prev])
      setUnreadCount(prev => prev + 1)

      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        showBrowserNotification(notification)
      }

      // Reproducir sonido si está disponible
      playNotificationSound()
    }

    const handleError = (error) => {
      console.error('❌ Error en notificaciones admin:', error)
      setError(error)
      setIsConnected(false)
    }

    try {
      connectionRef.current = setupAdminNotificationSystem(handleMessage, handleError, token)
      setIsConnected(true) // En polling HTTP, consideramos "conectado" = true
      setError(null)
    } catch (err) {
      console.error('Error conectando a notificaciones:', err)
      setError(err)
      setIsConnected(false)
    }
  }, [token])

  // Desconectar
  const disconnect = useCallback(() => {
    if (connectionRef.current) {
      disconnectAdminNotifications()
      connectionRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Cargar historial
  const loadHistory = useCallback(async (page = 1, limit = 20) => {
    setLoading(true)
    try {
      const data = await getAdminNotificationsHistory(page, limit)
      if (page === 1) {
        setNotifications(data.results || [])
      } else {
        setNotifications(prev => [...prev, ...(data.results || [])])
      }
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar no leídas
  const loadUnread = useCallback(async () => {
    try {
      const data = await getUnreadAdminNotifications()
      setUnreadCount(data.count || 0)
      return data
    } catch (err) {
      console.error('Error cargando no leídas:', err)
      return { count: 0 }
    }
  }, [])

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marcando como leída:', err)
      throw err
    }
  }, [])

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marcando todas como leídas:', err)
      throw err
    }
  }, [])

  // Efecto para conectar/desconectar
  useEffect(() => {
    if (token) {
      connect()
      loadHistory()
      loadUnread()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect, loadHistory, loadUnread])

  return {
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    loadHistory,
    loadUnread,
    markAsRead,
    markAllAsRead,
    connect,
    disconnect
  }
}

/**
 * Mostrar notificación del navegador
 */
function showBrowserNotification(notification) {
  const options = {
    body: notification.mensaje || notification.body,
    icon: '/admin-icon.png',
    badge: '/admin-badge.png',
    tag: `admin-${notification.id}`,
    requireInteraction: true,
    data: {
      url: notification.url || '/admin/orders',
      type: notification.tipo
    }
  }

  const browserNotification = new Notification(
    notification.titulo || 'Nueva Notificación Admin',
    options
  )

  browserNotification.onclick = () => {
    window.focus()
    if (notification.url) {
      window.location.href = notification.url
    }
    browserNotification.close()
  }

  // Auto-cerrar después de 5 segundos
  setTimeout(() => {
    browserNotification.close()
  }, 5000)
}

/**
 * Reproducir sonido de notificación
 */
function playNotificationSound() {
  try {
    const audio = new Audio('/notification-sound.mp3')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Silenciar error si el audio no está disponible
    })
  } catch (e) {
    // Silenciar error
  }
}
