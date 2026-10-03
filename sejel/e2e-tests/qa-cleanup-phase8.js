// Cleanup after the QA-32 investigation: the Phase-8 run booked 807,849 L on the
// QA Edge station's 2026-10-04 day-close shift (the bug). Remove those inflated
// readings and the reconciliation built from them so the station can be re-run
// cleanly and the corrected arithmetic verified.
//
// Deliberately does NOT touch the pilot or «برهم» data.
const { apiGet, launch, uiLogin } = require('./qa')

const EDGE = 'ljkius0tlj'      // QA Edge Station
const BAD_SHIFT = '965o92elqn'  // 2026-10-04 day-close shift from the Phase-8 run

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const readings = await apiGet(page, 'meter-readings/')
  const bad = (readings.results || []).filter((r) => r.shift === BAD_SHIFT)
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
  const recs = await apiGet(page, 'reconciliations/')
  for (const rec of (recs.results || []).filter((x) => x.shift === BAD_SHIFT)) {
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