import NotificationBadge from './NotificationBadge'
import LogoutButton from './LogoutButton'

export default function DashboardHeader({ token, onNotificationsOpen, dias, setDias, limit, setLimit }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Título y descripción */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              SmartSales365
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Dashboard Analítico • Vista de {dias} días
            </p>
          </div>

          {/* Controles y acciones */}
          <div className="flex items-center gap-4">
            {/* Selector de período */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Período:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-1">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDias(d)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Top:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              >
                {[5, 10, 15].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
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
