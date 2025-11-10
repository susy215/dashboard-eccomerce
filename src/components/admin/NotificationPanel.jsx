import { useState } from 'react'
import {
  X,
  Check,
  CheckCheck,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  Package,
  DollarSign,
  Bell,
  BellRing,
  Clock,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const NOTIFICATION_TYPES = {
  nueva_compra: {
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-100',
    hoverBg: 'hover:bg-green-100/50',
    title: 'Nueva Compra',
    description: 'Cliente realizó una compra'
  },
  nuevo_pago: {
    icon: CreditCard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-100',
    hoverBg: 'hover:bg-blue-100/50',
    title: 'Pago Confirmado',
    description: 'Pago procesado exitosamente'
  }
}

export default function NotificationPanel({ token, isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    loading,
    loadHistory,
    markAsRead,
    markAllAsRead,
    isConnected
  } = useAdminNotifications(token)

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || !notification.leida
    const matchesSearch = !searchTerm ||
      notification.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.mensaje?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || notification.tipo === selectedType

    return matchesTab && matchesSearch && matchesType
  })

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

  const handleRefresh = () => {
    loadHistory(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="
        relative ml-auto w-full max-w-lg
        bg-white/95 backdrop-blur-xl
        shadow-2xl border-l border-white/20
        flex flex-col
        transform transition-transform duration-300 ease-out
        translate-x-0
      ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100/80 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="w-7 h-7 text-blue-600" />
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">Notificaciones</h2>
              <p className="text-sm text-gray-600">
                {isConnected ? 'Conectado en tiempo real' : 'Modo offline'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              w-10 h-10 rounded-xl
              hover:bg-gray-100 active:bg-gray-200
              flex items-center justify-center
              transition-all duration-200
              transform hover:scale-110
            "
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="p-4 border-b border-gray-100/80 bg-gray-50/30">
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-white border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                  transition-all duration-200 text-sm
                  placeholder-gray-400
                "
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="
                p-2.5 rounded-xl bg-white border border-gray-200
                hover:bg-gray-50 active:bg-gray-100
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                transform hover:scale-105 active:scale-95
              "
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filtro por tipo */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedType('all')}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                transition-all duration-200 transform hover:scale-105 active:scale-95
                ${selectedType === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              Todos
            </button>
            {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-all duration-200 transform hover:scale-105 active:scale-95
                  flex items-center gap-1.5
                  ${selectedType === key
                    ? `${config.bgColor} ${config.color} border border-current`
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <config.icon className="w-3.5 h-3.5" />
                {config.title}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100/80 bg-white">
          <button
            onClick={() => setActiveTab('all')}
            className={`
              flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200
              relative overflow-hidden
              ${activeTab === 'all'
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
              }
            `}
          >
            Todas
            <span className={`
              ml-2 px-2 py-0.5 rounded-full text-xs font-bold
              ${activeTab === 'all'
                ? 'bg-blue-200 text-blue-700'
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {notifications.length}
            </span>
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`
              flex-1 py-4 px-6 text-sm font-semibold transition-all duration-200
              relative overflow-hidden
              ${activeTab === 'unread'
                ? 'text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
              }
            `}
          >
            No leídas
            {unreadCount > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === 'unread'
                  ? 'bg-red-200 text-red-700'
                  : 'bg-red-100 text-red-600'
                }
              `}>
                {unreadCount}
              </span>
            )}
            {activeTab === 'unread' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
            )}
          </button>
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-100/80 bg-gradient-to-r from-blue-50/30 to-cyan-50/30">
            <button
              onClick={handleMarkAllAsRead}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-blue-500 to-cyan-500
                text-white font-semibold text-sm
                hover:from-blue-600 hover:to-cyan-600
                active:scale-95
                transition-all duration-200
                transform hover:scale-[1.02]
                shadow-lg hover:shadow-xl
              "
            >
              <CheckCheck className="w-4 h-4" />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {searchTerm || selectedType !== 'all'
                  ? 'No se encontraron notificaciones'
                  : 'Sin notificaciones'
                }
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || selectedType !== 'all'
                  ? 'Prueba con otros filtros de búsqueda'
                  : 'Las nuevas notificaciones aparecerán aquí'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100/80">
              {filteredNotifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.tipo] ||
                                  NOTIFICATION_TYPES.sistema
                const Icon = typeConfig.icon

                return (
                  <div
                    key={notification.id}
                    className={`
                      p-5 hover:bg-gray-50/80 active:bg-gray-100/80
                      cursor-pointer transition-all duration-200
                      border-l-4 transform hover:translate-x-1
                      ${!notification.leida
                        ? 'border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent'
                        : 'border-l-transparent'
                      }
                    `}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icono */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-2xl
                        ${typeConfig.bgColor} border ${typeConfig.borderColor}
                        flex items-center justify-center
                        transform transition-transform duration-200
                        hover:scale-110
                      `}>
                        <Icon className={`w-6 h-6 ${typeConfig.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-gray-900 leading-tight mb-1">
                              {notification.titulo || typeConfig.title}
                            </h4>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                              {notification.mensaje || notification.body}
                            </p>
                          </div>

                          {/* Estado de lectura */}
                          {!notification.leida && (
                            <div className="flex-shrink-0 ml-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">
                              {new Date(notification.creada || notification.fecha).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${typeConfig.color.replace('text-', 'from-').replace('-600', '-400')} ${typeConfig.color.replace('text-', 'to-').replace('-600', '-500')}`} />
                              {typeConfig.title}
                            </span>
                          </div>

                          {notification.leida && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>

                        {/* URL si existe */}
                        {notification.url && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <a
                              href={notification.url}
                              onClick={(e) => e.stopPropagation()}
                              className="
                                inline-flex items-center gap-1.5
                                px-3 py-1.5 rounded-lg text-xs font-medium
                                bg-blue-50 text-blue-700 border border-blue-200
                                hover:bg-blue-100 hover:border-blue-300
                                transition-all duration-200
                                transform hover:scale-105 active:scale-95
                              "
                            >
                              <span>Ver detalles</span>
                              <Check className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {notifications.length >= 20 && filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-100/80">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl
                  bg-white border-2 border-gray-200
                  text-gray-700 font-semibold text-sm
                  hover:bg-gray-50 hover:border-gray-300
                  active:scale-95 disabled:opacity-50
                  transition-all duration-200
                  transform hover:scale-[1.01]
                "
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <span>Cargar más notificaciones</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
