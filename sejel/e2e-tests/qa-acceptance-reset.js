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

  summary('qa-acceptance-reset')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })