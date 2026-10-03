import { defineStore } from 'pinia'
import api, { setCsrfToken } from '../api'

// Module-level cache so the boot-time session check runs once per page load
// and any router navigation can await it. Fixes the race where the router's
// initial navigation evaluated the auth guard before /auth/me/ had resolved.
let restorePromise = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
  }),
  getters: {
    isLoggedIn: (s) => !!s.user,
    role: (s) => s.user?.role || '',
    stationId: (s) => s.user?.station_id || null,
    isAdmin: (s) => s.user?.is_staff || s.user?.role === 'admin',
    isOwner: (s) => s.user?.role === 'admin',
    // Closing the day creates the day's Reconciliation, which only Sejel
    // Manager / Finance may create. Offering the button to a supervisor ended
    // in a bare «ليست لديك صلاحية لتنفيذ هذا الإجراء» after they had already
    // confirmed the dialog — so the UI has to know who can do it.
    canCloseDay: (s) =>
      !!s.user && (s.user.is_staff || ['admin', 'manager', 'finance'].includes(s.user.role)),
  },
  actions: {
    // Awaitable session restore — safe to call from anywhere; runs once.
    restore() {
      if (!restorePromise) {
        restorePromise = this.fetchUser().catch(() => {})
      }
      return restorePromise
    },
    async login(username, password) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login/', { username, password })
        const msg = data.message || data
        this.user = msg.user || msg
        setCsrfToken(msg.csrf_token)
        return true
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },
    async fetchUser() {
      try {
        const { data } = await api.get('/auth/me/')
        const msg = data.message || data
        this.user = msg.user || msg
        if (msg.csrf_token) setCsrfToken(msg.csrf_token)
      } catch {
        // No valid session — just clear state. Do NOT redirect here: on the
        // login page itself that caused an infinite reload loop. Protected
        // pages are sent to /login/ by the router guard instead.
        this.user = null
      }
    },
    async logout() {
      // End the session server-side first. Clearing the store alone left the
      // `sid` cookie valid, so Back / a cached tab restored an authenticated
      // session with no credential (QA-1).
      try {
        await api.post('/auth/logout/')
      } catch {
        // Already invalid or the network is down — clear local state anyway.
      }
      this.user = null
      setCsrfToken('')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login/'
      }
    },
  },
})
