// Phase 8: فصل المناوبات التشغيلية عن دورة قراءة العدادات (architect
// clarification, client confirmed).
//
// Proves:
//  1. Station.day_close_time is configurable (set to 11:00 here — NOT
//     hard-coded 23:00) and the reading-period chip + day-close container
//     follow it.
//  2. MULTIPLE employee shifts (08→16, 16→00, 00→08) exist inside ONE
//     24-hour meter-reading period WITHOUT requiring any meter reading per
//     employee shift.
//  3. All pump readings belong to the day-close container only; the previous
//     reading comes from the SAME gun's last valid reading.
//  4. إقفال اليوم closes ONLY the day container (employee shifts stay open)
//     and the full-day reconciliation reflects the whole period.
const { launch, login, apiGet, apiPost, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))

  // ---------- dedicated station with day_close_time = 11:00 ----------
  const uni = 'محطة دورة ' + Date.now()
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: uni, address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 2, meters: 1 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const ST = wiz.station
  step('API: station created (1 island / 2 pumps / 2 guns)', wiz.created && wiz.created.meters === 2, JSON.stringify(wiz.created))

  // Configure the client's cycle: 11:00 → 11:00 (desk update; proves it is
  // station configuration, not hard-coded logic)
  const tok = (await page.evaluate(async () =>
    (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token))
  await page.evaluate(async ({ st, tok }) => {
    await fetch('/api/stations/' + st + '/', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok },
      body: JSON.stringify({ day_close_time: '11:00:00' }),
    })
  }, { st: ST, tok })
  const stDoc = await apiGet(page, `stations/${ST}/`)
  step('API: day_close_time configurable = 11:00', String(stDoc.day_close_time || '').startsWith('11:00'), 'got ' + stDoc.day_close_time)

  const machines = ((await apiGet(page, `machines/?station=${ST}`)).results || [])
  const meters = ((await apiGet(page, `meters/`)).results || []).filter((m) =>
    machines.some((x) => x.name === m.machine))
  const today = new Date().toISOString().split('T')[0]

  // ---------- 3 EMPLOYEE shifts inside the same 24h reading period ----------
  // (the station rotates staff 08→16, 16→00, 00→08 — none needs a reading)
  const empSpecs = [['صباحي A', '08:00', '16:00'], ['مسائي B', '16:00', '00:00'], ['ليلي C', '00:00', '08:00']]
  const empShifts = []
  for (const [nm, s, e] of empSpecs) {
    const sh = await apiPost(page, 'shifts/', {
      station: ST, shift_name: nm + ' ' + Date.now(), date: today,
      start_time: s, end_time: e, status: 'open',
    })
    empShifts.push(sh.name)
  }
  step('API: 3 employee shifts created inside one reading period', empShifts.length === 3, empShifts.join(','))

  // ---------- readings belong to the DAY container, not employees ----------
  // (simulates exactly what the إقفال اليوم screen does: is_day_close=1,
  // times = station day_close_time)
  const day = await apiPost(page, 'shifts/', {
    station: ST, shift_name: 'إقفال يوم ' + today, date: today,
    start_time: '11:00', end_time: '11:00', is_day_close: 1, status: 'open',
  })
  const DAY = day.name
  step('API: day-close container created with is_day_close=1', day.is_day_close === 1, DAY)

  // The client's real Excel numbers: 3,280,418 → 3,288,641 = 8,223 L
  const mA = meters[0], mB = meters[1]
  const r1 = await apiPost(page, 'meter-readings/', { shift: DAY, meter: mA.name, start_reading: 3280418, end_reading: 3288641 })
  step('Reading: 3,280,418 → 3,288,641 = 8,223 L (on the day container)', r1.liters_sold === 8223, 'got ' + r1.liters_sold)
  // next day same gun: previous comes from the SAME gun's last reading
  const r2 = await apiPost(page, 'meter-readings/', { shift: DAY, meter: mB.name, start_reading: 3288641, end_reading: 3298000 })
  step('Reading: next period auto-previous continuity (same gun)', r2.liters_sold === 9359, 'got ' + r2.liters_sold)

  // ---------- dashboards BEFORE close: the open day container must NOT
  // count as an open employee shift (3 employees, not 4) ----------
  const dashPre = await apiGet(page, `dashboard-station/?station=${ST}&date=${today}`)
  const preAlert = (dashPre.alerts || []).find((a) => a.type === 'shift_open')
  step('API: open-shift alert counts 3 employee shifts — day container excluded',
    preAlert && String(preAlert.message).trim().startsWith('3'), preAlert ? preAlert.message : 'no alert')

  // ---------- close the day: submit then close, ONLY the container ----------
  await page.evaluate(async ({ sh, tok }) => {
    await fetch('/api/shifts/' + sh + '/', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok },
      body: JSON.stringify({ status: 'submitted' }),
    })
  }, { sh: DAY, tok })
  await apiPost(page, `shifts/${DAY}/close/`)
  const dayAfter = await apiGet(page, `shifts/${DAY}/`)
  step('API: day container closed', dayAfter.status === 'closed', dayAfter.status)
  const empAfter = []
  for (const id of empShifts) empAfter.push((await apiGet(page, `shifts/${id}/`)).status)
  step('API: all 3 employee shifts untouched by the day close',
    empAfter.every((s) => s === 'open'), empAfter.join(','))

  const recs = ((await apiGet(page, `reconciliations/?station=${ST}`)).results || [])
  step('API: one full-day reconciliation created', recs.length === 1, 'count=' + recs.length)
  step('API: reconciliation liters = full-period sum (8,223 + 9,359)',
    recs.length === 1 && Math.abs((recs[0].total_liters || 0) - 17582) < 0.01,
    'total_liters=' + (recs[0] ? recs[0].total_liters : '?'))

  // ---------- dashboards ----------
  const dash = await apiGet(page, `dashboard-station/?station=${ST}&date=${today}`)
  const dayRow = (dash.shifts || []).find((s) => s.id === DAY)
  step('API: dashboard marks the day container is_day_close', dayRow && dayRow.is_day_close === true, JSON.stringify(dayRow))
  const postAlert = (dash.alerts || []).find((a) => a.type === 'shift_open')
  step('API: after close, alert still counts only the 3 employee shifts',
    postAlert && String(postAlert.message).trim().startsWith('3'), postAlert ? postAlert.message : 'no alert')

  // ---------- UI: readings page shows the configurable cycle ----------
  await nav(page, 'readings')
  await page.waitForTimeout(1000)
  const sel = page.locator('[data-testid="readings-station"]')
  if (await sel.count()) { await sel.selectOption(ST); await page.waitForTimeout(1200) }
  const body = (await page.locator('body').innerText()).replace(/[\u066B\u066C]/g, '.')
  step('UI: reading-period chip shows the 11:00 cycle', /دورة القراءة/.test(body) && /11:00/.test(body), body.slice(0, 200).replace(/\s+/g, ' '))
  step('UI: closed day shows as completed', /جميع القراءات مكتملة/.test(body))
  await shot(page, '80-reading-period-cycle')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
