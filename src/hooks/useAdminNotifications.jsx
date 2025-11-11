import { useState, useEffect, useRef, useCallback } from 'react'
import { setupAdminWebSocket, disconnectAdminWebSocket, adminNotificationsAPI } from '../services/adminNotifications'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAdminNotifications(token) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState('websocket') // 'websocket' | 'polling'
  const wsRef = useRef(null)
  const pollingIntervalRef = useRef(null)
  const lastNotificationIdRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    try {
      const response = await adminNotificationsAPI.getNotifications()
      setNotifications(response.data.results || [])
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }, [])

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await adminNotificationsAPI.getUnreadCount()
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Error cargando conteo:', error)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await adminNotificationsAPI.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marcando como leída:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await adminNotificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }, [])

  // Fallback a HTTP polling
  const startHttpPolling = useCallback(() => {
    console.log('🔄 Iniciando polling HTTP como fallback...')

    const pollForNotifications = async () => {
      try {
        // Usar el endpoint correcto según tu backend
        const response = await axios.get(`${API_URL}/api/notificaciones/historial/?leida=false`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        })

        const newNotifications = response.data.results || []

        // Filtrar solo notificaciones nuevas
        const reallyNewNotifications = lastNotificationIdRef.current
          ? newNotifications.filter(n => n.id > lastNotificationIdRef.current)
          : newNotifications

        if (reallyNewNotifications.length > 0) {
          console.log('🔔 Nuevas notificaciones via HTTP:', reallyNewNotifications.length)

          reallyNewNotifications.forEach(notification => {
            // Solo agregar si es nueva_compra o nuevo_pago
            if (notification.tipo === 'nueva_compra' || notification.tipo === 'nuevo_pago') {
              setNotifications(prev => [notification, ...prev])
              setUnreadCount(prev => prev + 1)

              // Mostrar notificación del navegador
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.titulo, {
                  body: notification.mensaje,
                  icon: '/admin-icon.png',
                  tag: `admin-${notification.id}`
                })
              }
            }
          })

          if (newNotifications.length > 0) {
            lastNotificationIdRef.current = Math.max(...newNotifications.map(n => n.id))
          }
        }

        setUnreadCount(newNotifications.filter(n => !n.leida && (n.tipo === 'nueva_compra' || n.tipo === 'nuevo_pago')).length)

      } catch (error) {
        console.error('Error en polling HTTP:', error)
      }
    }

    // Polling cada 30 segundos
    pollingIntervalRef.current = setInterval(pollForNotifications, 30000)

    // Primera verificación inmediata
    pollForNotifications()
  }, [token])

  const stopHttpPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!token) return

    let connectionAttempts = 0
    let wsFailed = false

    const handleMessage = (data) => {
      if (data.type === 'notification') {
        // Solo procesar notificaciones de compras y pagos
        if (data.tipo === 'nueva_compra' || data.tipo === 'nuevo_pago') {
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
    }

    const handleError = (error) => {
      console.error('Error WS admin:', error)
      connectionAttempts++

      // Si falla 3 veces seguidas, cambiar a polling HTTP
      if (connectionAttempts >= 3 && !wsFailed) {
        console.warn('⚠️ WebSocket falló 3 veces, cambiando a polling HTTP')
        wsFailed = true
        setConnectionMode('polling')
        setIsConnected(false)

        // Detener WebSocket
        if (wsRef.current) {
          disconnectAdminWebSocket(wsRef.current)
          wsRef.current = null
        }

        // Iniciar polling HTTP
        startHttpPolling()
      }
    }

    // Intentar WebSocket primero
    console.log('🚀 Intentando conectar WebSocket...')
    wsRef.current = setupAdminWebSocket(handleMessage, handleError, token)
    setIsConnected(true)
    setConnectionMode('websocket')

    // Cargar datos iniciales
    loadNotifications()
    loadUnreadCount()

    return () => {
      disconnectAdminWebSocket(wsRef.current)
      stopHttpPolling()
    }
  }, [token, loadNotifications, loadUnreadCount, startHttpPolling, stopHttpPolling])

  return {
    notifications,
    unreadCount,
    isConnected,
    connectionMode,
    markAsRead,
    markAllAsRead,
    loadNotifications
  }
}
