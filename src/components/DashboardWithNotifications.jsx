import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import NotificationBadge from '../components/admin/NotificationBadge'
import NotificationPanel from '../components/admin/NotificationPanel'

export default function AdminLayout() {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const token = localStorage.getItem('auth_token')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-xl font-semibold">Panel Administrativo</h1>

          <NotificationBadge
            token={token}
            onClick={() => setNotificationsOpen(true)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>

      {/* Notification Panel */}
      <NotificationPanel
        token={token}
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  )
}
