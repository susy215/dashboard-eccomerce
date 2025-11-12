import { useState, useEffect } from 'react'
import {
  Bell, BellOff, Settings, Check, X, Smartphone, Monitor,
  Wifi, WifiOff, Zap, Shield, Clock, AlertTriangle,
  CheckCircle, XCircle, Info, Sparkles
} from 'lucide-react'
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
  const [testNotificationSent, setTestNotificationSent] = useState(false)

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
        setSuccess('✅ Permisos de navegador concedidos correctamente')
      } else {
        setError('❌ Permisos denegados. Ve a configuración del navegador para habilitarlos.')
      }
    } catch (error) {
      setError('Error solicitando permisos: ' + error.message)
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
        setSuccess('✅ Te has desuscrito de notificaciones push')
      } else {
        await subscribeToPushNotifications(token)
        setPushSubscribed(true)
        setSuccess('✅ ¡Suscrito! Recibirás notificaciones push')
      }
    } catch (error) {
      setError('Error en suscripción: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendTestNotification = async () => {
    if (browserPermission !== 'granted') {
      setError('Primero concede permisos del navegador')
      return
    }

    try {
      // Enviar notificación de prueba del navegador
      const notification = new Notification('🔔 Notificación de Prueba', {
        body: '¡Las notificaciones funcionan correctamente!',
        icon: '/admin-icon.png',
        badge: '/admin-icon.png',
        tag: 'test-notification',
        requireInteraction: false,
        silent: false
      })

      setTestNotificationSent(true)
      setSuccess('✅ Notificación de prueba enviada')

      // Auto-cerrar después de 4 segundos
      setTimeout(() => {
        notification.close()
        setTestNotificationSent(false)
      }, 4000)
    } catch (error) {
      setError('Error enviando notificación de prueba: ' + error.message)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-16 z-50 group relative p-3 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/20 hover:bg-slate-800/90 hover:border-purple-400/50 shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
        title="Configurar Notificaciones Push"
      >
        <Settings className="w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-all duration-300 group-hover:rotate-90" />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Tooltip */}
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          Configurar notificaciones
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
        </div>
      </button>
    )
  }

  return (
    <>
      {/* Overlay con animación */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal principal */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/20 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Centro de Notificaciones</h2>
                  <p className="text-purple-100 text-sm">Configura tus alertas inteligentes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 transition-colors group"
              >
                <X className="w-5 h-5 text-white group-hover:text-purple-200" />
              </button>
            </div>

            {/* Elementos decorativos */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-400/10 rounded-full blur-lg" />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">

            {/* Estado General */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${pushSupported ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-white font-medium">
                  {pushSupported ? '✅ Sistema Operativo' : '❌ Navegador Limitado'}
                </span>
              </div>
              <p className="text-slate-300 text-sm">
                {pushSupported
                  ? 'Tu navegador soporta todas las funciones de notificaciones push'
                  : 'Actualiza tu navegador para obtener todas las funciones'
                }
              </p>
            </div>

            {pushSupported && (
              <>
                {/* Permisos del Navegador */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold">Permisos del Navegador</h3>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {browserPermission === 'granted' ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : browserPermission === 'denied' ? (
                          <XCircle className="w-6 h-6 text-red-400" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {browserPermission === 'granted' ? 'Permisos Concedidos' :
                             browserPermission === 'denied' ? 'Permisos Bloqueados' : 'Permisos Pendientes'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Necesario para mostrar notificaciones emergentes
                          </p>
                        </div>
                      </div>

                      {browserPermission !== 'granted' && (
                        <button
                          onClick={handleBrowserPermission}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loading && <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />}
                          <span>{loading ? 'Solicitando...' : 'Permitir'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suscripción Push */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-400" />
                    <h3 className="text-white font-semibold">Notificaciones Push</h3>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {pushSubscribed ? (
                          <div className="relative">
                            <Bell className="w-6 h-6 text-green-400" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                          </div>
                        ) : (
                          <BellOff className="w-6 h-6 text-slate-400" />
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {pushSubscribed ? 'Push Activado' : 'Push Desactivado'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Recibe alertas incluso con el navegador cerrado
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handlePushSubscription}
                        disabled={loading || browserPermission !== 'granted'}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 ${
                          pushSubscribed
                            ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-slate-600'
                            : 'bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white'
                        }`}
                      >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent" />}
                        <span>
                          {loading ? 'Procesando...' : pushSubscribed ? 'Desactivar' : 'Activar'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test de Notificaciones */}
                {browserPermission === 'granted' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-white font-semibold">Probar Notificaciones</h3>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="w-6 h-6 text-cyan-400" />
                          <div>
                            <p className="text-white font-medium">Notificación de Prueba</p>
                            <p className="text-slate-400 text-sm">
                              Verifica que todo funcione correctamente
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={sendTestNotification}
                          disabled={testNotificationSent}
                          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {testNotificationSent ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Enviada</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>Probar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Mensajes de estado */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium">Error</p>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-200 font-medium">¡Éxito!</p>
                  <p className="text-green-300 text-sm mt-1">{success}</p>
                </div>
              </div>
            )}

            {/* Información y consejos */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-200 font-medium mb-2">💡 Consejos para un mejor funcionamiento:</h4>
                  <ul className="text-blue-100 text-sm space-y-1">
                    <li>• <strong>Navegador abierto:</strong> Notificaciones emergentes instantáneas</li>
                    <li>• <strong>Navegador cerrado:</strong> Notificaciones del sistema operativo</li>
                    <li>• <strong>Móvil:</strong> Funciona en Android/iOS como PWA</li>
                    <li>• <strong>Configuración:</strong> Asegúrate de no tener bloqueadores de pop-ups</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estado del sistema */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">Estado del sistema</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Conectado</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">Última verificación</span>
                </div>
                <span className="text-slate-400">
                  {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
