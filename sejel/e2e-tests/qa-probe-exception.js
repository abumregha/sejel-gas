// PROBE (not a test phase): capture the exact backend response body for
// 1) exception reading save (negative end_reading + exception_type + notes)
// 2) decimal reading save (100.25)
// so the defect report can quote the real server message.
const { appendRun, uiLogin, step, summary, launch } = require('./qa')

const BASE2 = 'http://localhost:8004'
const EDGE = 'QA Edge Station'

async function raw(page, url, body) {
  return page.evaluate(async ({ u, b }) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    const meMsg = (await me.json()).message || {}
    const r = await fetch('/api/' + u, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': meMsg.csrf_token || '' },
      body: b ? JSON.stringify(b) : undefined,
    })
    const text = await r.text()
    let j = {}
    try { j = JSON.parse(text) } catch (e) { return { __status: r.status, __raw: text.slice(0, 400) } }
    return { __status: r.status, body: j }
  }, { u: url, b: body })
}

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'owner@sejel.ly', 'owner123')
  await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  const edge = await page.evaluate(async (name) => {
    const me = await fetch('/api/auth/me/', { credentials: 'include' })
    const t = ((await me.json()).message || {}).csrf_token || ''
    const s = await fetch('/api/stations/', { credentials: 'include' })
    const sj = (await s.json()).results || []
    const st = sj.find((x) => (x.station_name || '').trim() === name) || null
    if (!st) return null
    const sh = await fetch('/api/shifts/?station=' + st.name, { credentials: 'include' })
    const shifts = (await sh.json()).results || []
    const g = await fetch('/api/meter-readings/', { credentials: 'include', headers: { 'X-Frappe-CSRF-Token': t } })
    void g
    return { station: st.name, shifts: shifts.map((x) => ({ name: x.name, date: x.date, status: x.status })) }
  }, EDGE)
  appendRun('Probe: edge station context', JSON.stringify(edge))

  const shiftName = edge && edge.shifts.length ? edge.shifts[0].name : null
  const meters = await page.evaluate(async (stn) => {
    const d = await fetch('/api/dashboard-station/?station=' + stn + '&date=' + new Date().toISOString().slice(0, 10), { credentials: 'include' })
    const j = (await d.json()).message || {}
    const out = []
    for (const isl of j.islands || []) for (const m of isl.machines || []) for (const mm of m.meters || [])
      out.push({ code: mm.meter_code, id: mm.id, reading: !!mm.reading })
    return out
  }, edge.station)
  appendRun('Probe: edge meters', JSON.stringify(meters))

  if (shiftName && meters.length) {
    // 1) exception save
    const r1 = await raw(page, 'meter-readings/', {
      shift: shiftName, meter: meters[0].id, start_reading: 0, end_reading: -5,
      exception_type: 'reset', notes: 'اختبار استثناء QA', source: 'manual',
    })
    appendRun('Probe A: exception reading POST', JSON.stringify(r1, null, 1))
    step('Exception reading POST status', r1.__status === 200 || r1.__status === 201, 'status=' + r1.__status)

    // 2) decimal save on a different meter
    if (meters[1]) {
      const r2 = await raw(page, 'meter-readings/', {
        shift: shiftName, meter: meters[1].id, start_reading: 0, end_reading: 100.25, source: 'manual',
      })
      appendRun('Probe B: decimal reading POST', JSON.stringify(r2, null, 1))
      step('Decimal reading POST status', r2.__status === 200 || r2.__status === 201, 'status=' + r2.__status)
    }

    // 3) plain good reading (control)
    if (meters[2]) {
      const r3 = await raw(page, 'meter-readings/', {
        shift: shiftName, meter: meters[2].id, start_reading: 0, end_reading: 50, source: 'manual',
      })
      appendRun('Probe C: normal reading POST (control)', JSON.stringify(r3, null, 1))
      step('Normal reading POST status', r3.__status === 200 || r3.__status === 201, 'status=' + r3.__status)
    }
  }

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })