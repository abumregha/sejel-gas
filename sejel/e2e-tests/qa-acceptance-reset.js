// Round 3 / PART 6 helper — put the ISOLATED acceptance station back to a
// clean day so the walkthrough can be repeated.
//
// ── SAFETY ────────────────────────────────────────────────────────────────────
// An earlier version of this file listed readings with
//   GET /api/meter-readings/?station=<id>
// and deleted whatever came back. Meter Reading has no `station` field, so the
// generic list endpoint silently DROPPED the filter and the script deleted
// every reading in the site (32 rows, 2026-10-03 ~15:00). Only synthetic QA
// readings created that morning were affected — all 7 stations in the database
// were themselves created by QA fixtures after 13:16 — but the near-miss is
// exactly the failure mode the QA prompt warns about.
//
// This version resolves ownership server-side per reading and aborts the whole
// run if a single reading turns out to belong to another station.
const { launch, uiLogin, step, summary, apiGet } = require('./qa')

const BASE = 'http://localhost:8004'
const STATION = 'QA موظف جديد'
// Must match qa-create-acceptance-station.js. Deleting the readings rolls
// Meter.current_reading back to 0 (correctly — the counters that produced
// them are gone), so the reset puts the known counters back or the walkthrough
// starts from a station where every reading is a first-ever baseline.
const GUN_COUNTERS = { A: 500000, B: 300000, C: 0 }

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  const csrf = await page.evaluate(async () =>
    (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token)

  const stations = (await apiGet(page, 'stations/')).results || []
  const mine = stations.find((s) => s.station_name === STATION)
  if (!mine) throw new Error(`station «${STATION}» not found — refusing to touch anything`)

  // Ownership resolved through the dashboard tree, not through a list filter:
  // station → islands → pumps → meters is the only chain that cannot lie.
  const payload = await apiGet(page, `dashboard-station/?station=${encodeURIComponent(mine.name)}`)
  const myMeters = new Set()
  for (const isl of payload.islands || []) {
    for (const mach of isl.machines || []) for (const m of mach.meters || []) myMeters.add(m.id)
  }
  step('resolved this station’s own meters', myMeters.size > 0, `${myMeters.size} meters`)

  const all = (await apiGet(page, 'meter-readings/?limit_page_length=0')).results || []
  const foreign = all.filter((r) => !myMeters.has(r.meter))
  if (foreign.length) {
    throw new Error(
      `ABORT: ${foreign.length} reading(s) belong to other stations. ` +
      'This script must never delete them.'
    )
  }
  step('every listed reading belongs to this station', true, `${all.length} reading(s) to consider`)

  let removed = 0
  for (const r of all) {
    const status = await page.evaluate(async ({ name, csrf }) => {
      const res = await fetch(`/api/meter-readings/${name}/`, {
        method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
      })
      return res.status
    }, { name: r.name, csrf })
    step(`delete reading ${r.name} (${r.meter})`, status < 400 || status === 404, `HTTP ${status}`)
    if (status < 400) removed++
  }
  console.log(`\nremoved ${removed} reading(s) — all from «${STATION}» only`)

  // The day-close container and its financial records. A closed day is now
  // read-only (Round 3), so without this the walkthrough could never be
  // replayed. Everything here is reached THROUGH a Shift of this station, so
  // the ownership guard above still applies.
  const shifts = (await apiGet(page, `shifts/?station=${encodeURIComponent(mine.name)}&limit_page_length=0`)).results || []
  const dayShifts = shifts.filter((s) => s.is_day_close)
  step('this station owns every day-close shift to be cleared', dayShifts.every((s) => s.station === mine.name),
    `${dayShifts.length} day-close shift(s)`)

  for (const s of dayShifts) {
    const body = { shift: s.name, station: mine.name, csrf }
    // Reconciliation rows are linked to Shift Fuel Summary, so delete those first.
    const recons = await page.evaluate(async ({ shift, csrf }) => {
      const res = await fetch(`/api/reconciliations/?shift=${shift}&limit_page_length=0`, { credentials: 'include' })
      const json = await res.json()
      // the list endpoint wraps its payload in `message`
      return (json.message || json).results || []
    }, body)
    for (const r of recons) {
      const summaries = await page.evaluate(async ({ recon, csrf }) => {
        const res = await fetch(`/api/shift-fuel-summaries/?reconciliation=${recon}&limit_page_length=0`, { credentials: 'include' })
        const json = await res.json()
        return ((json.message || json).results || []).map((x) => x.name)
      }, { recon: r.name, csrf })
      for (const sum of summaries) {
        await page.evaluate(async ({ name, csrf }) => {
          await fetch(`/api/shift-fuel-summaries/${name}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf } })
        }, { name: sum, csrf })
      }
      const status = await page.evaluate(async ({ name, csrf }) => {
        const res = await fetch(`/api/reconciliations/${name}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf } })
        return res.status
      }, { name: r.name, csrf })
      step(`delete reconciliation ${r.name} (shift ${s.name}, ${s.date})`, status < 400 || status === 404, `HTTP ${status}`)
    }
    const st = await page.evaluate(async ({ name, csrf }) => {
      const res = await fetch(`/api/shifts/${name}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf } })
      return res.status
    }, { name: s.name, csrf })
    step(`delete day-close shift ${s.name} (${s.date})`, st < 400 || st === 404, `HTTP ${st}`)
  }

  // 3. put the fixture counters back, so «lower than the previous reading» and
  //    the opening-baseline case are both reachable from a clean day.
  const tree = await apiGet(page, `dashboard-station/?station=${encodeURIComponent(mine.name)}`)
  const guns = []
  for (const isl of tree.islands || []) for (const mach of isl.machines || []) guns.push(...(mach.meters || []))
  guns.sort((a, b) => String(a.gun_letter).localeCompare(String(b.gun_letter)))
  for (const g of guns) {
    const want = GUN_COUNTERS[g.gun_letter]
    if (want === undefined) continue
    const status = await page.evaluate(async ({ id, want, csrf }) => {
      const res = await fetch(`/api/meters/${id}/`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
        body: JSON.stringify({ current_reading: want }),
      })
      return res.status
    }, { id: g.id, want, csrf })
    step(`gun ${g.gun_letter} counter restored to ${want}`, status === 200, `HTTP ${status}`)
  }

  summary('qa-acceptance-reset')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })