import { useState, useEffect, useRef, useCallback } from 'react'
import { setupAdminWebSocket, disconnectAdminWebSocket, disableWebSocket, adminNotificationsAPI } from '../services/adminNotifications'
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
      const response = await adminNotificationsAPI.getNotifications(token)
      setNotifications(response.data.results || [])
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    }
  }, [token])

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await adminNotificationsAPI.getUnreadCount(token)
      setUnreadCount(response.data.count || 0)
    } catch (error) {
      console.error('Error cargando conteo:', error)
    }
  }, [token])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Nota: El backend no tiene endpoint para marcar individualmente,
      // solo para marcar todas como leídas. Por ahora solo actualizamos localmente.
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      console.log('Notificación marcada como leída localmente')
    } catch (error) {
      console.error('Error marcando como leída:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await adminNotificationsAPI.markAllAsRead(token)
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marcando todas como leídas:', error)
    }
  }, [token])

  // Fallback a HTTP polling
  const startHttpPolling = useCallback(() => {
    console.log('🔄 Iniciando polling HTTP como fallback...')

    const pollForNotifications = async () => {
      try {
        // Usar la función API que ya tiene el token configurado
        const response = await adminNotificationsAPI.getUnreadCount(token)

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

        // Actualizar conteo total de no leídas
        const totalUnread = newNotifications.filter(n => !n.leida && (n.tipo === 'nueva_compra' || n.tipo === 'nuevo_pago')).length
        setUnreadCount(totalUnread)

      } catch (error) {
        console.error('Error en polling HTTP:', error)
        if (error.response?.status === 401) {
          console.error('❌ Error de autenticación - Token inválido')
        }
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

    console.log('🔄 Iniciando sistema de notificaciones admin con HTTP polling')

    // Configurar modo polling desde el inicio
    setConnectionMode('polling')
    setIsConnected(true)

    // Cargar datos iniciales
    loadNotifications()
    loadUnreadCount()

    // Iniciar polling HTTP inmediatamente
    startHttpPolling()

    return () => {
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
