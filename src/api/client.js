const API_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000'

function getToken() {
  try {
    return localStorage.getItem('token') || localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

export async function apiFetch(path, options = {}) {
  const base = `${API_URL}/api`
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(options.headers || {})
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Token ${token}`)

  const res = await fetch(url, { ...options, headers, credentials: 'omit' })
  if (res.status === 401) {
    try { localStorage.removeItem('token'); localStorage.removeItem('auth_token') } catch {}
    try {
      const here = window.location?.pathname + window.location?.search
      sessionStorage.setItem('post_login_redirect', here)
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login')
    } catch {}
  }
  if (!res.ok) {
    let detail = ''
    try { detail = await res.text() } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${detail}`)
  }
  const text = await res.text()
  try { return text ? JSON.parse(text) : {} } catch { return {} }
}

export async function getJson(path) {
  return apiFetch(path)
}

export async function postJson(path, data, extra = {}) {
  const body = extra.body ?? JSON.stringify(data)
  return apiFetch(path, { method: 'POST', body, headers: extra.headers })
}


