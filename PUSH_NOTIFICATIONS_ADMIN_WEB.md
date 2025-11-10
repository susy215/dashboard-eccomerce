# 🖥️ Sistema de Push Notifications para Administradores - React Web

## 🎯 Descripción General

Sistema de notificaciones push para panel de administración web (no PWA) que recibe alertas cuando los clientes realizan compras. Utiliza WebSockets o Server-Sent Events (SSE) para notificaciones en tiempo real, con fallback a polling HTTP.

## 🏗️ Arquitectura del Sistema

### Componentes Principales
```
Panel Admin React (Web)
├── Servicio WebSocket/SSE
├── Hook useAdminNotifications
├── Componente NotificationToast
├── Dashboard con indicadores en tiempo real
└── Historial de notificaciones
```

### Backend API Endpoints
```javascript
// Endpoints utilizados
GET    /api/admin/notificaciones/ws/          // WebSocket endpoint
GET    /api/admin/notificaciones/sse/         // Server-Sent Events
POST   /api/admin/notificaciones/marcar-leida/
GET    /api/admin/notificaciones/historial/
GET    /api/admin/notificaciones/no-leidas/
```

## 📋 Requisitos Previos

### 1. **Navegadores Soportados**
```javascript
const supportsWebSocket = 'WebSocket' in window
const supportsEventSource = 'EventSource' in window
const supportsNotifications = 'Notification' in window
```

### 2. **Dependencias**
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "axios": "^1.0.0",
    "lucide-react": "^0.294.0",
    "reconnecting-websocket": "^4.4.0"
  },
  "devDependencies": {
    "socket.io-client": "^4.7.0"
  }
}
```

## 🔧 Implementación Paso a Paso

### Paso 1: Servicio de Conexión WebSocket (`src/services/adminNotifications.js`)

```javascript
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
      params: { page, limit }
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
    const response = await axios.get(`${API_URL}/api/admin/notificaciones/no-leidas/`)
    return response.data
  } catch (error) {
    console.error('Error obteniendo notificaciones no leídas:', error)
    throw error
  }
}

