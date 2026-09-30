import axios from 'axios'

// CSRF token for unsafe methods (POST/PUT/PATCH/DELETE). Set by the auth
// store from /auth/login and /auth/me responses; Frappe validates the
// X-Frappe-CSRF-Token header against the session (frappe/auth.py).
let csrfToken = ''

export function setCsrfToken(token) {
  csrfToken = token || ''
}

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const method = (config.method || '').toLowerCase()
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers['X-Frappe-CSRF-Token'] = csrfToken
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.message) {
      response.data = response.data.message
    }
    return response
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url || ''
    // Don't redirect for the session-check/login calls themselves, and don't
    // redirect when already on the login page — that caused an infinite
    // reload loop on every fresh page load when no session exists yet.
    const isAuthCall = url.includes('/auth/me') || url.includes('/auth/login')
    const onLoginPage = window.location.pathname.startsWith('/login')
    if ((status === 401 || status === 403) && !isAuthCall && !onLoginPage) {
      window.location.href = '/login/'
    }
    return Promise.reject(error)
  }
)

export default api
