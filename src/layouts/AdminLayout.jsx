import { useState } from 'react'
import Dashboard from '../pages/Dashboard'
import NotificationBadge from '../components/admin/NotificationBadge'
import NotificationPanel from '../components/admin/NotificationPanel'

export default function AdminLayout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Obtener token (puede estar en 'token' o 'auth_token')
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen">
      {/* Dashboard con header integrado */}
      <Dashboard />

      {/* Notification Badge - posicionado absolutamente sobre el dashboard */}
      <div className="fixed top-4 right-4 z-50">
        <NotificationBadge
          token={token}
          onClick={() => setNotificationsOpen(true)}
        />
      </div>

      {/* Notification Panel */}
      <NotificationPanel
        token={token}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}