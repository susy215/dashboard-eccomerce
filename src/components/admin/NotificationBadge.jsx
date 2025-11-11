import { Bell } from 'lucide-react'
import { useAdminNotifications } from '../../hooks/useAdminNotifications'

export default function NotificationBadge({ token, onClick }) {
  const { unreadCount } = useAdminNotifications(token)

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}