/**
 * Marcar notificación como leída
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await axios.post(`${API_URL}/api/admin/notificaciones/marcar-leida/`, {
      id: notificationId
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
    const response = await axios.post(`${API_URL}/api/admin/notificaciones/marcar-todas-leidas/`)
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

  // Iniciar polling cada 30 segundos
  pollInterval = setInterval(poll, 30000)

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
```

### Paso 2: Hook Personalizado (`src/hooks/useAdminNotifications.jsx`)

```javascript
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
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error('Error conectando a notificaciones:', err)
      setError(err)
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
```

### Paso 3: Componente Toast de Notificación (`src/components/admin/NotificationToast.jsx`)

```javascript
import { useState, useEffect } from 'react'
import { X, ShoppingCart, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const NOTIFICATION_TYPES = {
  nueva_compra: {
    icon: ShoppingCart,
    color: 'bg-blue-500',
    title: 'Nueva Compra'
  },
  nuevo_pago: {
    icon: CreditCard,
    color: 'bg-green-500',
    title: 'Nuevo Pago'
  },
  sistema: {
    icon: AlertCircle,
    color: 'bg-yellow-500',
    title: 'Sistema'
  },
  error: {
    icon: CheckCircle,
    color: 'bg-red-500',
    title: 'Error'
  }
}

export default function NotificationToast({ token }) {
  const { notifications, markAsRead } = useAdminNotifications(token)
  const [visibleNotifications, setVisibleNotifications] = useState([])

  useEffect(() => {
    // Agregar nuevas notificaciones a las visibles
    const newNotifications = notifications.filter(n =>
      !n.leida && !visibleNotifications.find(vn => vn.id === n.id)
    )

    if (newNotifications.length > 0) {
      setVisibleNotifications(prev => [...newNotifications, ...prev])

      // Auto-remover después de 5 segundos
      newNotifications.forEach(notification => {
        setTimeout(() => {
          removeNotification(notification.id)
        }, 5000)
      })
    }
  }, [notifications])

  const removeNotification = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id)
    removeNotification(notification.id)

    // Redirigir según el tipo
    if (notification.url) {
      window.location.href = notification.url
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.slice(0, 3).map((notification) => {
        const typeConfig = NOTIFICATION_TYPES[notification.tipo] ||
                          NOTIFICATION_TYPES.sistema
        const Icon = typeConfig.icon

        return (
          <div
            key={notification.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border
                     border-gray-200 dark:border-gray-700 p-4 cursor-pointer
                     hover:shadow-xl transition-all duration-200 animate-in
                     slide-in-from-right-2 fade-in"
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${typeConfig.color}
                             flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {typeConfig.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {notification.mensaje || notification.body}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notification.creada).toLocaleTimeString()}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeNotification(notification.id)
                }}
                className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-gray-100
                         dark:hover:bg-gray-700 flex items-center justify-center
                         transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### Paso 4: Componente Badge de Notificaciones (`src/components/admin/NotificationBadge.jsx`)

```javascript
import { Bell } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

export default function NotificationBadge({ token, onClick }) {
  const { unreadCount } = useAdminNotifications(token)

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
               transition-colors"
      title="Notificaciones"
    >
      <Bell className="w-5 h-5" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                       rounded-full min-w-[18px] h-[18px] flex items-center
                       justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
```

### Paso 5: Panel de Notificaciones (`src/components/admin/NotificationPanel.jsx`)

```javascript
import { useState } from 'react'
import { X, Check, CheckCheck, ShoppingCart, CreditCard, AlertCircle } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'
import Button from '../ui/Button'

const NOTIFICATION_TYPES = {
  nueva_compra: {
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20'
  },
  nuevo_pago: {
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/20'
  },
  sistema: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
  }
}

export default function NotificationPanel({ token, isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    loading,
    loadHistory,
    markAsRead,
    markAllAsRead
  } = useAdminNotifications(token)

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread'

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.leida)
    : notifications

  const handleMarkAsRead = async (notification) => {
    if (!notification.leida) {
      await markAsRead(notification.id)
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleLoadMore = () => {
    const nextPage = Math.ceil(notifications.length / 20) + 1
    loadHistory(nextPage)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-md bg-white dark:bg-gray-800
                    shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg">Notificaciones</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'unread'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleMarkAllAsRead}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.tipo] ||
                                  NOTIFICATION_TYPES.sistema
                const Icon = typeConfig.icon

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50
                               cursor-pointer transition-colors ${
                                 !notification.leida ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                               }`}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${typeConfig.bgColor}
                                     flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.titulo}
                          </h4>
                          {!notification.leida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.mensaje}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(notification.creada).toLocaleString()}
                        </p>
                      </div>

                      {notification.leida && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {notifications.length >= 20 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleLoadMore}
                size="sm"
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Paso 6: Integración en Layout Admin (`src/layouts/AdminLayout.jsx`)

```javascript
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/admin/Navbar'
import Sidebar from '../components/admin/Sidebar'
import NotificationBadge from '../components/admin/NotificationBadge'
import NotificationPanel from '../components/admin/NotificationPanel'
import NotificationToast from '../components/admin/NotificationToast'
import { useAuth } from '../hooks/useAuth'

export default function AdminLayout() {
  const { user } = useAuth()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const token = localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar>
        <NotificationBadge
          token={token}
          onClick={() => setNotificationsOpen(true)}
        />
      </Navbar>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Notifications */}
      <NotificationPanel
        token={token}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <NotificationToast token={token} />
    </div>
  )
}
```

## 🎯 Tipos de Notificaciones para Administradores

### 1. **Nueva Compra** 🛒
```javascript
{
  tipo: "nueva_compra",
  titulo: "Nueva Compra Realizada",
  mensaje: "El cliente {nombre} realizó una compra #{id} por ${total}",
  url: "/admin/orders/{id}",
  datos: {
    cliente_id: 123,
    compra_id: 456,
    total: 150.00
  }
}
```

### 2. **Nuevo Pago Confirmado** 💰
```javascript
{
  tipo: "nuevo_pago",
  titulo: "Nuevo Pago Confirmado",
  mensaje: "El cliente {nombre} confirmó el pago de la compra #{id} por ${total}",
  url: "/admin/orders/{id}",
  datos: {
    cliente_id: 123,
    compra_id: 456,
    total: 150.00,
    metodo_pago: "stripe"
  }
}
```

### 3. **Sistema/Alerta** ⚠️
```javascript
{
  tipo: "sistema",
  titulo: "Alerta del Sistema",
  mensaje: "Stock bajo para el producto {nombre}",
  url: "/admin/products/{id}",
  datos: {
    producto_id: 789,
    stock_actual: 5,
    stock_minimo: 10
  }
}
```

## 🔧 Backend Django

### Modelo de Notificación Admin
```python
# models.py
class NotificacionAdmin(models.Model):
    TIPO_CHOICES = [
        ('nueva_compra', 'Nueva Compra'),
        ('nuevo_pago', 'Nuevo Pago'),
        ('sistema', 'Sistema'),
        ('stock_bajo', 'Stock Bajo'),
        ('error_pago', 'Error de Pago'),
    ]

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'admin'})
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    url = models.URLField(blank=True)
    datos = models.JSONField(blank=True, null=True)
    leida = models.BooleanField(default=False)
    creada = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creada']
```

### WebSocket Consumer
```python
# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import NotificacionAdmin

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated or self.user.role != 'admin':
            await self.close()
            return

        await self.channel_layer.group_add(
            f'admin_notifications_{self.user.id}',
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            f'admin_notifications_{self.user.id}',
            self.channel_name
        )

    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps(notification))
```

### Servicio para Enviar Notificaciones
```python
# push_service.py
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import NotificacionAdmin

