// ROUND 4 FIXTURE — two isolated stations used by the adversarial suites.
//
//   «QA R4 أ»  cycle 11:00 · two بنزين tanks (the same-fuel transfer path)
//   «QA R4 ب»  cycle 10:30 · one بنزين + one ديزل tank (isolation + cross-fuel)
//
// Nothing outside these two stations is created or modified: the stations are
// resolved by name, re-used if they already exist, and every tank/level write
// targets a doc that was looked up under that station.
const { launch, uiLogin, step, summary, apiGet, apiPut, apiPost, qaStationId } = require('./qa')

const A = 'QA R4 أ'
const B = 'QA R4 ب'

const SPEC = {
  [A]: {
    cycle: '11:00:00',
    tanks: [
      { fuel_type: 'بنزين', capacity: 30000, tank_name: 'خزان أ بنزين 1' },
      { fuel_type: 'بنزين', capacity: 20000, tank_name: 'خزان أ بنزين 2' },
    ],
    levels: [20000, 0],
  },
  [B]: {
    cycle: '10:30:00',
    tanks: [
      { fuel_type: 'بنزين', capacity: 25000, tank_name: 'خزان ب بنزين' },
      { fuel_type: 'ديزل', capacity: 15000, tank_name: 'خزان ب ديزل' },
    ],
    levels: [12000, 5000],
  },
}

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  for (const [name, spec] of Object.entries(SPEC)) {
    let id = await qaStationId(page, name)
    if (!id) {
      const created = await apiPost(page, 'setup-station/', {
        station: {
          station_name: name, address: 'QA — محطة معزولة للجولة الرابعة',
          relationship_type: 'owned', status: 'active', day_close_time: spec.cycle,
        },
        islands: [{ machines: 1, meters: 1 }],
        tanks: spec.tanks,
      })
      id = (created && (created.station || (created.message || {}).station)) || null
      step(`station «${name}» created`, !!id, String(id || JSON.stringify(created).slice(0, 160)))
    } else {
      const upd = await apiPut(page, `stations/${id}/`, { day_close_time: spec.cycle })
      step(`station «${name}» re-used, cycle set to ${spec.cycle}`, upd && !upd.__status,
        upd && upd.__status ? `HTTP ${upd.__status}` : id)
    }
    if (!id) continue

    // the cycle must really be the station's own persisted value
    const rows = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
    const me = rows.find((s) => s.name === id)
    step(`«${name}» day_close_time = ${spec.cycle}`, String(me.day_close_time).slice(0, 5) === spec.cycle.slice(0, 5),
      String(me.day_close_time))

    // tanks: resolve by name under THIS station, then set the known opening level
    const tanks = ((await apiGet(page, `tanks/?station=${id}&limit_page_length=0`)).results || [])
      .filter((t) => t.station === id)
    step(`«${name}» has ${spec.tanks.length} tank(s)`, tanks.length === spec.tanks.length,
      tanks.map((t) => `${t.tank_name}/${t.fuel_type}/${t.capacity}`).join(' · '))
    for (let i = 0; i < spec.tanks.length; i++) {
      const want = spec.tanks[i]
      const t = tanks.find((x) => x.tank_name === want.tank_name)
      if (!t) { step(`tank «${want.tank_name}» found`, false, 'MISSING'); continue }
      const r = await apiPut(page, `tanks/${t.name}/`, { current_level: spec.levels[i] })
      step(`opening level of «${want.tank_name}» = ${spec.levels[i]}`,
        !r.__status && Number(r.current_level) === spec.levels[i],
        r.__status ? `HTTP ${r.__status}` : String(r.current_level))
    }
  }

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
