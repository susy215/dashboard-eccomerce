import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NotificationBadge from '../components/admin/NotificationBadge'
import NotificationPanel from '../components/admin/NotificationPanel'
import NotificationToast from '../components/admin/NotificationToast'

export default function AdminLayout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Obtener token de autenticación
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen relative">
      {/* Notification Badge - Fixed position */}
      <div className="fixed top-4 right-4 z-40">
        <NotificationBadge
          token={token}
          onClick={() => setNotificationsOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Outlet />
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
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  )
}
