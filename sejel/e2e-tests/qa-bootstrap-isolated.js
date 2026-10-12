// qa-bootstrap-isolated.js — base fixtures for the legacy suites, created on a
// DISPOSABLE site only.
//
// The 15 suites were written against the pilot site and read a few records that
// predate them: the pilot station «محطة تجريبية», its meters' seeded counters,
// and the two logins they use. This script recreates exactly that base on an
// isolated site so the suites can run there — the customer's site is never a
// target.
//
// Hard rules enforced here:
//   · it REFUSES to run unless the target is provably the disposable site;
//   · it is idempotent (re-running creates nothing twice);
//   · it creates BASE DATA only. Every workflow a suite verifies still happens
//     through the browser inside that suite.
//
// Usage:  QA_BASE=http://localhost:8007 node qa-bootstrap-isolated.js
const { launch, apiGet, apiPost, apiPut, shot } = require('./helpers')
const { uiLogin } = require('./qa.js')

const REQUIRED_BASE = 'http://localhost:8007'
const PILOT = 'محطة تجريبية'
const PILOT_LOG = 'محطة تجريبية — سجل'
const PILOT_COUNTERS = { M01A: 3280418, M01B: 3077096, M02A: 27546777, M02B: 0 }
const CUSTOMER_STATION = 'محطة الراحلة 23'

let created = 0
let reused = 0

async function ensureOne(page, resource, matcher, payload, label) {
  const list = await apiGet(page, `${resource}/?limit_page_length=0`)
  const rows = list.results || list
  if (Array.isArray(rows)) {
    const hit = rows.find(matcher)
    if (hit) { reused++; console.log(`  · reuse  ${label}`); return hit }
  }
  const res = await apiPost(page, `${resource}/`, payload)
  if (res.__status && res.__status >= 400) {
    console.log(`  ! FAILED ${label}: HTTP ${res.__status} ${res.__exc || ''}`)
    return null
  }
  created++
  console.log(`  + create ${label}`)
  return res
}

async function proveIsolated(page) {
  const problems = []
  if ((process.env.QA_BASE || '').replace(/\/$/, '') !== REQUIRED_BASE) {
    problems.push(`QA_BASE must be ${REQUIRED_BASE} (got "${process.env.QA_BASE || 'unset'}")`)
  }
  // the disposable site must NOT know the customer's station
  const stations = await apiGet(page, 'stations/?limit_page_length=0')
  const rows = stations.results || stations
  if (Array.isArray(rows) && rows.some((s) => (s.station_name || '').trim() === CUSTOMER_STATION)) {
    problems.push(`target still contains the customer's station «${CUSTOMER_STATION}» — this is NOT the disposable site`)
  }
  if (problems.length) {
    console.error('ABORT — cannot prove the target is the isolated site:')
    problems.forEach((p) => console.error('   • ' + p))
    process.exit(2)
  }
  console.log(`isolation proven: base=${REQUIRED_BASE}, customer station absent`)
}

async function pilotStation(page, name) {
  const list = await apiGet(page, 'stations/?limit_page_length=0')
  const stations = list.results || list
  const hit = (stations || []).find((s) => (s.station_name || '').trim() === name)
  if (hit) { reused++; console.log(`  · reuse  station «${name}»`); return hit }
  return ensureOne(page, 'stations', () => false, {
    station_name: name,
    day_close_time: '11:00:00',
    relationship_type: 'owned',
    address: 'معازل',
  }, `station «${name}»`)
}

