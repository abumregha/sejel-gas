import { defineStore } from 'pinia'
import api from '../api'

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
  },
  actions: {
    async login(username, password) {
      this.loading = true
      try {
        const { data } = await api.post('/auth/login/', { username, password })
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        this.user = data.user
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
        this.user = data
      } catch {
        this.logout()
      }
    },
    logout() {
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})
