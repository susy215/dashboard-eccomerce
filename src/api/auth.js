import { apiFetch } from './client'

// Login usando API REST (Django maneja sesiones automáticamente)
export async function login({ username, password }) {
  try {
    console.log('🔐 Intentando login con:', username)

    const response = await fetch('https://smartsales365.duckdns.org/api/usuarios/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include' // Django creará sesión automáticamente
    })

    console.log('📡 Respuesta login:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Login failed:', response.status, errorText)
      throw new Error('Credenciales inválidas')
    }

    const data = await response.json()
    console.log('✅ Login exitoso, token recibido')

    // Guardar token y username
    try {
      localStorage.setItem('token', data.token)
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('username', username)

      console.log('💾 Datos guardados en localStorage')
      console.log('🍪 Cookies actuales:', document.cookie)
    } catch (storageErr) {
      console.error('❌ Error guardando en localStorage:', storageErr)
    }

    return { success: true, username, token: data.token }
  } catch (err) {
    console.error('❌ Login error:', err)
    throw new Error('Credenciales inválidas')
  }
}

// Verificar si el usuario está autenticado (usando API)
export async function checkAuth() {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (!token) {
      return { authenticated: false }
    }

    const response = await fetch('https://smartsales365.duckdns.org/api/usuarios/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'include'
    })

    if (response.ok) {
      const userData = await response.json()
      return {
        authenticated: true,
        username: userData.username || localStorage.getItem('username')
      }
    }
    return { authenticated: false }
  } catch (err) {
    // Si falla, verificar si al menos tenemos un token
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    return { authenticated: !!token, username: localStorage.getItem('username') }
  }
}

export async function me() {
  return apiFetch('/usuarios/me/')
}

// Obtener CSRF token de las cookies
function getCsrfToken() {
  const name = 'csrftoken'
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

export async function logout() {
  try {
    // Logout via API (limpia tokens y sesión)
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (token) {
      await fetch('https://smartsales365.duckdns.org/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
    }
  } catch (err) {
    console.warn('Error en logout API:', err)
  }

  // Limpiar storage local
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
  } catch {}

  // Limpiar cookies de sesión
  document.cookie = 'sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}


