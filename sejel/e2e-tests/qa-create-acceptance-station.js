// Round 3 / PART 6 fixture — an ISOLATED station used only for the
// new-employee acceptance walkthrough.
//
// Nothing here touches the pilot station or any client/UAT row: it creates a
// brand-new station «QA موظف جديد», three guns (two with known counters and
// one brand-new gun that has never been read), and one real station-employee
// login bound to it. Re-running it is safe (it re-uses the station if it
// already exists).
const { launch, uiLogin, step, summary, apiGet } = require('./qa')

const BASE = 'http://localhost:8004'
const STATION = 'QA موظف جديد'
const GUNS = [
  { code: 'QA01A', counter: 500000 },
  { code: 'QA01B', counter: 300000 },
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

  // 1. the station: one island, one pump, two guns, 11:00→11:00 cycle
  let stations = (await apiGet(page, 'stations/')).results || []
  let station = stations.find((s) => s.station_name === STATION)
  if (!station) {
    const setup = await call('POST', '/api/setup-station/', {
      station: {
        station_name: STATION, address: 'QA — معزولة للاختبار',
        relationship_type: 'owned', status: 'active', day_close_time: '11:00:00',
      },
      islands: [{ machines: 1, meters: 2 }],
      tanks: [{ fuel_type: 'بنزين', capacity: 30000, tank_name: 'خزان QA' }],
    })
    station = { name: (setup.json.message || setup.json).station }
    step('acceptance station created', !!station.name, station.name)
  } else {
    step('acceptance station already exists', true, station.name)
  }

  // 2. known counters so the employee reads predictable numbers.
  //    Scope strictly to THIS station's guns (island→pump→gun tree from the
  //    dashboard endpoint) — never touch another station's meters.
  const payload = (await apiGet(page, `dashboard-station/?station=${encodeURIComponent(station.name)}`))
  const guns = []
  for (const isl of payload.islands || []) for (const mach of isl.machines || []) guns.push(...(mach.meters || []))

  // The third gun exists so the exception matrix can test the "brand new gun,
  // no counter yet" case (QA-32) every run without creating hardware on the fly:
  // Meter is deliberately not deletable through the API, so a per-run fixture
  // would be permanent clutter.
  if (guns.length < 3) {
    const tank = (await apiGet(page, `tanks/?station=${encodeURIComponent(station.name)}`)).results?.[0]
    const machine = (payload.islands || []).flatMap((i) => i.machines || [])[0]
    for (let i = guns.length; i < 3; i++) {
      const res = await call('POST', '/api/meters/', {
        machine: machine.id, meter_code: `QA01${String.fromCharCode(65 + i)}`,
        fuel_type: 'بنزين', tank: tank.name, status: 'active',
      })
      step(`extra gun QA01${String.fromCharCode(65 + i)} created`, res.status < 400, `HTTP ${res.status}`)
    }
  }
  const payload2 = (await apiGet(page, `dashboard-station/?station=${encodeURIComponent(station.name)}`))
  guns.length = 0
  for (const isl of payload2.islands || []) for (const mach of isl.machines || []) guns.push(...(mach.meters || []))
  step('station has the 3 test guns', guns.length === 3, `found ${guns.length}`)
  const ordered = guns.sort((a, b) => String(a.gun_letter).localeCompare(String(b.gun_letter)))
  // Only the first two get counters; the third stays at 0 so the matrix always
  // has a genuine first-reading case.
  for (let i = 0; i < Math.min(ordered.length, GUNS.length); i++) {
    const res = await call('PUT', `/api/meters/${ordered[i].id}/`, {
      current_reading: GUNS[i].counter, fuel_type: 'بنزين',
    })
    step(`gun ${ordered[i].gun_letter} starts at ${GUNS[i].counter}`,
      res.status === 200, `HTTP ${res.status} ${JSON.stringify(res.json).slice(0, 80)}`)
  }

  // 3. a real station employee, bound to this station only
  const created = await page.evaluate(async ({ station, csrf }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    const token = ((await me.json()).message || {}).csrf_token || csrf
    const r = await fetch('/api/users/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': token },
      body: JSON.stringify({
        email: 'emp@sejel.ly', first_name: 'موظف المحطة',
        password: 'Sejel-QA-2026', role: 'supervisor', station,
      }),
    })
    return { status: r.status, json: await r.json().catch(() => ({})) }
  }, { station: station.name, csrf })
  step('employee account emp@sejel.ly', created.status < 400 || /exists|already/i.test(JSON.stringify(created.json)),
    `HTTP ${created.status} ${JSON.stringify(created.json).slice(0, 300)}`)

  // If it already existed, make sure it is (still) bound to this station.
  if (created.status >= 400) {
    const upd = await call('PUT', '/api/users/emp@sejel.ly/', { station: station.name })
    step('employee bound to the acceptance station', upd.status === 200,
      `HTTP ${upd.status} ${JSON.stringify(upd.json).slice(0, 80)}`)
  }

  // 4. fuel price so the day can actually be closed later
  const prices = await page.evaluate(async ({ station, csrf }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    const token = ((await me.json()).message || {}).csrf_token || csrf
    const r = await fetch('/api/fuel-prices/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': token },
      body: JSON.stringify({ station, fuel_type: 'بنزين', selling_price: 0.15, cost_per_liter: 0.12, effective_date: new Date().toISOString().slice(0, 10) }),
    })
    return { status: r.status, json: await r.json().catch(() => ({})) }
  }, { station: station.name, csrf })
  step('fuel price configured', prices.status < 400, `HTTP ${prices.status}`)

  console.log('\nstation:', station.name)
  ordered.forEach((m) => console.log(`  مسدس ${m.gun_letter} ${m.id} ${m.fuel_type} ${Number(m.current_reading).toLocaleString('en-US')}`))

  summary('qa-create-acceptance-station')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })