// Round 3 / PART 10 — the reading-cycle matrix.
//
// A station's daily cycle time is the one setting every screen depends on:
// the readings screen, the dashboard, the close-day button, the setup wizard
// and the resulting reconciliation. This drives the acceptance station through
// three configurations — 11:00, 10:30 and unset — and checks that every screen
// tells the same story, because a station running an 11:00 cycle must never be
// shown (or look like) 23:00.
//
//   usage: node qa-cycle-matrix.js
//
// The station's ORIGINAL cycle time is restored at the end.
const { launch, uiLogin, step, summary } = require('./qa')

const BASE = 'http://localhost:8004'
const STATION = 'QA موظف جديد'

async function setCycle(page, station, value) {
  return page.evaluate(async ({ station, value }) => {
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const csrf = (me.message || me).csrf_token
    const res = await fetch(`/api/stations/${station}/`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
      body: JSON.stringify(value === null ? { day_close_time: '' } : { day_close_time: value }),
    })
    return res.status
  }, { station, value })
}

async function readCycle(page, station) {
  return page.evaluate(async (station) => {
    const j = await (await fetch(`/api/stations/${station}/`, { credentials: 'include' })).json()
    const d = j.message || j
    return d.day_close_time || ''
  }, station)
}

// What each screen actually SHOWS for the cycle, read off the rendered page.
//
// This has to be the EMPLOYEE's session. The manager sees the aggregate
// station-picker dashboard and a station `<select>` on the readings screen, so
// neither renders a cycle until a station is chosen — which is a different
// question from the one this matrix is asking.
async function shownOnScreen(page) {
  await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const readings = {
    period: (await page.locator('[data-testid="reading-period"]').innerText().catch(() => '(none)')).replace(/\s+/g, ' '),
    warning: (await page.locator('[data-testid="cycle-warning"]').innerText().catch(() => '')).replace(/\s+/g, ' '),
    closeTitle: await page.locator('[data-testid="close-day"]').getAttribute('title').catch(() => '(no close button)'),
  }
  await page.goto(BASE + '/app/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const dash = (await page.locator('main').first().innerText()).replace(/\s+/g, ' ')
  const m = dash.match(/(\d{2}:\d{2})\s*←\s*(\d{2}:\d{2})/)
  return { readings, dashboardCycle: m ? `${m[1]} ← ${m[2]}` : '(no cycle shown)' }
}

;(async () => {
  const { browser } = await launch()
  // Two independent sessions: the manager changes the setting, the employee
  // sees what it looks like on the floor.
  const mgrCtx = await browser.newContext()
  const page = await mgrCtx.newPage()
  await uiLogin(page, 'owner@sejel.ly', 'owner123')

  const empCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })
  const emp = await empCtx.newPage()
  await uiLogin(emp, 'emp@sejel.ly', 'Sejel-QA-2026')

  const station = await page.evaluate(async (name) => {
    const j = await (await fetch('/api/stations/', { credentials: 'include' })).json()
    const s = ((j.message || j).results || []).find((x) => (x.station_name || '').trim() === name)
    return s ? s.name : null
  }, STATION)
  if (!station) throw new Error(`station «${STATION}» not found — run qa-create-acceptance-station.js first`)

  const original = await readCycle(page, station)
  console.log(`\nacceptance station ${station} — original cycle: ${original || '(unset)'}\n`)

  const cases = [
    { set: '11:00:00', expect: '11:00', warn: false },
    { set: '10:30:00', expect: '10:30', warn: false },
    { set: null, expect: '23:00', warn: true },
  ]

  for (const c of cases) {
    const status = await setCycle(page, station, c.set)
    step(`cycle set to ${c.set || '(unset)'}`, status === 200, `HTTP ${status}`)
    const stored = await readCycle(page, station)
    const want = c.set ? c.set.slice(0, 5) : ''
    step(`station record holds ${want || 'nothing'}`, String(stored).slice(0, 5) === want, `stored «${stored}»`)

    const shown = await shownOnScreen(emp)
    const ok = (haystack, needle) => String(haystack).includes(needle)
    step(`readings screen shows «${c.expect} ← ${c.expect}»`,
      ok(shown.readings.period, `${c.expect} ← ${c.expect}`), shown.readings.period)
    step('dashboard shows the same cycle', ok(shown.dashboardCycle, c.expect), shown.dashboardCycle)
    if (c.warn) {
      step('readings screen warns that the cycle is temporary',
        /لم يتم ضبط وقت إقفال اليوم/.test(shown.readings.warning), shown.readings.warning.slice(0, 110) || '(no warning)')
    } else {
      step('no "cycle not configured" warning while a cycle is set',
        shown.readings.warning === '', shown.readings.warning.slice(0, 110) || '(none, as expected)')
    }
    console.log(`   close-day button title: ${shown.readings.closeTitle}`)
  }

  const restored = await setCycle(page, station, original || null)
  step(`original cycle ${original || '(unset)'} restored`, restored === 200, `HTTP ${restored}`)

  summary('qa-cycle-matrix')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })