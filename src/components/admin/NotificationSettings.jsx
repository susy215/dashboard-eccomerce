import { useState, useEffect } from 'react'
import { Bell, BellOff, Settings, Check, X, Smartphone, Monitor } from 'lucide-react'
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPush,
  isPushSupported
} from '../../services/pushNotifications'

export default function NotificationSettings({ token, onClose }) {
  const [isOpen, setIsOpen] = useState(false)
  const [browserPermission, setBrowserPermission] = useState('default')
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const pushSupported = isPushSupported()

  useEffect(() => {
    if (isOpen) {
      checkStatus()
    }
  }, [isOpen])

  const checkStatus = async () => {
    try {
      setBrowserPermission(Notification.permission)
      const subscribed = await isSubscribedToPush()
      setPushSubscribed(subscribed)
    } catch (error) {
      console.error('Error verificando estado:', error)
    }
  }

  const handleBrowserPermission = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const granted = await requestNotificationPermission()
      setBrowserPermission(granted ? 'granted' : 'denied')

      if (granted) {
        setSuccess('✅ Permisos de navegador concedidos')
      } else {
        setError('❌ Permisos denegados. Habilítalos en configuración del navegador.')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePushSubscription = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (pushSubscribed) {
        await unsubscribeFromPushNotifications(token)
        setPushSubscribed(false)
        setSuccess('✅ Desuscrito de notificaciones push')
      } else {
        await subscribeToPushNotifications(token)
        setPushSubscribed(true)
        setSuccess('✅ Suscrito a notificaciones push exitosamente')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-16 z-50 p-3 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:bg-slate-800/80 hover:border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
        title="Configuración de Notificaciones"
      >
        <Settings className="w-5 h-5 text-slate-300 hover:text-purple-400 transition-colors" />
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notificaciones Push
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Soporte */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl">
              <div className={`w-3 h-3 rounded-full ${pushSupported ? 'bg-green-400' : 'bg-red-400'}`} />
              <div>
                <p className="text-white font-medium">
                  {pushSupported ? '✅ Soporte Completo' : '❌ No Soportado'}
                </p>
                <p className="text-slate-400 text-sm">
                  {pushSupported
                    ? 'Tu navegador soporta notificaciones push'
                    : 'Actualiza tu navegador para recibir notificaciones'
                  }
                </p>
              </div>
            </div>

            {pushSupported && (
              <>
                {/* Permisos del Navegador */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Permisos del Navegador
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {browserPermission === 'granted' ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : browserPermission === 'denied' ? (
                        <X className="w-5 h-5 text-red-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-yellow-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {browserPermission === 'granted' ? 'Concedidos' :
                           browserPermission === 'denied' ? 'Bloqueados' : 'Pendiente'}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Para mostrar notificaciones en el navegador
                        </p>
                      </div>
                    </div>

                    {browserPermission !== 'granted' && (
                      <button
                        onClick={handleBrowserPermission}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                      >
                        {loading ? '...' : 'Permitir'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suscripción Push */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Notificaciones Push
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      {pushSubscribed ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {pushSubscribed ? 'Suscrito' : 'No Suscrito'}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Recibe notificaciones incluso con el navegador cerrado
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handlePushSubscription}
                      disabled={loading || browserPermission !== 'granted'}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        pushSubscribed
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white'
                      }`}
                    >
                      {loading ? '...' : pushSubscribed ? 'Desuscribir' : 'Suscribir'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mensajes */}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-900/50 border border-green-500/50 rounded-xl">
                <p className="text-green-200 text-sm">{success}</p>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
              <h4 className="text-blue-200 font-medium mb-2">💡 Cómo Funciona:</h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• <strong>Navegador:</strong> Notificaciones cuando está abierto</li>
                <li>• <strong>Push:</strong> Notificaciones del SO (cerrado/minimizado)</li>
                <li>• <strong>Móvil:</strong> Funciona en Android/iOS con PWA</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
