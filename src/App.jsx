import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

function RequireAuth({ children }) {
  const location = useLocation()

  // Verificar si hay sesión activa (cookies de Django)
  const hasSession = document.cookie.includes('sessionid=')
  const hasUsername = localStorage.getItem('username')

  if (!hasSession || !hasUsername) {
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
