// QA helpers — real-user-journey testing via Playwright Chromium.
// Philosophy (per the QA prompt): UI-first interaction; APIs only to verify
// the UI result matches the backend. Reuses launch/step/summary from helpers.
const { launch, login, nav, goto, apiGet, apiPost, apiPut, shot, step, summary, results, fillByLabel } = require('./helpers')

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

// Clear ONE station's readings for ONE date, so a day-scoped suite can be
// replayed. Three hard rules, learned the hard way on 2026-10-03:
//   1. ownership is resolved through the island→pump→gun tree of THAT station,
//      never through a list filter (Meter Reading has no `station` field, and
//      `_get_filters` silently drops unknown ones — that is how an earlier
//      version of the acceptance reset deleted all 32 readings in the site);
//   2. a reading of ANOTHER station is never touched (counted, never deleted);
//   3. a reading of THIS station on ANOTHER date is never touched either —
//      membership alone used to make "clear today" wipe the station's history.
// Deleting a reading rolls Meter.current_reading back (Meter Reading.on_trash),
// so the caller should re-seed counters afterwards if it needs fixed values.
async function qaResetStationDay(page, stationName, date) {
  return page.evaluate(async ({ stationName, date }) => {
    const list = await (await fetch('/api/stations/', { credentials: 'include' })).json()
    const stations = (list.message || list).results || []
    const st = stations.find((s) => (s.station_name || '').trim() === stationName)
    if (!st) return { ok: false, error: `station «${stationName}» not found` }

    const dash = await (await fetch(`/api/dashboard-station/?station=${st.name}&date=${date}`, { credentials: 'include' })).json()
    const payload = dash.message || dash
    const myMeters = new Set()
    for (const isl of payload.islands || []) {
      for (const mach of isl.machines || []) for (const m of mach.meters || []) myMeters.add(m.id)
    }

    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const csrf = (me.message || me).csrf_token
    const shifts = await (await fetch(`/api/shifts/?station=${st.name}&limit_page_length=0`, { credentials: 'include' })).json()
    const stationShifts = (shifts.message || shifts).results || []
    const dayShiftNames = new Set(
      stationShifts.filter((s) => String(s.date) === String(date)).map((s) => s.name)
    )
    const all = await (await fetch('/api/meter-readings/?limit_page_length=0', { credentials: 'include' })).json()
    const rows = (all.message || all).results || []
    // TWO conditions, both required. Membership alone was not enough: it is
    // safe against other stations but reached THIS station's history, so a
    // "clear today" call silently wiped every earlier day (the readings of a
    // date live on that date's Shift; a reading with no Shift can only be
    // placed by its recorded_at).
    const mine = rows.filter((r) =>
      myMeters.has(r.meter) &&
      (dayShiftNames.has(r.shift) ||
        (!r.shift && String(r.recorded_at || '').slice(0, 10) === String(date)))
    )
    const otherDay = rows.filter((r) => myMeters.has(r.meter) && !mine.includes(r))
    const foreign = rows.filter((r) => !myMeters.has(r.meter))

    const del = async (n) => (await fetch(`/api/meter-readings/${n}/`, {
      method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
    })).status
    let removed = 0
    const problems = []
    for (const r of mine) {
      const st2 = await del(r.name)
      if (st2 < 400 || st2 === 404) removed++
      else problems.push(`reading ${r.name} → HTTP ${st2}`)
    }
    // The day-close container for that date, and everything hanging off it.
    //
    // Frappe refuses to delete a Shift that is still linked, so this walks the
    // chain in dependency order: cash/vouchers/POS → reconciliation (+ its
    // per-fuel summaries) → the shift itself. Every lookup is keyed on THAT
    // shift's name, so nothing outside this station and date is reachable.
    // This is also the guided teardown the QA-9 defect asks for.
    let clearedShifts = 0
    const drop = async (resource, name) => (await fetch(`/api/${resource}/${name}/`, {
      method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
    })).status
    for (const s of stationShifts) {
      if (String(s.date) !== String(date)) continue
      for (const resource of ['cash-collections', 'vouchers', 'pos-records']) {
        const j = await (await fetch(`/api/${resource}/?shift=${s.name}&limit_page_length=0`, { credentials: 'include' })).json()
        for (const row of (j.message || j).results || []) await drop(resource, row.name)
      }
      const recons = await (await fetch(`/api/reconciliations/?shift=${s.name}&limit_page_length=0`, { credentials: 'include' })).json()
      for (const rec of (recons.message || recons).results || []) {
        const sums = await (await fetch(`/api/shift-fuel-summaries/?reconciliation=${rec.name}&limit_page_length=0`, { credentials: 'include' })).json()
        for (const x of (sums.message || sums).results || []) await drop('shift-fuel-summaries', x.name)
        await drop('reconciliations', rec.name)
      }
      const st3 = await drop('shifts', s.name)
      if (st3 < 400 || st3 === 404) clearedShifts++
      else problems.push(`day-close shift ${s.name} (${s.date}) → HTTP ${st3}`)
    }
    // A shift that survived means the day may still be closed, which silently
    // makes every reading input read-only — say so instead of reporting a
    // cheerful zero. Deleting a Reconciliation needs Administrator: a station
    // manager gets 403, so run this as admin.
    return {
      ok: problems.length === 0,
      removed,
      leftAlone: foreign.length,
      historyKept: otherDay.length,
      clearedShifts,
      problems,
      station: st.name,
      date,
    }
  }, { stationName, date })
}


