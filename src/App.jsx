import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

function RequireAuth({ children }) {
  const location = useLocation()

  // Verificar si hay token válido (sistema actual funciona con tokens DRF)
  let token = null
  try { token = localStorage.getItem('token') || localStorage.getItem('auth_token') } catch {}
  const hasUsername = localStorage.getItem('username')

  if (!token || !hasUsername) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
