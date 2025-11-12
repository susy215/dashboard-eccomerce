import { useState, useEffect } from 'react'
import Dashboard from '../pages/Dashboard'
import NotificationBadge from '../components/admin/NotificationBadge'
import NotificationPanel from '../components/admin/NotificationPanel'
import NotificationSettings from '../components/admin/NotificationSettings'
import LogoutButton from '../components/admin/LogoutButton'
import { registerServiceWorker } from '../services/pushNotifications'

export default function AdminLayout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Obtener token (puede estar en 'token' o 'auth_token')
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  // Registrar service worker al cargar
  useEffect(() => {
    const initServiceWorker = async () => {
      try {
        await registerServiceWorker()
        console.log('✅ Service Worker registrado exitosamente')
      } catch (error) {
        console.warn('⚠️ No se pudo registrar Service Worker:', error.message)
      }
    }

    initServiceWorker()

    // Escuchar eventos personalizados para abrir notificaciones
    const handleOpenNotifications = () => {
      setNotificationsOpen(true)
    }

    window.addEventListener('openNotifications', handleOpenNotifications)

    return () => {
      window.removeEventListener('openNotifications', handleOpenNotifications)
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* Dashboard con header integrado que incluye los botones */}
      <Dashboard />

      {/* Notification Settings */}
      <NotificationSettings
        token={token}
        onClose={() => {}} // No necesita onClose especial
      />

      {/* Notification Panel */}
      <NotificationPanel
        token={token}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}