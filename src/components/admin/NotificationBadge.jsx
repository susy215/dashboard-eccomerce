import { Bell } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

export default function NotificationBadge({ token, onClick }) {
  const { unreadCount } = useAdminNotifications(token)

  return (
    <button
      onClick={onClick}
      className="relative p-3 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:bg-slate-800/80 hover:border-white/20 shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"
    >
      <Bell className="w-5 h-5 text-slate-300 hover:text-blue-400 transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg border-2 border-slate-900">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