// The pilot fixture's documented opening counters. Several suites assert
// arithmetic against them, and they are the reason a cleared day still has a
// "previous reading": deleting a reading rolls Meter.current_reading back
// (Meter Reading.on_trash), so after any reset these have to be restored or
// every subsequent reading is booked as a first-ever baseline (0 L).
const PILOT_COUNTERS = { M01A: 3280418, M01B: 3077096, M02A: 27546777, M02B: 0 }

async function qaSeedCounters(page, stationName, specs) {
  return page.evaluate(async ({ stationName, specs }) => {
    const list = await (await fetch('/api/stations/', { credentials: 'include' })).json()
    const st = ((list.message || list).results || []).find((s) => (s.station_name || '').trim() === stationName)
    if (!st) return { ok: false, error: `station «${stationName}» not found` }
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const csrf = (me.message || me).csrf_token
    // Scope to THIS station. Meter carries no station field — it hangs off
    // Machine — so the station's own machine list is the ownership map. Meter
    // codes are per-station (M01A exists at several stations), so matching on
    // code alone would reset a DIFFERENT station's counters, which then silently
    // rewrites that station's next reading.
    const machineRes = await (await fetch(`/api/machines/?station=${st.name}&limit_page_length=0`, { credentials: 'include' })).json()
    const myMachines = new Set(((machineRes.message || machineRes).results || []).map((m) => m.name))
    const meters = (await (await fetch('/api/meters/?limit_page_length=0', { credentials: 'include' })).json())
    const own = ((meters.message || meters).results || []).filter((x) => myMachines.has(x.machine))
    const done = []
    for (const [code, counter] of Object.entries(specs)) {
      const m = own.find((x) => x.meter_code === code)
      if (!m) { done.push(`${code}: not found at ${stationName}`); continue }
      const res = await fetch(`/api/meters/${m.name}/`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
        body: JSON.stringify({ current_reading: counter }),
      })
      done.push(`${code} → ${counter} (HTTP ${res.status})`)
    }
    return { ok: true, done, station: st.name }
  }, { stationName, specs })
}


// The meter codes belonging to one station. Codes are NOT predictable from the
// station name: they are allocated globally unique, so a station created after
// another one gets M01AX rather than M01A. Suites that seed counters must ask.
async function qaStationMeterCodes(page, stationName) {
  const rows = await apiGet(page, 'stations/?limit_page_length=0')
  const st = ((rows && rows.results) || []).find((s) => (s.station_name || '').trim() === stationName)
  if (!st) return []
  const machines = await apiGet(page, `machines/?station=${st.name}&limit_page_length=0`)
  const mine = new Set(((machines && machines.results) || []).map((m) => m.name))
  const meters = await apiGet(page, 'meters/?limit_page_length=0')
  return ((meters && meters.results) || []).filter((m) => mine.has(m.machine)).map((m) => m.meter_code).sort()
}


// Resolve a station docname from its display name. Four suites used to hardcode
// the pilot station's id (f9sdreji1j), which silently returned empty payloads
// the moment the database was re-seeded.
async function qaStationId(page, stationName) {
  const rows = await apiGet(page, 'stations/?limit_page_length=0')
  const hit = ((rows && rows.results) || []).find((s) => (s.station_name || '').trim() === stationName)
  return hit ? hit.name : null
}


// Ensure an OPEN shift exists for a station on a date, creating one if not.
//
// This site has no Shift Definition rows at all, so POST /generate-shifts/
// legitimately creates nothing — the "generate today's shifts" button on the
// station-day screen can only ever report 0 here. Suites that need an open
// shift to attach finance postings to must therefore create it directly.
async function qaEnsureShift(page, stationId, date, opts = {}) {
  const rows = await apiGet(page, `shifts/?station=${stationId}&limit_page_length=0`)
  const forDate = ((rows && rows.results) || []).filter((x) => String(x.date || '').slice(0, 10) === date)
  const open = forDate.find((x) => x.status === 'open' || x.status === 'scheduled')
  if (open) return { ok: true, created: false, id: open.name, status: open.status }
  const res = await apiPost(page, 'shifts/', {
    station: stationId,
    shift_name: opts.shift_name || `QA مناوبة ${date}`,
    date,
    start_time: opts.start_time || '06:00',
    end_time: opts.end_time || '14:00',
  })
  if (res.__status && res.__status >= 400) {
    return { ok: false, created: false, error: `HTTP ${res.__status}: ${String(res.message || res.exc || '').slice(0, 160)}` }
  }
  const id = res.name || (res.message || res).name
  // A new Shift defaults to status "scheduled"; activation is a separate manual
  // step (PUT status=open), which is exactly what the SPA's «تفعيل» button does.
  // Finance postings only accept open/in_progress, so activate it here too.
  const act = await apiPut(page, `shifts/${id}/`, { status: 'open' })
  if (act && act.__status && act.__status >= 400) {
    return { ok: false, created: true, id, error: `created but activation failed: HTTP ${act.__status}` }
  }
  return { ok: true, created: true, id, status: 'open' }
}


