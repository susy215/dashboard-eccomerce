import { apiFetch } from './client'

// Login usando sistema de sesiones de Django (crea cookies de sesión para WebSocket)
export async function login({ username, password }) {
  // Limpia datos previos
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
  } catch {}

  // Primero obtener página de login para conseguir CSRF token
  try {
    await apiFetch('/admin/login/', { method: 'GET' })
  } catch (err) {
    console.warn('No se pudo obtener página de login:', err)
  }

  // Ahora hacer login con CSRF token
  const csrfToken = getCsrfToken()
  if (!csrfToken) {
    throw new Error('No se pudo obtener CSRF token')
  }

  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  form.append('csrfmiddlewaretoken', csrfToken)
  form.append('next', '/admin/')

  const data = await apiFetch('/admin/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRFToken': csrfToken,
    },
    body: form,
  })

  // En Django, un login exitoso generalmente redirige
  // Si no hay error, asumimos que fue exitoso
  try {
    localStorage.setItem('username', username)
  } catch {}

  return { success: true, username }
}

// Verificar si el usuario está autenticado (usando cookies de sesión)
export async function checkAuth() {
  try {
    const response = await apiFetch('/admin/', { method: 'GET' })
    return { authenticated: true, username: localStorage.getItem('username') }
  } catch (err) {
    // Si falla, no está autenticado
    return { authenticated: false }
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
    // Logout via API (limpia sesión)
    await apiFetch('/admin/logout/')
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


