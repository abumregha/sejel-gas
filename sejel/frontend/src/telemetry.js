// ── Client-experience telemetry ────────────────────────────────
// Captures how the system actually feels to users:
//   - JS errors (window.onerror / unhandledrejection)
//   - failed API calls (4xx/5xx + latency)
//   - slow API calls (> SLOW_MS)
//   - page visits (which screens get used, and in what order)
// All reports are best-effort: fire-and-forget, never throw, never block UI,
// and a failing telemetry request is silently dropped (no recursion).

import api, { setCsrfToken } from './api'

const SLOW_MS = 3000
let installAttempted = false

function isTelemetryCall(url) {
  return typeof url === 'string' && url.includes('/ux/')
}

// The session cookie outlives the CSRF token — when that happens every POST
// dies with 400 CSRFTokenError before reaching our handler (observed in the
// 2026-10-01 logs: client-error reports silently dropped all day). Refresh
// the token from /auth/me/ once and retry; telemetry must never give up on
// its first failure.
let refreshingToken = null
function refreshCsrfToken() {
  if (!refreshingToken) {
    refreshingToken = api.get('/auth/me/')
      .then(({ data }) => {
        const token = data?.csrf_token || ''
        if (token) setCsrfToken(token)
        return token
      })
      .catch(() => '')
      .finally(() => { refreshingToken = null })
  }
  return refreshingToken
}

function send(payload) {
  try {
    api.post('/ux/client-error/', payload, { timeout: 5000 }).catch(async (e) => {
      const isCsrf = e?.response?.status === 400
        && String(e?.response?.data?.exc_type || '') === 'CSRFTokenError'
      if (!isCsrf) return null
      const token = await refreshCsrfToken()
      if (!token) return null
      return api.post('/ux/client-error/', payload, { timeout: 5000 })
    }).catch(() => { /* best-effort */ })
  } catch {
    /* never throw from telemetry */
  }
}

function pageInfo() {
  return window.location.pathname
}

export function reportClientError(kind, payload = {}) {
  send({
    kind,
    page: pageInfo(),
    ...payload,
  })
}

export function installTelemetry(router) {
  if (installAttempted) return
  installAttempted = true

  // 1. Uncaught JS errors
  window.addEventListener('error', (event) => {
    reportClientError('error', {
      message: String(event.message || 'Script error'),
      source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : '',
      stack: event.error && event.error.stack ? String(event.error.stack) : '',
    })
  })

  // 2. Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {}
    reportClientError('error', {
      message: String(reason.message || reason || 'Unhandled rejection'),
      stack: reason.stack ? String(reason.stack) : '',
    })
  })

  // 3. Page visits (spa navigation + first load)
  if (router) {
    router.afterEach((to) => {
      reportClientError('visit', { message: to.path })
    })
  }

  // 4. Request timestamp for latency measurement (runs before other req hooks)
  api.interceptors.request.use((config) => {
    config.metadata = { startedAt: Date.now() }
    return config
  })

  // 5. Slow calls + failed API calls — hook into the shared axios instance
  api.interceptors.response.use(
    (response) => {
      try {
        const cfg = response.config || {}
        if (isTelemetryCall(cfg.url)) return response
        const started = cfg.metadata && cfg.metadata.startedAt
        if (started) {
          const dur = Date.now() - started
          if (dur > SLOW_MS) {
            reportClientError('slow', {
              message: `${cfg.method?.toUpperCase()} ${cfg.url} took ${dur}ms`,
              request_path: cfg.url,
            })
          }
        }
      } catch {
        /* ignore */
      }
      return response
    },
    (error) => {
      try {
        const cfg = error.config || {}
        const status = error.response?.status
        // Never report telemetry failures (recursion guard) or auth errors
        // (401/403 are surfaced as Arabic messages by errors.js / api.js).
        if (!isTelemetryCall(cfg.url) && status && status !== 401 && status !== 403) {
          const started = cfg.metadata && cfg.metadata.startedAt
          const dur = started ? Date.now() - started : null
          reportClientError('api_fail', {
            message: `${cfg.method?.toUpperCase()} ${cfg.url} → ${status}${dur ? ` (${dur}ms)` : ''}`,
            request_path: cfg.url,
            stack: error.response?.data?.exception || error.response?.data?.message || '',
          })
        }
      } catch {
        /* ignore */
      }
      return Promise.reject(error)
    }
  )
}

export default { installTelemetry, reportClientError }
