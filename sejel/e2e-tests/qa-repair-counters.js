// Repair: the QA-32 test cleanup zeroed Meter.current_reading on the QA Edge
// station while older Phase-3 readings survived, so the counter and the latest
// reading disagreed (417 on continuity). In normal operation on_update keeps the
// counter in step with the latest reading — restore that invariant.
//
// Pilot and «برهم» are only READ here (to check they are consistent), never written.
const { apiGet, launch, uiLogin } = require('./qa')

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const csrf = await page.evaluate(async () => {
    const r = await fetch('/api/auth/me/', { credentials: 'include' })
    return (await r.json()).message.csrf_token
  })

  const meters = (await apiGet(page, 'meters/')).results || []
  const readings = (await apiGet(page, 'meter-readings/')).results || []

  // latest end_reading per meter, by recorded_at then creation
  const latest = new Map()
  for (const r of readings) {
    if (r.end_reading === null || r.end_reading === undefined) continue
    const cur = latest.get(r.meter)
    const t = r.recorded_at || r.modified || ''
    if (!cur || t > cur.t) latest.set(r.meter, { t, end: r.end_reading })
  }

  let fixed = 0
  for (const m of meters) {
    const want = latest.has(m.name) ? latest.get(m.name).end : 0
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
  console.log(`counters repaired: ${fixed}`)

  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })