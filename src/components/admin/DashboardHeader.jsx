import NotificationBadge from './NotificationBadge'
import LogoutButton from './LogoutButton'

export default function DashboardHeader({ token, onNotificationsOpen, dias, setDias, limit, setLimit }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {/* Título y descripción */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
              SmartSales365
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
              Dashboard • {dias} días
            </p>
          </div>

          {/* Controles y acciones */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            {/* Selectores - responsive */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Selector de período */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hidden xs:inline">Período:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-0.5 sm:p-1">
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDias(d)}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all duration-200 ${
                        dias === d
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de límite */}
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Top:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm px-2 sm:px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-w-[50px] sm:min-w-[60px]"
                >
                  {[5, 10, 15].map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-1 sm:gap-2">
              <LogoutButton />
              <NotificationBadge
                token={token}
                onClick={onNotificationsOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
