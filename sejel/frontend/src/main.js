import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import api from './api'
import { installTelemetry } from './telemetry'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Client-experience telemetry: JS errors, failed/slow API calls, page visits.
// Best-effort and silent — must never break the app itself.
installTelemetry(router)

// Kick off the boot-time session restore. The router guard AWAITS this
// (auth.restore()), so protected pages no longer bounce to /login/ on a
// hard load before the session check has completed.
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
auth.restore().finally(() => {
  app.mount('#app')
})