// Ensure the station's DAY-CLOSE container (is_day_close=1) exists for a date.
//
// This is a different Shift from the employee shifts finance postings attach to:
// it is the station's reading/closing cycle for the date, and the readings screen
// only offers «åââáá çليوم» against one. Creating it through
// POST /ensure-day-close/ rather than POST /shifts/ keeps the create idempotent,
// exactly as the SPA does — the previous inline version of this helper created a
// plain employee shift, which the close button then refused to act on.
async function qaEnsureDayClose(page, stationId, date) {
  const res = await apiPost(page, 'ensure-day-close/', { station: stationId, date })
  if (res && res.__status && res.__status >= 400) {
    return { ok: false, error: `HTTP ${res.__status}: ${String(res.message || res.exc || '').slice(0, 160)}` }
  }
  const p = res && res.payload ? res.payload : res
  return { ok: true, id: p && (p.name || p.id), status: p && p.status, closed: !!(p && p.closed), raw: res }
}


// Clear a station-day's FINANCE state while KEEPING its meter readings, then
// reopen the day.
//
// qaResetStationDay() removes the readings too, which is right for phase 3
// (it re-enters them) but wrong for phase 4: the reconciliation's litres come
// from Shift Fuel Summaries built off those readings, so wiping them makes the
// reconciliation report 0 L / 0 expected sales and the whole arithmetic
// cross-check is meaningless. Deleting the day-close Shift is not an option
// either — Frappe refuses while readings still link to it.
async function qaReopenStationDay(page, stationName, date) {
  return page.evaluate(async ({ stationName, date }) => {
    const list = await (await fetch('/api/stations/', { credentials: 'include' })).json()
    const st = ((list.message || list).results || []).find((s) => (s.station_name || '').trim() === stationName)
    if (!st) return { ok: false, error: `station «${stationName}» not found` }
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const csrf = (me.message || me).csrf_token
    const drop = async (r, n) => (await fetch(`/api/${r}/${n}/`, {
      method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
    })).status
    const put = async (r, n, body) => (await fetch(`/api/${r}/${n}/`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
      body: JSON.stringify(body),
    })).status

    const shifts = await (await fetch(`/api/shifts/?station=${st.name}&limit_page_length=0`, { credentials: 'include' })).json()
    const rows = ((shifts.message || shifts).results || []).filter((s) => String(s.date || '').slice(0, 10) === date)
    const problems = []
    let removed = 0, reopened = 0, readingsKept = 0
    for (const s of rows) {
      for (const resource of ['cash-collections', 'vouchers', 'pos-records']) {
        const j = await (await fetch(`/api/${resource}/?shift=${s.name}&limit_page_length=0`, { credentials: 'include' })).json()
        for (const row of (j.message || j).results || []) {
          const code = await drop(resource, row.name)
          if (code < 400 || code === 404) removed++
          else problems.push(`${resource} ${row.name} → HTTP ${code}`)
        }
      }
      const recons = await (await fetch(`/api/reconciliations/?shift=${s.name}&limit_page_length=0`, { credentials: 'include' })).json()
      for (const rec of (recons.message || recons).results || []) {
        const sums = await (await fetch(`/api/shift-fuel-summaries/?reconciliation=${rec.name}&limit_page_length=0`, { credentials: 'include' })).json()
        for (const x of ((sums.message || sums).results || [])) await drop('shift-fuel-summaries', x.name)
        const code = await drop('reconciliations', rec.name)
        if (code >= 400 && code !== 404) problems.push(`reconciliation ${rec.name} → HTTP ${code}`)
        else removed++
      }
      const mr = await (await fetch(`/api/meter-readings/?shift=${s.name}&limit_page_length=0`, { credentials: 'include' })).json()
      readingsKept += ((mr.message || mr).results || []).length
      if (s.status !== 'open') {
        const code = await put('shifts', s.name, { status: 'open' })
        if (code >= 400) problems.push(`reopen shift ${s.name} (${s.status}) → HTTP ${code}`)
        else reopened++
      }
    }
    return { ok: problems.length === 0, removed, reopened, readingsKept, shifts: rows.length, problems, station: st.name, date }
  }, { stationName, date })
}


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

module.exports = { BASE2, CKPT_DIR, RUN_FILE, initRunLog, appendRun, defects, defect, capture, uiLogin, clickNav, bodyText, shot, step, summary, launch, login, nav, goto, apiGet, apiPost, apiPut, fillByLabel, qaFill, qaFillField, qaDelete, qaResetStationDay, qaStationId, qaSeedCounters, qaStationMeterCodes, qaEnsureShift, qaEnsureDayClose, qaReopenStationDay, PILOT_COUNTERS }