// The pilot station's island/pumps/meters/tanks. The readings suites read
// M01A/M01B/M02A/M02B and their counters; on a clean site the station exists
// with no guns, so every downstream assertion fails on "no guns listed".
// This is BASE DATA — the journeys themselves still run in the suites.
async function ensurePilotGuns(page, stationName) {
  const list = await apiGet(page, 'stations/?limit_page_length=0')
  const station = ((list.results || list) || []).find((s) => (s.station_name || '').trim() === stationName)
  if (!station) return null

  if (String(station.day_close_time || '').slice(0, 5) !== '11:00') {
    await apiPut(page, `stations/${station.name}/`, { day_close_time: '11:00:00' })
    console.log('  ~ set    «' + stationName + '» cycle -> 11:00')
  }

  const fuels = await apiGet(page, 'fuel-types/?limit_page_length=0')
  const petrol = ((fuels.results || fuels) || []).find((f) => f.fuel_name === 'بنزين')
  const diesel = ((fuels.results || fuels) || []).find((f) => f.fuel_name === 'ديزل')

  let island = await ensureOne(page, 'islands', (i) => i.station === station.name && i.island_name === 'جزيرة 1',
    { island_name: 'جزيرة 1', station: station.name, number: 1 }, `island at «${stationName}»`)
  if (!island) return station

  const pumps = {}
  for (const n of [1, 2]) {
    pumps[n] = await ensureOne(page, 'machines', (m) => m.station === station.name && m.machine_name === `مضخة ${n}`,
      { machine_name: `مضخة ${n}`, island: island.name, station: station.name, number: n }, `pump ${n} at «${stationName}»`)
  }

  const tanks = {}
  // «خزان 1» / «خزان 2» are the names the transfer suite selects by
  for (const [fuel, tankName] of [[petrol, 'خزان 1'], [diesel, 'خزان 2']]) {
    if (!fuel) continue
    tanks[fuel.name] = await ensureOne(page, 'tanks', (t) => t.station === station.name && t.tank_name === tankName,
      { tank_name: tankName, station: station.name, fuel_type: fuel.name, capacity: 20000, current_level: 15000 },
      `tank ${tankName} at «${stationName}»`)
  }

  for (const [code, counter] of Object.entries(PILOT_COUNTERS)) {
    const pump = Number(code.slice(1, 3))
    const letter = code.slice(3)
    const fuel = letter === 'A' ? petrol : diesel
    const meter = await ensureOne(page, 'meters', (m) => m.meter_code === code && m.machine === (pumps[pump] || {}).name,
      {
        meter_code: code, machine: (pumps[pump] || {}).name, fuel_type: (fuel || {}).name,
        tank: (tanks[(fuel || {}).name] || {}).name, current_reading: counter, status: 'active',
      }, `meter ${code} at «${stationName}»`)
    if (meter && Number(meter.current_reading) !== counter) {
      await apiPut(page, `meters/${meter.name}/`, { current_reading: counter })
      console.log(`  ~ set    ${code} counter -> ${counter}`)
    }
  }
  return station
}

async function seedPilotCounters(page, stationName) {
  const station = await pilotStation(page, stationName)
  if (!station) return
  const machines = await apiGet(page, `machines/?station=${station.name}&limit_page_length=0`)
  const myMachines = new Set(((machines.results || machines) || []).map((m) => m.name))
  const meters = await apiGet(page, 'meters/?limit_page_length=0')
  const own = ((meters.results || meters) || []).filter((m) => myMachines.has(m.machine))
  if (!own.length) {
    console.log(`  ! «${stationName}» has no meters — run qa-round4-fixture (it builds them through the wizard) first`)
    return
  }
  for (const [code, counter] of Object.entries(PILOT_COUNTERS)) {
    const meter = own.find((m) => m.meter_code === code)
    if (!meter) { console.log(`  · skip   ${code} not at «${stationName}»`); continue }
    if (Number(meter.current_reading) === counter) { reused++; continue }
    await apiPut(page, `meters/${meter.name}/`, { current_reading: counter })
    console.log(`  ~ set    ${code} counter -> ${counter}`)
    created++
  }
}

