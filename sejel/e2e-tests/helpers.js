// Shared helpers for Sejel UI E2E tests
const { chromium } = require('playwright')

const BASE = 'http://localhost:8004'
const SHOT_DIR = __dirname + '/shots'

const results = []
function step(name, ok, detail = '') {
  const icon = ok ? 'PASS' : 'FAIL'
  results.push({ name, ok, detail })
  console.log(`[${icon}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function launch(opts = {}) {
  const viewport = opts.viewport || { width: 1440, height: 900 }
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport })
  const page = await ctx.newPage()
  const consoleErrors = []
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)) })
  page.on('dialog', d => d.accept()) // auto-accept confirm()/alert() dialogs
  page.consoleErrors = consoleErrors
  return { browser, ctx, page }
}

// Wait until the Vue app is mounted (hydration complete)
async function waitForApp(page) {
  await page.waitForFunction(() => {
    const el = document.querySelector('#app')
    return el && el.__vue_app__
  }, { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(200)
}

// Login via the real UI form (waits for hydration first)
async function login(page) {
  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await waitForApp(page)
  await page.locator('input').nth(0).fill('admin@sejel.ly')
  await page.locator('input').nth(1).fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(400)
  return !page.url().includes('login')
}

// Client-side navigation via the Vue router (like clicking a sidebar link).
// Keeps Pinia state alive — mirrors real in-app user navigation.
async function nav(page, path) {
  const target = '/' + path.replace(/^\/+|\/+$/g, '')
  await page.evaluate(async (t) => {
    const app = document.querySelector('#app').__vue_app__
    const router = app.config.globalProperties.$router
    await router.push(t)
  }, target)
  await page.waitForTimeout(600) // let onMounted fetches settle
}

// Hard-navigate; if the SPA loses auth state (fresh boot), patch the Pinia
// auth store by fetching /api/auth/me/ via the page's session cookies and
// assigning it — mirroring what a fixed app would do. We then reload once.
async function goto(page, path) {
  await page.goto(BASE + '/app/' + path.replace(/^\//, ''), { waitUntil: 'networkidle' })
  // ensure Pinia auth store has a user (simulates session restore)
  await page.evaluate(async () => {
    try {
      const app = document.querySelector('#app').__vue_app__
      if (!app) return
      const pinia = app.config.globalProperties.$pinia
      const auth = pinia._s.get('auth')
      if (auth && !auth.user) {
        const r = await fetch('/api/auth/me/', { credentials: 'include' })
        if (r.ok) {
          const j = await r.json()
          const msg = j.message || j
          auth.user = msg.user || msg
        }
      }
    } catch (e) {}
  })
}

// fetch with session cookies from inside the page; unwraps {message: ...}
async function apiGet(page, url) {
  return page.evaluate(async (u) => {
    const r = await fetch('/api/' + u, { credentials: 'include' })
    if (!r.ok) return { __status: r.status }
    const j = await r.json()
    return j.message !== undefined ? j.message : j
  }, url)
}

// POST from inside the page with CSRF token (required since ignore_csrf was
// removed). Fetches /api/auth/me/ first to obtain the session's csrf_token.
async function apiPost(page, url, body) {
  return page.evaluate(async ({ u, b }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    if (!me.ok) return { __status: me.status }
    const meMsg = (await me.json()).message || {}
    const r = await fetch('/api/' + u, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': meMsg.csrf_token || '' },
      body: b ? JSON.stringify(b) : undefined,
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      return { __status: r.status, __exc: j.exc_type || j.exception || '' }
    }
    const j = await r.json()
    return j.message !== undefined ? j.message : j
  }, { u: url, b: body })
}

// PUT a doc through the generic API (partial update, e.g. shift activation).
async function apiPut(page, url, body) {
  return page.evaluate(async ({ u, b }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    if (!me.ok) return { __status: me.status }
    const meMsg = (await me.json()).message || {}
    const r = await fetch('/api/' + u, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': meMsg.csrf_token || '' },
      body: b ? JSON.stringify(b) : undefined,
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      return { __status: r.status, __exc: j.exc_type || j.exception || '' }
    }
    const j = await r.json()
    return j.message !== undefined ? j.message : j
  }, { u: url, b: body })
}

// Fill the form control that follows the label with the given Arabic text.
async function fillByLabel(page, label, value, scopeSel = 'form') {
  const scope = page.locator(scopeSel).first()
  const el = scope.locator(`xpath=//label[normalize-space(.)='${label}']/following-sibling::*[1]`).first()
  const tag = await el.evaluate(n => n.tagName.toLowerCase())
  if (tag === 'select') await el.selectOption(String(value))
  else await el.fill(String(value))
}

// Select an option whose text includes `text` in the nth select of a form.
async function selectByOptionText(page, selectIndex, text, scopeSel = 'form') {
  const sel = page.locator(scopeSel + ' select').nth(selectIndex)
  const opts = await sel.locator('option').allTextContents()
  const idx = opts.findIndex(t => t.includes(text))
  if (idx < 0) throw new Error(`no option containing "${text}" in select#${selectIndex}: ${JSON.stringify(opts)}`)
  await sel.selectOption({ index: idx })
  return opts[idx]
}

async function shot(page, name) {
  await page.screenshot({ path: `${SHOT_DIR}/${name}.png`, fullPage: true })
}

function summary() {
  const pass = results.filter(r => r.ok).length
  const fail = results.filter(r => !r.ok).length
  console.log(`\n===== SUMMARY: ${pass} passed, ${fail} failed =====`)
  if (fail) { console.log('Failed steps:'); results.filter(r => !r.ok).forEach(r => console.log('  - ' + r.name + (r.detail ? ' (' + r.detail + ')' : ''))) }
  return fail
}

module.exports = { BASE, SHOT_DIR, launch, login, nav, goto, apiGet, apiPost, apiPut, fillByLabel, selectByOptionText, shot, step, summary, results }
