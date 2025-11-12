// Sin useState/useEffect ya que no hay tabs
import { Bell, X, ShoppingCart, CreditCard, AlertCircle, Package, Clock, Wifi, WifiOff } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const TYPE_CONFIG = {
  nueva_compra: {
    icon: ShoppingCart,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    label: 'Nueva Compra'
  },
  nuevo_pago: {
    icon: CreditCard,
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-700 dark:text-green-300',
    label: 'Nuevo Pago'
  },
  stock_bajo: {
    icon: Package,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    textColor: 'text-orange-700 dark:text-orange-300',
    label: 'Stock Bajo'
  },
  sistema: {
    icon: AlertCircle,
    color: 'bg-gray-500',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    textColor: 'text-gray-700 dark:text-gray-300',
    label: 'Sistema'
  },
  error: {
    icon: AlertCircle,
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    textColor: 'text-red-700 dark:text-red-300',
    label: 'Error'
  }
}

export default function NotificationPanel({ isOpen, onClose, token }) {
  const {
    notifications,
    isConnected,
    connectionStatus,
    loading,
    markAsRead
  } = useAdminNotifications(token)

  const handleNotificationClick = (notification) => {
    // Marcar como leída si no lo está
    if (!notification.leida) {
      markAsRead(notification.id)
    }
    // Navegar a la URL específica si existe
    if (notification.url) {
      window.location.href = notification.url
    }
  }

  const getTypeConfig = (tipo) => TYPE_CONFIG[tipo] || TYPE_CONFIG.sistema
  const ConnectionIcon = isConnected ? Wifi : WifiOff

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay con animación */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel principal */}
      <div className="relative ml-auto w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out">
        {/* Header simplificado */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Notificaciones</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <ConnectionIcon className={`w-3 h-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span>
                  WebSocket • {connectionStatus}
                </span>
                {loading && <div className="animate-spin rounded-full h-3 w-3 border border-slate-400 border-t-transparent" />}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Información simple */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {notifications.length} notificaciones • Ordenadas por fecha
          </p>
        </div>

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                No hay notificaciones
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Las nuevas notificaciones aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map((notification, index) => {
                const config = getTypeConfig(notification.tipo)
                const Icon = config.icon

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 animate-in slide-in-from-right-2 fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono del tipo */}
                      <div className={`flex-shrink-0 w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.textColor}`} />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {notification.titulo}
                          </h4>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                          {notification.mensaje}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {notification.fechaFormateada && notification.fechaFormateada !== 'Fecha desconocida'
                              ? notification.fechaFormateada
                              : notification.creada
                                ? new Date(notification.creada).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Sin fecha'
                            }
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer simple */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Última actualización: {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  )
}
