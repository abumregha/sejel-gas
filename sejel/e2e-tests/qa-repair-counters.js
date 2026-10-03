// Repair Meter.current_reading for ONE named station so it agrees with that
// station's own latest reading (in normal operation Meter Reading.on_update keeps
// them in step; a manual cleanup can break the invariant).
//
// Usage: node qa-repair-counters.js "<station name>"
//
// SAFETY — two rules this script used to break:
//   1. it looped over EVERY meter in the site, so one run could rewrite any
//      station's counters (including the pilot's, which its header claimed was
//      "read only"). The station is now a required argument and the meter set
//      is resolved through THAT station's machine list.
//   2. a meter with no readings was "repaired" to 0 — which silently destroys a
//      deliberately seeded counter. A meter with nothing to compare is left
//      alone and reported instead.
const { apiGet, launch, uiLogin } = require('./qa')

const STATION = process.argv[2]

;(async () => {
  if (!STATION) {
    console.error('USAGE: node qa-repair-counters.js "<station name>"  — refusing to touch every station')
    process.exit(2)
  }
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const csrf = await page.evaluate(async () => {
    const r = await fetch('/api/auth/me/', { credentials: 'include' })
    return (await r.json()).message.csrf_token
  })

  const stations = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
  const st = stations.find((s) => (s.station_name || '').trim() === STATION)
  if (!st) {
    console.error(`station «${STATION}» not found — refusing to touch anything`)
    await browser.close()
    process.exit(1)
  }
  const machines = (await apiGet(page, `machines/?station=${st.name}&limit_page_length=0`)).results || []
  const myMachines = new Set(machines.map((m) => m.name))
  const meters = ((await apiGet(page, 'meters/?limit_page_length=0')).results || [])
    .filter((m) => myMachines.has(m.machine))
  const readings = (await apiGet(page, 'meter-readings/?limit_page_length=0')).results || []
  console.log(`scope: «${STATION}» (${st.name}) — ${meters.length} meter(s)`)

  // latest end_reading per meter, by recorded_at then creation
  const latest = new Map()
  for (const r of readings) {
    if (r.end_reading === null || r.end_reading === undefined) continue
    if (!myMachines.size || !meters.some((m) => m.name === r.meter)) continue
    const cur = latest.get(r.meter)
    const t = r.recorded_at || r.modified || ''
    if (!cur || t > cur.t) latest.set(r.meter, { t, end: r.end_reading })
  }

  let fixed = 0
  let skipped = 0
  for (const m of meters) {
    if (!latest.has(m.name)) {
      console.log(`  ${m.meter_code}: no readings — left alone (counter stays ${m.current_reading})`)
      skipped++
      continue
    }
    const want = latest.get(m.name).end
    if (Math.abs(Number(m.current_reading || 0) - Number(want)) > 0.001) {
      const status = await page.evaluate(async ({ name, want, csrf }) => {
        const r = await fetch(`/api/meters/${name}/`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
          body: JSON.stringify({ current_reading: want }),
        })
        return r.status
      }, { name: m.name, want, csrf })
      console.log(`  ${m.meter_code} (${m.name}): ${m.current_reading} -> ${want} (${status})`)
      fixed++
    }
  }
  console.log(`counters repaired: ${fixed} · left alone: ${skipped}`)

  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
