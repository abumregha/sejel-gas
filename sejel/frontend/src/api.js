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
    // NOTE: we deliberately do NOT redirect to /login/ on 401/403 anymore.
    // That turned every expired-session or permission failure into a full-screen
    // login page that looked like the app "crashed" (client report 2026-10-01:
    // deleting a station dumped the user on the login screen). Instead the SPA
    // stays put, views show an Arabic message via friendlyError() (which maps
    // AuthenticationError/PermissionError), and the auth store decides what
    // to do when /auth/me fails.
    const isAuthCall = url.includes('/auth/me') || url.includes('/auth/login')
    if ((status === 401 || status === 403) && !isAuthCall) {
      error.sessionExpired = status === 401
        || String(error.response?.data?.exc_type || '') === 'AuthenticationError'
    }
    return Promise.reject(error)
  }
)

export default api
