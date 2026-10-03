// Cleanup after the QA-32 investigation: the Phase-8 run booked 807,849 L on the
// QA Edge station's 2026-10-04 day-close shift (the bug). Remove those inflated
// readings and the reconciliation built from them so the station can be re-run
// cleanly and the corrected arithmetic verified.
//
// Deliberately does NOT touch the pilot or «برهم» data.
const { apiGet, launch, uiLogin } = require('./qa')

const EDGE_NAME = 'QA Edge Station' // resolved to a docname at run time
const BAD_SHIFT = '965o92elqn'  // 2026-10-04 day-close shift from the Phase-8 run

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  // The two ids above are hard-coded, so verify what they actually point at
  // before deleting anything: the shift must be a day-close shift of the named
  // station, and every reading deleted must hang off that station's own meters.
  // A stale id that now names someone else's document must abort, not delete.
  const stations = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
  const edgeStation = stations.find((s) => s.station_name === EDGE_NAME)
  const shifts = (await apiGet(page, 'shifts/?limit_page_length=0')).results || []
  const target = shifts.find((s) => s.name === BAD_SHIFT)
  if (!edgeStation || !target || target.station !== edgeStation.name) {
    console.error(`ABORT: ${BAD_SHIFT} is not a shift of «${EDGE_NAME}» — refusing to delete anything`)
    console.error(`  station resolved: ${edgeStation ? edgeStation.name : 'NOT FOUND'}`)
    console.error(`  shift belongs to: ${target ? target.station : 'NOT FOUND'}`)
    await browser.close()
    process.exit(1)
  }
  console.log(`ownership ok: ${BAD_SHIFT} (${target.date}) belongs to «${EDGE_NAME}» ${edgeStation.name}`)

  const dash = await apiGet(page, `dashboard-station/?station=${encodeURIComponent(edgeStation.name)}`)
  const myMeters = new Set()
  for (const isl of dash.islands || []) for (const mach of isl.machines || []) for (const m of mach.meters || []) myMeters.add(m.id)

  const readings = await apiGet(page, 'meter-readings/?limit_page_length=0')
  const bad = (readings.results || []).filter((r) => r.shift === BAD_SHIFT && myMeters.has(r.meter))
  const wrong = (readings.results || []).filter((r) => r.shift === BAD_SHIFT && !myMeters.has(r.meter))
  if (wrong.length) {
    console.error(`ABORT: ${wrong.length} reading(s) on ${BAD_SHIFT} belong to another station`)
    await browser.close()
    process.exit(1)
  }
  console.log(`readings on ${BAD_SHIFT}: ${bad.length}`)

  const csrf = await page.evaluate(async () => {
    const r = await fetch('/api/auth/me/', { credentials: 'include' })
    return (await r.json()).message.csrf_token
  })

  const del = async (res, name) => {
    const r = await page.evaluate(async ({ res, name, csrf }) => {
      const x = await fetch(`/api/${res}/${name}/`, {
        method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
      })
      return x.status
    }, { res, name, csrf })
    console.log(`  delete ${res}/${name} -> ${r}`)
    return r
  }

  // 1. the reconciliation and its per-fuel summaries
  const recs = await apiGet(page, 'reconciliations/?limit_page_length=0')
  const badRecs = (recs.results || []).filter((x) => x.shift === BAD_SHIFT && x.station === edgeStation.name)
  const foreignRecs = (recs.results || []).filter((x) => x.shift === BAD_SHIFT && x.station !== edgeStation.name)
  if (foreignRecs.length) {
    console.error(`ABORT: ${foreignRecs.length} reconciliation(s) on ${BAD_SHIFT} belong to another station`)
    await browser.close()
    process.exit(1)
  }
  for (const rec of badRecs) {
    const sums = await apiGet(page, 'shift-fuel-summaries/')
    for (const s of (sums.results || []).filter((x) => x.reconciliation === rec.name)) {
      await del('shift-fuel-summaries', s.name)
    }
    await del('reconciliations', rec.name)
  }

  // 2. the readings themselves, then rewind each meter's counter
  for (const r of bad) {
    await del('meter-readings', r.name)
  }
  for (const m of new Set(bad.map((r) => r.meter))) {
    const res = await page.evaluate(async ({ m, csrf }) => {
      const x = await fetch(`/api/meters/${m}/`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
        body: JSON.stringify({ current_reading: 0 }),
      })
      return x.status
    }, { m, csrf })
    console.log(`  reset meter ${m} counter -> ${res}`)
  }

  // 3. reopen the shift so the corrected cycle can be closed again
  const res = await page.evaluate(async ({ name, csrf }) => {
    const x = await fetch(`/api/shifts/${name}/`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
      body: JSON.stringify({ status: 'open' }),
    })
    return x.status
  }, { name: BAD_SHIFT, csrf })
  console.log(`  shift ${BAD_SHIFT} -> open (${res})`)

  const after = await apiGet(page, 'meter-readings/')
  console.log(`readings left on ${BAD_SHIFT}: ${(after.results || []).filter((x) => x.shift === BAD_SHIFT).length}`)
  const recAfter = await apiGet(page, 'reconciliations/')
  console.log(`reconciliations for ${BAD_SHIFT}: ${(recAfter.results || []).filter((x) => x.shift === BAD_SHIFT).length}`)

  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })