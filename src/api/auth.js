import { apiFetch } from './client'

// Django DRF token endpoint expects username & password, returns { token }
export async function login({ username, password }) {
  // Limpia tokens previos
  try { localStorage.removeItem('token'); localStorage.removeItem('auth_token') } catch {}
  // Intento JSON
  try {
    const data = await apiFetch('/usuarios/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (data?.token) {
      try { localStorage.setItem('token', data.token); localStorage.setItem('auth_token', data.token) } catch {}
    }
    return data
  } catch (err) {
    // Fallback por si el backend exige form-urlencoded
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    const data = await apiFetch('/usuarios/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: form,
    })
    if (data?.token) {
      try { localStorage.setItem('token', data.token); localStorage.setItem('auth_token', data.token) } catch {}
    }
    return data
  }
}

export async function me() {
  return apiFetch('/usuarios/me/')
}

export function logout() {
  try { localStorage.removeItem('token'); localStorage.removeItem('auth_token') } catch {}
}


