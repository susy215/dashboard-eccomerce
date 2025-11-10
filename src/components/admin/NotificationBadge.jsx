import { Bell, BellRing } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

export default function NotificationBadge({ token, onClick, className = '' }) {
  const { unreadCount, isConnected } = useAdminNotifications(token)

  const hasNotifications = unreadCount > 0

  return (
    <button
      onClick={onClick}
      className={`
        relative group p-3 rounded-2xl
        bg-white/80 backdrop-blur-sm border border-white/20
        hover:bg-white hover:border-white/40
        active:scale-95
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        transform hover:scale-105
        ${className}
      `}
      title={hasNotifications ? `${unreadCount} notificaciones pendientes` : 'Notificaciones'}
    >
      {/* Icono principal */}
      <div className="relative">
        {hasNotifications ? (
          <BellRing className="w-6 h-6 text-blue-600 animate-pulse" />
        ) : (
          <Bell className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
        )}

        {/* Indicador de conexión */}
        <div className={`
          absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white
          ${isConnected ? 'bg-green-400 shadow-green-200' : 'bg-gray-300'}
          shadow-lg
        `} />
      </div>

      {/* Badge de conteo */}
      {hasNotifications && (
        <div className="
          absolute -top-1 -right-1
          bg-gradient-to-r from-red-500 to-pink-500
          text-white text-xs font-bold
          rounded-full min-w-[22px] h-[22px]
          flex items-center justify-center
          shadow-lg border-2 border-white
          animate-in zoom-in-50 duration-300
          transform scale-100 hover:scale-110 transition-transform
        ">
          <span className="px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>

          {/* Pulsación animada */}
          <div className="
            absolute inset-0 rounded-full
            bg-gradient-to-r from-red-500 to-pink-500
            animate-ping opacity-20
          " />
        </div>
      )}

      {/* Tooltip */}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
        bg-gray-900 text-white text-sm px-3 py-2 rounded-xl
        opacity-0 group-hover:opacity-100 pointer-events-none
        transition-all duration-200 whitespace-nowrap
        shadow-xl border border-gray-700/50
        before:content-[''] before:absolute before:top-full before:left-1/2
        before:transform before:-translate-x-1/2 before:border-8
        before:border-transparent before:border-t-gray-900
        z-50
      ">
        {hasNotifications ? (
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-red-400" />
            <span>{unreadCount} notificaciones pendientes</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-400" />
            <span>Sin notificaciones nuevas</span>
          </div>
        )}

        {/* Estado de conexión */}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>

      {/* Efecto hover sutil */}
      <div className="
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-blue-500/5 to-purple-500/5
        opacity-0 group-hover:opacity-100
        transition-opacity duration-300 pointer-events-none
      " />
    </button>
  )
}
