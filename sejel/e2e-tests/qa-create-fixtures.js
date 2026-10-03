// Recreate the QA fixture the suite depends on: the pilot station «محطة تجريبية»
// with its original 4 meters, counters and 11:00 day-close cycle.
//
// After the authorised full wipe (qa-wipe-data.js) the system is virgin; several
// phases read this station by name and its known opening counters, so it is
// rebuilt exactly as it was before the wipe.
const { launch, uiLogin, step, summary, apiGet } = require('./qa')

const BASE = 'http://localhost:8004'
const PILOT = 'محطة تجريبية — سجل'

// original opening counters (litre) — these drive every readings assertion
const METERS = [
  { code: 'M01A', counter: 3280418, fuel: 'بنزين' },
  { code: 'M01B', counter: 3077096, fuel: 'بنزين' },
  { code: 'M02A', counter: 27546777, fuel: 'ديزل' },
  { code: 'M02B', counter: 0, fuel: 'ديزل' },
]

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const csrf = await page.evaluate(async () =>
    (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token)

  const call = (method, url, body) => page.evaluate(async ({ method, url, body, csrf }) => {
    const r = await fetch(url, {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
      body: body ? JSON.stringify(body) : undefined,
    })
    return { status: r.status, json: await r.json().catch(() => ({})) }
  }, { method, url, body, csrf })

  // 1. the station, on an 11:00→11:00 cycle.
  //    Idempotent: if it already exists, reuse it — the counters below are then
  //    restored, which is what the suite needs after any run that saved
  //    readings (Meter.current_reading follows the last reading, and a deleted
  //    reading rolls it back to 0, which would make every later reading look
  //    like a first-ever baseline).
  const existing = ((await apiGet(page, 'stations/?limit_page_length=0')).results || [])
    .find((x) => (x.station_name || '').trim() === PILOT)
  let stationId = existing ? existing.name : null
  if (stationId) {
    step('pilot station already exists — reusing it', true, stationId)
    const upd = await call('PUT', `/api/stations/${stationId}/`, { day_close_time: '11:00:00' })
    step('pilot cycle restored to 11:00', upd.status === 200, `HTTP ${upd.status}`)
  } else {
    const setup = await call('POST', '/api/setup-station/', {
      station: {
        station_name: PILOT, address: 'الطريق العام — تجريبي',
        relationship_type: 'owned', status: 'active', day_close_time: '11:00:00',
      },
      islands: [{ machines: 2, meters: 1 }, { machines: 2, meters: 1 }],
      tanks: [
        { fuel_type: 'بنزين', capacity: 30000, tank_name: 'خزان 1' },
        { fuel_type: 'ديزل', capacity: 15000, tank_name: 'خزان 2' },
      ],
    })
    stationId = (setup.json.message || setup.json).station
    step('pilot station created', !!stationId, `${stationId} (HTTP ${setup.status})`)
  }

  // 2. relabel the pilot's own meters back to M01A/M01B/M02A/M02B with their
  //    original counters — the suite asserts against these exact values.
  //    Scoped to THIS station: Meter has no station column, so ownership is
  //    resolved through island → machine.
  const pilIslands = ((await apiGet(page, `islands/?station=${stationId}`)).results || []).map((i) => i.name)
  const pilMachines = ((await apiGet(page, `machines/?station=${stationId}`)).results || [])
    .filter((m) => pilIslands.includes(m.island)).map((m) => m.name)
  const meters = (await apiGet(page, 'meters/?limit_page_length=0')).results || []
  const edge = meters.filter((m) => pilMachines.includes(m.machine))
  const target = [...edge].sort((a, b) => a.meter_code.localeCompare(b.meter_code))
  step('pilot owns exactly the 4 test meters', target.length === 4, target.map((m) => m.meter_code).join(','))
  for (let i = 0; i < Math.min(target.length, METERS.length); i++) {
    const m = target[i]
    const spec = METERS[i]
    const res = await call('PUT', `/api/meters/${m.name}/`, {
      meter_code: spec.code, current_reading: spec.counter, fuel_type: spec.fuel,
    })
    step(`meter ${spec.code} set to ${spec.counter.toLocaleString('en-US')}`,
      res.status === 200, `HTTP ${res.status}`)
  }

  // 3. prove it back through the API
  const check = (await apiGet(page, 'meters/')).results || []
  console.log('\nfinal meter state:')
  check.forEach((m) => console.log(`  ${m.meter_code.padEnd(6)} ${m.fuel_type}  ${Number(m.current_reading).toLocaleString('en-US')}`))
  const stations = (await apiGet(page, 'stations/')).results || []
  stations.forEach((s) => console.log(`  station: ${s.station_name} — day close ${s.day_close_time}`))

  summary('qa-create-fixtures')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })