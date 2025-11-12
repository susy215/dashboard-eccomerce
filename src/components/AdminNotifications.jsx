import { Bell } from 'lucide-react';
import { useAdminNotifications } from '../hooks/useAdminNotifications';

export default function AdminNotifications({ onOpenPanel }) {
  const { isConnected, notifications, connectionStatus } = useAdminNotifications();

  const hasNotifications = notifications.length > 0;

  return (
    <button
      onClick={onOpenPanel}
      className="relative p-2 rounded-lg bg-slate-900/70 backdrop-blur-md border border-white/10 hover:bg-slate-800/80 hover:border-blue-400/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105 group"
      title={`Notificaciones • ${connectionStatus}`}
    >
      {/* Icono principal */}
      <Bell className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />

      {/* Indicador de conexión */}
      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
        isConnected ? 'bg-green-400' : 'bg-red-400'
      }`} />

      {/* Tooltip al hover */}
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {hasNotifications ? `${notifications.length} notificaciones` : 'Sin notificaciones'}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
      </div>
    </button>
  );
}
