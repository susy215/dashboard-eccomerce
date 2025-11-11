import { useState, useEffect, useRef } from 'react'
import { setupAdminWebSocket, disconnectAdminWebSocket, adminNotificationsAPI } from '../services/adminNotifications'

export function useAdminNotifications(token) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const handleMessage = (data) => {
      if (data.type === 'notification') {
        setNotifications(prev => [data, ...prev])
        setUnreadCount(prev => prev + 1)

        // Mostrar notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.titulo, {
            body: data.mensaje,
            icon: '/admin-icon.png',
            tag: `admin-${data.id}`
          })
        }
      }
    }

    const handleError = (error) => {
      console.error('Error WS admin:', error)
      setIsConnected(false)
    }

    wsRef.current = setupAdminWebSocket(handleMessage, handleError, token)
    setIsConnected(true)

    // Cargar historial inicial
    loadNotifications()
    loadUnreadCount()

    return () => {
      disconnectAdminWebSocket(wsRef.current)
    }
  }, [token])

  const loadNotifications = async () => {
    try {
      const response = await adminNotificationsAPI.getNotifications()
      setNotifications(response.data.results || [])
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await adminNotificationsAPI.getUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Error cargando conteo:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await adminNotificationsAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marcando como leída:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await adminNotificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    loadNotifications
  }
}
