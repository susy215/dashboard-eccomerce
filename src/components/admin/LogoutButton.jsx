import { useState } from 'react'
import { LogOut, Power, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (showConfirm) {
      setIsLoggingOut(true)

      try {
        // Limpiar tokens
        localStorage.removeItem('token')
        localStorage.removeItem('auth_token')
        sessionStorage.clear()

        // Pequeño delay para mostrar el loading
        setTimeout(() => {
          // Redirigir al home
          navigate('/', { replace: true })
        }, 800)
      } catch (error) {
        console.error('Error durante logout:', error)
        setIsLoggingOut(false)
        setShowConfirm(false)
      }
    } else {
      setShowConfirm(true)
    }
  }

  const cancelLogout = () => {
    setShowConfirm(false)
  }

  if (isLoggingOut) {
    return (
      <button
        disabled
        className="relative p-3 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl cursor-not-allowed"
        title="Cerrando sesión..."
      >
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-400 border-t-transparent" />
      </button>
    )
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={cancelLogout}
        />

        {/* Modal de confirmación */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/20 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-300">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Cerrar sesión?</h3>
            <p className="text-slate-300 text-sm">
              Se cerrará tu sesión actual y volverás a la pantalla de inicio de sesión.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={cancelLogout}
              className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="group relative p-2 rounded-lg bg-slate-900/70 backdrop-blur-md border border-white/10 hover:bg-red-900/70 hover:border-red-400/30 shadow-lg hover:shadow-red-500/20 transition-all duration-300 hover:scale-105"
      title="Cerrar sesión"
    >
      {/* Icono principal */}
      <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors duration-300" />

      {/* Tooltip */}
      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        Cerrar sesión
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900"></div>
      </div>
    </button>
  )
}
