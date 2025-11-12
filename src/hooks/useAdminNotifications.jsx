import { useState, useEffect, useRef, useCallback } from 'react'
import { adminNotificationsAPI } from '../services/adminNotifications'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Utilidad para formatear fechas correctamente
function formatNotificationDate(dateString) {
  console.log('Formateando fecha - Input:', dateString, typeof dateString)

  if (!dateString) {
    console.log('Fecha vacía o null')
    return 'Fecha desconocida'
  }

  try {
    // Manejar diferentes formatos de fecha
    let date

    // Si es una cadena, intentar diferentes formatos
    if (typeof dateString === 'string') {
      // Intentar formato ISO primero
      if (dateString.includes('T') && dateString.includes('Z')) {
        date = new Date(dateString)
      } else if (dateString.includes('T')) {
        // Formato ISO sin Z
        date = new Date(dateString + (dateString.includes('+') ? '' : 'Z'))
      } else {
        // Otros formatos
        date = new Date(dateString)
      }
    } else {
      // Si no es string, intentar convertir directamente
      date = new Date(dateString)
    }

    console.log('Fecha parseada:', date, 'isValid:', !isNaN(date.getTime()))

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.log('Fecha inválida, retornando "Fecha desconocida"')
      return 'Fecha desconocida'
    }

    // Formatear la fecha en español
    const formatted = date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    console.log('Fecha formateada:', formatted)
    return formatted
  } catch (error) {
    console.warn('Error formateando fecha:', error, dateString)
    return 'Fecha desconocida'
  }
}

export function useAdminNotifications(token) {
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState('polling')
  const [loading, setLoading] = useState(false)

  const pollingIntervalRef = useRef(null)
  const processedIdsRef = useRef(new Set()) // Para evitar duplicados
  const lastPollTimeRef = useRef(0)
  const isInitializedRef = useRef(false)

  // Cargar notificaciones iniciales (solo recientes para mejor performance)
  const loadNotifications = useCallback(async () => {
    if (!token) return

    setLoading(true)
    try {
      // Cargar solo las últimas 20 notificaciones para mejor performance inicial
      const response = await adminNotificationsAPI.getNotifications(token)
      const notificationsData = (response.data.results || []).slice(0, 20)

      // Limpiar IDs procesados para evitar conflictos
      processedIdsRef.current.clear()

      // Procesar fechas y asegurar campos requeridos
      const processedNotifications = notificationsData
        .map(notification => {
          const fechaFormateada = formatNotificationDate(notification.creada);
          console.log('Procesando notificación:', {
            id: notification.id,
            creada: notification.creada,
            fechaFormateada: fechaFormateada
          });

          return {
            ...notification,
            fechaFormateada: fechaFormateada,
            titulo: notification.titulo || 'Nueva Notificación',
            mensaje: notification.mensaje || 'Sin mensaje',
            tipo: notification.tipo || 'sistema'
            // Eliminado: leida - ya no existe en el backend
          };
        })
        .filter(notification => {
          // Evitar duplicados basados en ID
          if (processedIdsRef.current.has(notification.id)) {
            return false
          }
          processedIdsRef.current.add(notification.id)
          return true
        })

      setNotifications(processedNotifications)

      console.log('📋 Notificaciones iniciales cargadas:', processedNotifications.length)
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Las notificaciones ya no tienen estado leído/no leído
  // Se eliminaron las funciones markAsRead y markAllAsRead

  // Polling simplificado - solo busca nuevas notificaciones
  const startHttpPolling = useCallback(() => {
    console.log('🔄 Iniciando polling HTTP simplificado...')

    const pollForNotifications = async () => {
      try {
        const now = Date.now()

        // Evitar polling demasiado frecuente (30 segundos mínimo)
        if (now - lastPollTimeRef.current < 30000) {
          return
        }

        lastPollTimeRef.current = now

        // Obtener todas las notificaciones recientes (sin filtrar por leídas)
        const response = await adminNotificationsAPI.getNotifications(token)
        const allNotifications = response.data.results || []

        console.log('Datos del backend - Cantidad:', allNotifications.length)
        if (allNotifications.length > 0) {
          console.log('Primera notificación del backend:', allNotifications[0])
          console.log('Campo "creada" de primera notificación:', allNotifications[0].creada)
        }

        // Filtrar solo las más recientes (últimas 50)
        const recentNotifications = allNotifications
          .slice(0, 50)
          .sort((a, b) => b.id - a.id)

        // Determinar cuáles son realmente nuevas
        const newNotifications = recentNotifications.filter(n =>
          !processedIdsRef.current.has(n.id)
        )

        if (newNotifications.length > 0) {
          console.log('🔔 Nuevas notificaciones detectadas:', newNotifications.length)

          // Procesar nuevas notificaciones
          const processedNewNotifications = newNotifications.map(notification => ({
            ...notification,
            fechaFormateada: formatNotificationDate(notification.creada),
            titulo: notification.titulo || 'Nueva Notificación',
            mensaje: notification.mensaje || 'Sin mensaje',
            tipo: notification.tipo || 'sistema'
          }))

          // Agregar al estado (al principio para que aparezcan arriba)
          setNotifications(prev => [...processedNewNotifications, ...prev])

          // Registrar IDs procesados
          processedNewNotifications.forEach(n => processedIdsRef.current.add(n.id))

          // Mostrar notificación del navegador (máximo 3 para no spamear)
          if ('Notification' in window && Notification.permission === 'granted') {
            processedNewNotifications.slice(0, 3).forEach(notification => {
              try {
                new Notification(notification.titulo, {
                  body: notification.mensaje,
                  icon: '/admin-icon.png',
                  tag: `admin-${notification.id}`,
                  requireInteraction: false,
                  silent: false
                })
              } catch (error) {
                console.warn('Error mostrando notificación del navegador:', error)
              }
            })
          }
        }

      } catch (error) {
        console.error('❌ Error en polling HTTP:', error)
        if (error.response?.status === 401) {
          console.error('🔐 Error de autenticación - Token inválido')
          setIsConnected(false)
        }
      }
    }

    // Polling cada 45 segundos
    pollingIntervalRef.current = setInterval(pollForNotifications, 45000)

    // Primera verificación inmediata después de un pequeño delay
    setTimeout(pollForNotifications, 2000)
  }, [token])

  const stopHttpPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Limpiar notificaciones procesadas cuando cambie el token
  useEffect(() => {
    processedIdsRef.current.clear()
    isInitializedRef.current = false
  }, [token])

  // Inicialización del sistema
  useEffect(() => {
    if (!token) {
      setIsConnected(false)
      stopHttpPolling()
      return
    }

    if (!isInitializedRef.current) {
      console.log('🚀 Inicializando sistema de notificaciones admin')

      setConnectionMode('polling')
      setIsConnected(true)

      // Cargar datos iniciales
      loadNotifications()

      // Iniciar polling
      startHttpPolling()

      isInitializedRef.current = true
    }

    return () => {
      stopHttpPolling()
    }
  }, [token, loadNotifications, startHttpPolling, stopHttpPolling])

  return {
    notifications,
    isConnected,
    connectionMode,
    loading,
    loadNotifications,
    formatNotificationDate
  }
}