;(async () => {
  if (!process.env.QA_BASE) {
    console.error('ABORT — QA_BASE is not set. This script only runs against the disposable site.')
    process.exit(2)
  }
  const { browser, page } = await launch()
  // helpers.login() hardcodes the pilot admin login, which only exists on the
  // disposable site after this script runs — log in with the site's own admin.
  if (!await uiLogin(page, 'administrator', 'QaBrowserTest#2026')) {
    console.error('ABORT — cannot log in to the disposable site as its administrator')
    await browser.close()
    process.exit(2)
  }
  await proveIsolated(page)

  console.log('\nlogins the suites use')
  // NB: nobody@sejel.ly is deliberately NOT created — the isolation suite
  // expects a login for it to FAIL.
  for (const u of [
    { email: 'admin@sejel.ly', pwd: 'admin123', role: 'admin' },
    { email: 'owner@sejel.ly', pwd: 'owner123', role: 'manager' },
    { email: 'qa-r4-fin@sejel.ly', pwd: 'QaR4Fin2026!x', role: 'finance' },
  ]) {
    const list = await apiGet(page, 'users/?limit_page_length=0')
    const rows = list.results || list
    if (!(rows || []).some((x) => (x.email || x.name) === u.email)) {
      const res = await apiPost(page, 'users/', { email: u.email, first_name: u.email.split('@')[0], role: u.role })
      if (res.__status && res.__status >= 400) console.log(`  ! FAILED user ${u.email}: HTTP ${res.__status} ${res.__exc || ''}`)
      else { created++; console.log(`  + create user ${u.email} (${u.role})`) }
    } else { reused++; console.log(`  · reuse  user ${u.email}`) }
    await page.evaluate(async ({ u: un, p }) => {
      const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
      const csrf = (me.message || me).csrf_token
      await fetch('/api/auth/set-user-password/', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
        body: JSON.stringify({ username: un, new_password: p }),
      })
    }, { u: u.email, p: u.pwd })
  }

  console.log('\nreference data')
  await ensureOne(page, 'fuel-types', (f) => f.fuel_name === 'بنزين', { fuel_name: 'بنزين', fuel_name_en: 'Petrol', is_active: 1 }, 'fuel type بنزين')
  await ensureOne(page, 'fuel-types', (f) => f.fuel_name === 'ديزل', { fuel_name: 'ديزل', fuel_name_en: 'Diesel', is_active: 1 }, 'fuel type ديزل')
  for (const value of [5, 6, 7, 8]) {
    await ensureOne(page, 'voucher-categories', (c) => Number(c.value) === value,
      { category_name: `${value} د.ل`, value, is_active: 1 }, `voucher category ${value} د.ل`)
  }
  for (const name of ['صيانة', 'رواتب', 'وقود', 'إيجار']) {
    await ensureOne(page, 'expense-categories', (c) => c.category_name === name,
      { category_name: name, is_active: 1 }, `expense category ${name}`)
  }
  const fuels = await apiGet(page, 'fuel-types/?limit_page_length=0')
  for (const fuel of ((fuels.results || fuels) || []).filter((f) => ['بنزين', 'ديزل'].includes(f.fuel_name))) {
    const prices = await apiGet(page, `fuel-prices/?fuel_type=${fuel.name}&limit_page_length=0`)
    const rows = prices.results || prices
    // the legacy suites assert their arithmetic against the pilot's documented
    // 0.15 د.ل/لتر, so the disposable site uses the same price
    const selling = 0.15
    if (!Array.isArray(rows) || !rows.length) {
      await ensureOne(page, 'fuel-prices', () => false, {
        fuel_type: fuel.name, selling_price: selling, cost_per_liter: selling - 0.4,
        effective_date: '2026-01-01', is_active: 1,
      }, `fuel price ${fuel.fuel_name}`)
    } else { reused++; console.log(`  · reuse  fuel price ${fuel.fuel_name}`) }
  }

  console.log('\npilot stations (base data the legacy suites read)')
  for (const name of [PILOT, PILOT_LOG]) {
    await ensurePilotGuns(page, name)
    await seedPilotCounters(page, name)
  }

  await shot(page, 'qa-bootstrap-isolated')
  console.log(`\nbootstrap complete — created/updated: ${created}, reused: ${reused}`)
  console.log('next: qa-create-acceptance-station.js (acceptance station the cycle/exceptions suites read)')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
