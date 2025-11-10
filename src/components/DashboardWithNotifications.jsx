import { useState, useEffect } from 'react'
import Dashboard from '../pages/Dashboard'
import NotificationPanel from './admin/NotificationPanel'
import NotificationToast from './admin/NotificationToast'
import NotificationPermissionPrompt from './admin/NotificationPermissionPrompt'

export default function DashboardWithNotifications() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false)

  // Obtener token de autenticación
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  // Verificar permisos de notificación al cargar
  useEffect(() => {
    const checkPermissions = async () => {
      if ('Notification' in window) {
        // Solo mostrar prompt si no se ha pedido permiso antes
        const hasPrompted = localStorage.getItem('notification_permission_prompted')

        if (!hasPrompted && Notification.permission === 'default') {
          // Pequeño delay para que cargue la página
          setTimeout(() => {
            setShowPermissionPrompt(true)
          }, 2000)
        } else if (Notification.permission === 'granted') {
          // Si ya tiene permisos, intentar suscribirse automáticamente
          console.log('✅ Permisos de notificación ya concedidos')
        }
      }
    }

    checkPermissions()
  }, [])

  // Escuchar eventos personalizados para abrir el panel
  useEffect(() => {
    const handleOpenNotifications = () => {
      setNotificationsOpen(true)
    }

    window.addEventListener('openNotifications', handleOpenNotifications)

    return () => {
      window.removeEventListener('openNotifications', handleOpenNotifications)
    }
  }, [])

  const handlePermissionResponse = (granted) => {
    setShowPermissionPrompt(false)
    localStorage.setItem('notification_permission_prompted', 'true')

    if (granted) {
      console.log('✅ Usuario concedió permisos de notificación')
    } else {
      console.log('❌ Usuario denegó permisos de notificación')
    }
  }

  return (
    <div className="relative">
      {/* Dashboard principal */}
      <Dashboard />

      {/* Notification Panel */}
      <NotificationPanel
        token={token}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Notification Toasts */}
      <NotificationToast token={token} />

      {/* Permission Prompt */}
      {showPermissionPrompt && (
        <NotificationPermissionPrompt
          onResponse={handlePermissionResponse}
          onClose={() => setShowPermissionPrompt(false)}
        />
      )}

      {/* Overlay for mobile when panel is open */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  )
}
