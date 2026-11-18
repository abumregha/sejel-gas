import { defineStore } from 'pinia'
import api from '../api'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'sejel-current-station'

export const useStationStore = defineStore('station', {
  state: () => ({
    stations: [],
    currentStation: localStorage.getItem(STORAGE_KEY) || '',
    loaded: false,
    loading: false,
  }),
  getters: {
    currentStationName(state) {
      const s = state.stations.find(x => x.name === state.currentStation)
      return s ? (s.station_name || s.name) : ''
    },
    current(state) {
      return state.stations.find(x => x.name === state.currentStation) || null
    },
    isBound() {
      const auth = useAuthStore()
      return !!auth.stationId
    },
    canSwitch(state) {
      const auth = useAuthStore()
      if (auth.stationId) return false
      return (auth.isAdmin || ['manager', 'owner', 'finance'].includes(auth.role)) && state.stations.length > 1
    },
    hasSelection(state) {
      return !!state.currentStation
    },
  },
  actions: {
    async loadStations() {
      if (this.loading) return
      this.loading = true
      try {
        const { data } = await api.get('/stations/')
        this.stations = data.results || data || []
      } catch {
        this.stations = []
      } finally {
        this.loading = false
        this.loaded = true
      }
      this.ensureSelection()
    },
    ensureSelection() {
      const auth = useAuthStore()
      // Bound users are locked to their station
      if (auth.stationId) {
        this.setCurrent(auth.stationId, false)
        return
      }
      // If persisted selection is not in available stations, clear it
      if (this.currentStation && this.stations.length && !this.stations.find(s => s.name === this.currentStation)) {
        this.currentStation = ''
        localStorage.removeItem(STORAGE_KEY)
      }
      // Auto-select if exactly one station available
      if (!this.currentStation && this.stations.length === 1) {
        this.setCurrent(this.stations[0].name, true)
      }
    },
    setCurrent(id, persist = true) {
      this.currentStation = id || ''
      if (persist) {
        if (id) localStorage.setItem(STORAGE_KEY, id)
        else localStorage.removeItem(STORAGE_KEY)
      }
    },
    async init() {
      const auth = useAuthStore()
      if (auth.stationId) {
        this.currentStation = auth.stationId
        localStorage.setItem(STORAGE_KEY, auth.stationId)
      }
      if (!this.loaded) await this.loadStations()
      else this.ensureSelection()
    },
    clear() {
      this.currentStation = ''
      this.stations = []
      this.loaded = false
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})
