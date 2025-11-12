import { apiFetch } from './client'

// Login usando API REST + creación de sesión Django para WebSocket
export async function login({ username, password }) {
  try {
    // Paso 1: Login via API REST (obtiene token JWT)
    const tokenResponse = await fetch('https://smartsales365.duckdns.org/api/usuarios/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token login failed:', tokenResponse.status, errorText)
      throw new Error('Credenciales inválidas')
    }

    const tokenData = await tokenResponse.json()

    // Guardar token y username
    try {
      localStorage.setItem('token', tokenData.token)
      localStorage.setItem('auth_token', tokenData.token)
      localStorage.setItem('username', username)
    } catch {}

    // Paso 2: Crear sesión Django para WebSocket (usando el token)
    try {
      await fetch('https://smartsales365.duckdns.org/api/auth/session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${tokenData.token}`
        },
        credentials: 'include'
      })
    } catch (sessionErr) {
      console.warn('No se pudo crear sesión Django, pero login fue exitoso:', sessionErr)
      // No fallar si la sesión no se crea, el login básico funcionó
    }

    return { success: true, username, token: tokenData.token }
  } catch (err) {
    console.error('Login error:', err)
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


