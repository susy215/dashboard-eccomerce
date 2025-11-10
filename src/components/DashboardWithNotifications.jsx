import { useState } from 'react'
import Dashboard from '../pages/Dashboard'
import NotificationBadge from './admin/NotificationBadge'
import NotificationPanel from './admin/NotificationPanel'
import NotificationToast from './admin/NotificationToast'

export default function DashboardWithNotifications() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Obtener token de autenticación
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  return (
    <div className="relative">
      {/* Dashboard principal */}
      <Dashboard />

      {/* Notification Badge - Fixed position, no interferir con dashboard */}
      <div className="fixed top-6 right-6 z-50">
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

      {/* Notification Toasts */}
      <NotificationToast token={token} />

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
