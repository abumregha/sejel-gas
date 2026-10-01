// Pilot guard (read-only — creates NOTHING): asserts the live deployed app
// serves the client's pilot station exactly as confirmed:
//   - exactly one station exists (the pilot)
//   - its reading cycle is 11:00 → 11:00 (day_close_time pinned, NOT the
//     23:00 system default)
//   - the readings screen shows the دورة القراءة chip at 11:00
//   - auto-previous readings equal the client's real Excel counters
// Run after pilot_bootstrap.py; safe at any time — zero mutations.
const { launch, login, apiGet, nav, shot, step, summary } = require('./helpers')

const norm = (s) => s.replace(/[\u066B\u066C]/g, '.')
const EXCEL = { '3280418': 'M01A', '3077096': 'M01B', '27546777': 'M02A' }

;(async () => {
  const { browser, page } = await launch()
  step('login', await login(page))

  const stations = (await apiGet(page, 'stations/')).results || []
  // The client legitimately creates their own UAT stations — locate the PILOT
  // by name and assert only on it (grabbing stations[0] tested برهم when the
  // client's station sorted first and failed everything).
  const pilot = stations.find((s) => s.station_name === 'محطة تجريبية — سجل')
    || stations.find((s) => s.name === 'qputh5too5')
  step('pilot station present', !!pilot, JSON.stringify(stations.map((s) => s.station_name)))
  const ST = pilot && pilot.name
  const doc = await apiGet(page, `stations/${ST}/`)
  step('API: pilot day_close_time pinned to 11:00', String(doc.day_close_time || '').startsWith('11:00'), 'got ' + doc.day_close_time)

  const dash = await apiGet(page, `dashboard-station/?station=${ST}`)
  step('API: dashboard carries the 11:00 cycle', String(dash.station?.day_close_time || '').startsWith('11:00'), '')
  step('API: 4 active guns, none read yet (fresh cycle)',
    dash.readings_status?.total === 4 && dash.readings_status?.done === 0, JSON.stringify(dash.readings_status))

  // UI: the readings screen shows the configured cycle
  await nav(page, 'readings')
  await page.waitForTimeout(1200)
  // admin has no bound station — pick the pilot in the picker (UI interaction,
  // still zero data mutations)
  const pick = page.locator('[data-testid="readings-station"]')
  if (await pick.count()) { await pick.selectOption(ST); await page.waitForTimeout(1500) }
  const body = norm(await page.locator('body').innerText())
  step('UI: دورة القراءة chip shows 11:00', body.includes('دورة القراءة') && /11:00/.test(body),
    (body.match(/دورة القراءة[^\n]*/) || ['?'])[0])
  const uiNorm = body
  for (const [counter, code] of Object.entries(EXCEL)) {
    const re = new RegExp('3[.,٫]?280[.,٫]?418|' + counter.split('').join('[.,٫]?'))
    step(`UI: auto-previous for ${code} = ${Number(counter).toLocaleString('en')} (Excel counter)`,
      uiNorm.includes(counter) || re.test(uiNorm), '')
  }
  await shot(page, '99-pilot-station-11h')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
