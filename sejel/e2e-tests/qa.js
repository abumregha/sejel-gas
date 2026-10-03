// QA helpers — real-user-journey testing via Playwright Chromium.
// Philosophy (per the QA prompt): UI-first interaction; APIs only to verify
// the UI result matches the backend. Reuses launch/step/summary from helpers.
const { launch, login, nav, goto, apiGet, apiPost, shot, step, summary, results, fillByLabel } = require('./helpers')

const BASE2 = process.env.QA_BASE || 'http://localhost:8004'
const CKPT_DIR = __dirname + '/qa-checkpoints'
const fs = require('fs')
if (!fs.existsSync(CKPT_DIR)) fs.mkdirSync(CKPT_DIR)

// ---- run log (checkpoint file, appended per phase) --------------------------
const RUN_FILE = CKPT_DIR + '/qa-run-log.md'
function initRunLog() {
  fs.writeFileSync(RUN_FILE,
    '# Sejel Browser QA — run log\n\n- Date: ' + new Date().toISOString() +
    '\n- Target: ' + BASE2 +
    '\n- Browser: Playwright Chromium (headless)\n\n')
}
function appendRun(section, text) {
  fs.appendFileSync(RUN_FILE, '\n## ' + section + '\n\n' + text + '\n')
}

// ---- defects ----------------------------------------------------------------
const defects = []
function defect(d) {
  // d: {id, severity, area, repro, expected, actual, evidence}
  defects.push(d)
  appendRun('DEFECT ' + d.id + ' [' + d.severity + '] ' + d.area,
    '- Repro: ' + d.repro + '\n- Expected: ' + d.expected + '\n- Actual: ' + d.actual +
    '\n- Evidence: ' + d.evidence)
  step('DEFECT ' + d.id + ' [' + d.severity + '] ' + d.area, false, d.actual.slice(0, 120))
}

// ---- console/network capture -------------------------------------------------
function capture(page) {
  const netFails = []
  page.on('response', (r) => {
    if (r.status() >= 400) netFails.push(r.status() + ' ' + r.url().replace(BASE2, ''))
  })
  page.netFails = netFails
  return page
}

// ---- UI login with arbitrary credentials (real form interaction) ------------
async function uiLogin(page, email, pwd) {
  await page.goto(BASE2 + '/login/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)
  await page.locator('input').nth(0).fill(email)
  await page.locator('input').nth(1).fill(pwd)
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(1500)
  return !page.url().includes('login')
}

// click a sidebar/nav link by visible Arabic text (real user navigation).
// Visible-only: the SPA renders a mobile bottom-nav too — its links match
// hasText but are hidden at desktop widths (Playwright would time out).
async function clickNav(page, text) {
  const links = page.locator('a', { hasText: text })
  const n = await links.count()
  for (let i = 0; i < n; i++) {
    const a = links.nth(i)
    if (await a.isVisible()) { await a.click(); await page.waitForTimeout(900); return true }
  }
  return false
}

const bodyText = (page) => page.locator('body').innerText()

// DELETE a doc through the generic API (backend cross-check / cleanup helper)
async function qaDelete(page, resource, name) {
  return page.evaluate(async ({ r, n }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    const token = ((await me.json()).message || {}).csrf_token || ''
    const res = await fetch('/api/' + r + '/' + n + '/', {
      method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': token },
    })
    return { status: res.status, ok: res.ok }
  }, { r: resource, n: name })
}

// Page-wide label→control fill (helpers.fillByLabel scopes to a container,
// which breaks on wizard layouts whose first <div> is an outer shell).
async function qaFill(page, label, value) {
  const el = page.locator(`xpath=//label[normalize-space(.)='${label}']/following-sibling::*[1]`).first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  const tag = await el.evaluate((n) => n.tagName.toLowerCase())
  if (tag === 'select') await el.selectOption(String(value))
  else await el.fill(String(value))
}

// Page-wide label→control fill, robust to two-column field rows where the
// label's immediate sibling is a wrapper <div> rather than the control.
async function qaFillField(page, label, value) {
  const el = page.locator(`xpath=//label[normalize-space(.)='${label}']`).first()
  await el.waitFor({ state: 'visible', timeout: 8000 })
  const ctrl = el.locator('xpath=following::input[1]|following::select[1]|following::textarea[1]').first()
  await ctrl.waitFor({ state: 'visible', timeout: 8000 })
  const tag = await ctrl.evaluate((n) => n.tagName.toLowerCase())
  if (tag === 'select') {
    // Match on the option's visible text prefix — rendered options carry
    // suffixes like "خزان 1 (بنزين)" that an exact label match would miss.
    const idx = await ctrl.evaluate((el, want) => {
      const w = String(want).trim()
      const opts = Array.from(el.options)
      let i = opts.findIndex((o) => o.textContent.trim() === w)
      if (i < 0) i = opts.findIndex((o) => o.textContent.trim().startsWith(w))
      if (i < 0) i = opts.findIndex((o) => o.value === w)
      if (i < 0) return -1
      el.value = opts[i].value
      el.dispatchEvent(new Event('change', { bubbles: true }))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return i
    }, value)
    if (idx < 0) throw new Error(`no option matching "${value}" (options: ${await ctrl.locator('option').allTextContents()})`)
  } else {
    await ctrl.fill(String(value))
  }
  return ctrl
}

module.exports = { BASE2, CKPT_DIR, RUN_FILE, initRunLog, appendRun, defects, defect, capture, uiLogin, clickNav, bodyText, shot, step, summary, launch, login, nav, goto, apiGet, apiPost, fillByLabel, qaFill, qaFillField, qaDelete }
