import { useState, useEffect } from 'react'
import { X, ShoppingCart, CreditCard, AlertCircle, CheckCircle, Bell, Package, DollarSign } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

const NOTIFICATION_TYPES = {
  nueva_compra: {
    icon: ShoppingCart,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-slate-900/95 to-slate-800/95',
    borderColor: 'border-green-500/20',
    title: 'Nueva Compra',
    sound: 'success'
  },
  nuevo_pago: {
    icon: CreditCard,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-slate-900/95 to-slate-800/95',
    borderColor: 'border-blue-500/20',
    title: 'Nuevo Pago Confirmado',
    sound: 'success'
  }
}

export default function NotificationToast({ token }) {
  const { notifications, markAsRead } = useAdminNotifications(token)
  const [visibleNotifications, setVisibleNotifications] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Agregar nuevas notificaciones a las visibles
    const newNotifications = notifications.filter(n =>
      !n.leida && !visibleNotifications.find(vn => vn.id === n.id)
    )

    if (newNotifications.length > 0) {
      setIsAnimating(true)

      // Agregar con animación escalonada
      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          setVisibleNotifications(prev => [...prev, notification])

          // Auto-remover después de 6 segundos con animación de salida
          setTimeout(() => {
            removeNotification(notification.id, true)
          }, 6000)
        }, index * 200) // Animación escalonada
      })

      setTimeout(() => setIsAnimating(false), newNotifications.length * 200 + 100)
    }
  }, [notifications])

  const removeNotification = (id, autoRemove = false) => {
    if (autoRemove) {
      // Animación de salida suave
      const element = document.getElementById(`notification-${id}`)
      if (element) {
        element.style.animation = 'slideOutRight 0.3s ease-in-out forwards'
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(n => n.id !== id))
        }, 300)
      }
    } else {
      setVisibleNotifications(prev => prev.filter(n => n.id !== id))
    }
  }

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id)
    removeNotification(notification.id)

    // Redirigir según el tipo con animación suave
    if (notification.url) {
      // Pequeño delay para la animación
      setTimeout(() => {
        window.location.href = notification.url
      }, 150)
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none">
      {visibleNotifications.slice(0, 4).map((notification, index) => {
        const typeConfig = NOTIFICATION_TYPES[notification.tipo] ||
                          NOTIFICATION_TYPES.sistema
        const Icon = typeConfig.icon

        return (
          <div
            key={notification.id}
            id={`notification-${notification.id}`}
            className={`
              relative group pointer-events-auto
              bg-gradient-to-br ${typeConfig.bgColor} backdrop-blur-xl
              rounded-2xl shadow-2xl border ${typeConfig.borderColor}
              overflow-hidden cursor-pointer
              transform transition-all duration-300 ease-out
              hover:scale-[1.02] hover:shadow-blue-500/20
              animate-in slide-in-from-right-2 fade-in
            `}
            style={{
              animationDelay: `${index * 100}ms`,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
            onClick={() => handleNotificationClick(notification)}
          >
            {/* Gradiente superior sutil */}
            <div className={`h-1 bg-gradient-to-r ${typeConfig.color}`} />

            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Icono con gradiente */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-2xl
                  bg-gradient-to-br ${typeConfig.color}
                  flex items-center justify-center shadow-lg
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-slate-200 mb-1 leading-tight">
                    {typeConfig.title}
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3 line-clamp-2">
                    {notification.mensaje || notification.body}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(notification.creada || notification.fecha).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {/* Indicador de tipo */}
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${typeConfig.color}`} />
                      <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                        {notification.tipo?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeNotification(notification.id)
                  }}
                  className="
                    flex-shrink-0 w-8 h-8 rounded-xl
                    hover:bg-slate-700/60 active:bg-slate-600/80
                    flex items-center justify-center
                    transition-all duration-200
                    opacity-0 group-hover:opacity-100
                    transform translate-x-2 group-hover:translate-x-0
                  "
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
                </button>
              </div>

              {/* Barra de progreso para auto-cierre */}
              <div className="mt-4 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${typeConfig.color} rounded-full transition-all duration-75 ease-linear`}
                  style={{
                    animation: 'progressBar 6s linear forwards'
                  }}
                />
              </div>
            </div>

            {/* Efecto hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        )
      })}

      {/* Indicador de notificaciones adicionales */}
      {visibleNotifications.length > 4 && (
        <div className="bg-slate-900/90 backdrop-blur-xl text-slate-200 rounded-2xl p-4 shadow-2xl border border-white/10 text-center">
          <Bell className="w-5 h-5 mx-auto mb-2 opacity-70 text-blue-400" />
          <p className="text-sm font-medium">
            +{visibleNotifications.length - 4} notificaciones más
          </p>
        </div>
      )}
    </div>
  )
}
