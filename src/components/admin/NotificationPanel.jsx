import { useState } from 'react'
import { Bell, X, Check, ShoppingCart, CreditCard } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const TYPE_ICONS = {
  nueva_compra: ShoppingCart,
  nuevo_pago: CreditCard,
}

export default function NotificationPanel({ isOpen, onClose, token }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications(token)
  const [activeTab, setActiveTab] = useState('all')

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.leida)
    : notifications

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-md bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Notificaciones</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : ''
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === 'unread' ? 'border-b-2 border-blue-500 text-blue-600' : ''
            }`}
          >
            No leídas ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="p-3 border-b">
            <button
              onClick={markAllAsRead}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = TYPE_ICONS[notification.tipo] || Bell

                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{notification.titulo}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.mensaje}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.creada).toLocaleString()}
                        </p>
                      </div>

                      {!notification.leida && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