def send_admin_notification(user, tipo, titulo, mensaje, url='', datos=None):
    """Enviar notificación a un admin específico"""
    # Crear en BD
    notification = NotificacionAdmin.objects.create(
        usuario=user,
        tipo=tipo,
        titulo=titulo,
        mensaje=mensaje,
        url=url,
        datos=datos or {}
    )

    # Enviar por WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'admin_notifications_{user.id}',
        {
            'type': 'send_notification',
            'notification': {
                'id': notification.id,
                'tipo': tipo,
                'titulo': titulo,
                'mensaje': mensaje,
                'url': url,
                'datos': datos,
                'creada': notification.creada.isoformat(),
                'leida': False
            }
        }
    )

    return notification

def send_nueva_compra_admin(compra):
    """Notificar nueva compra a admins"""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    admins = User.objects.filter(role='admin', is_active=True)
    for admin in admins:
        send_admin_notification(
            admin,
            'nueva_compra',
            'Nueva Compra Realizada',
            f'El cliente {compra.usuario.get_full_name()} realizó una compra #{compra.id} por ${compra.total}',
            f'/admin/orders/{compra.id}/',
            {
                'cliente_id': compra.usuario.id,
                'compra_id': compra.id,
                'total': str(compra.total)
            }
        )

def send_nuevo_pago_admin(pago):
    """Notificar nuevo pago confirmado a admins"""
    from django.contrib.auth import get_user_model
    User = get_user_model()

    admins = User.objects.filter(role='admin', is_active=True)
    for admin in admins:
        send_admin_notification(
            admin,
            'nuevo_pago',
            'Nuevo Pago Confirmado',
            f'El cliente {pago.compra.usuario.get_full_name()} confirmó el pago de la compra #{pago.compra.id} por ${pago.monto}',
            f'/admin/orders/{pago.compra.id}/',
            {
                'cliente_id': pago.compra.usuario.id,
                'compra_id': pago.compra.id,
                'pago_id': pago.id,
                'total': str(pago.monto)
            }
        )
```

### URLs y Views
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('notificaciones/ws/', AdminNotificationConsumer.as_asgi(), name='admin_ws'),
    path('notificaciones/sse/', views.admin_sse_view, name='admin_sse'),
    path('notificaciones/historial/', views.AdminNotificationListView.as_view(), name='admin_notifications'),
    path('notificaciones/no-leidas/', views.AdminUnreadCountView.as_view(), name='admin_unread_count'),
    path('notificaciones/marcar-leida/', views.MarkAsReadView.as_view(), name='mark_as_read'),
    path('notificaciones/marcar-todas-leidas/', views.MarkAllAsReadView.as_view(), name='mark_all_as_read'),
]
```

## 🧪 Testing

### Verificar Conexión WebSocket
```javascript
// En consola del navegador
const ws = new WebSocket('ws://localhost:8000/api/admin/notificaciones/ws/?token=YOUR_TOKEN')
ws.onmessage = (event) => console.log('Mensaje recibido:', event.data)
```

### Probar Notificación Manual
```javascript
// Simular nueva compra
fetch('/api/admin/test-notification/', {
  method: 'POST',
  headers: { 'Authorization': 'Token YOUR_TOKEN' },
  body: JSON.stringify({
    tipo: 'nueva_compra',
    titulo: 'Compra de Prueba',
    mensaje: 'Esta es una notificación de prueba'
  })
})
```

## 📱 Responsive Design

### Media Queries para Móviles
```css
.notification-panel {
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
  }
}

.notification-toast {
  @media (max-width: 640px) {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}
```

## 🔒 Seguridad

### Validación de Usuario
```javascript
// Solo permitir admins
const isAdmin = user && user.role === 'admin'
if (!isAdmin) {
  // Desconectar o no mostrar notificaciones
  disconnectAdminNotifications()
}
```

### Sanitización de Datos
```javascript
// Limpiar datos antes de mostrar
const cleanMessage = DOMPurify.sanitize(notification.mensaje)
```

## 📊 Dashboard con Indicadores

### Componente de Estadísticas
```javascript
export default function AdminDashboard({ token }) {
  const { unreadCount, isConnected } = useAdminNotifications(token)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Estado de Conexión */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Estado del Sistema</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>

      {/* Notificaciones Pendientes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Notificaciones</h3>
        <div className="text-3xl font-bold text-blue-600">{unreadCount}</div>
        <p className="text-gray-600">pendientes</p>
      </div>
    </div>
  )
}
```

## 🚀 Despliegue

### Configuración Nginx para WebSockets
```nginx
# nginx.conf
upstream websocket_backend {
    ip_hash;
    server backend:8000;
}

server {
    listen 80;
    server_name admin.midominio.com;

    location /api/admin/notificaciones/ws/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Variables de Entorno
```bash
# .env.production
VITE_API_URL=https://api.midominio.com
VITE_WS_URL=wss://api.midominio.com
```

¡Sistema completo de notificaciones para administradores implementado! 🎉
