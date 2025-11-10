import { useState } from 'react'
import { Bell, BellRing, X, Check, AlertCircle } from 'lucide-react'

export default function NotificationPermissionPrompt({ onResponse, onClose }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnable = async () => {
    setIsLoading(true)

    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()

        if (permission === 'granted') {
          // Crear una notificación de prueba
          const notification = new Notification('¡Notificaciones activadas!', {
            body: 'Ahora recibirás alertas de compras y pagos.',
            icon: '/assets/icons/admin-icon.svg',
            badge: '/assets/icons/admin-badge.svg',
            tag: 'permission-test'
          })

          // Auto-cerrar después de 3 segundos
          setTimeout(() => {
            notification.close()
          }, 3000)

          onResponse(true)
        } else {
          onResponse(false)
        }
      } else {
        // Browser no soporta notificaciones
        onResponse(false)
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error)
      onResponse(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeny = () => {
    onResponse(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative max-w-md w-full
        bg-gradient-to-br from-slate-900/95 to-slate-800/95
        backdrop-blur-xl rounded-3xl border border-white/10
        shadow-2xl overflow-hidden
        animate-in zoom-in-50 duration-300
      ">
        {/* Header con gradiente */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20" />
          <div className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <BellRing className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Activar Notificaciones
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Recibe alertas administrativas
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="
                  w-8 h-8 rounded-xl
                  hover:bg-white/10 active:bg-white/20
                  flex items-center justify-center
                  transition-all duration-200
                  text-slate-400 hover:text-white
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {/* Beneficios */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    Alertas de Compras
                  </h4>
                  <p className="text-sm text-slate-400">
                    Recibe notificaciones instantáneas cuando los clientes realicen compras.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    Confirmaciones de Pago
                  </h4>
                  <p className="text-sm text-slate-400">
                    Sé notificado cuando se procesen pagos exitosamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-1">
                    Monitoreo en Tiempo Real
                  </h4>
                  <p className="text-sm text-slate-400">
                    Mantente al tanto de la actividad de tu negocio sin recargar la página.
                  </p>
                </div>
              </div>
            </div>

            {/* Advertencia */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-200 font-medium mb-1">
                    Permisos del Navegador
                  </p>
                  <p className="text-sm text-amber-300/80">
                    Necesitamos tu permiso para mostrar notificaciones. Puedes cambiar esto en la configuración del navegador.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDeny}
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-slate-700/60 hover:bg-slate-600/80
                border border-white/10 hover:border-white/20
                text-slate-300 hover:text-white font-medium
                transition-all duration-200
                active:scale-95
              "
            >
              Ahora No
            </button>

            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-600 hover:to-cyan-600
                text-white font-semibold
                transition-all duration-200
                active:scale-95 disabled:opacity-50
                shadow-lg shadow-blue-500/30
                flex items-center justify-center gap-2
              "
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Activando...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Activar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
