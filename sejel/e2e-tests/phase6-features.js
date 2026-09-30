// Phase 6: charts payload, per-island wizard spec, يوم المحطة + shift
// generation (normal + emergency), continuity reason enforcement,
// password admin. The 2026-09-12 batch.
const { launch, login, apiGet, apiPost, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))

  // ---------- per-island wizard spec (islands may differ) ----------
  const uni = 'محطة اختبار ' + Date.now()
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: uni, address: 'طرابلس', relationship_type: 'owned' },
    islands: [
      { machines: 3, meters: 2 },  // island 1: 3 pumps × 2 meters
      { machines: 1, meters: 1 },  // island 2: 1 pump × 1 meter
    ],
    meters_per_machine: 2,
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const wizOk = !wiz.__status || wiz.__status === 200
  step('API: wizard accepts per-island spec', wizOk && wiz.created, JSON.stringify(wiz.created || wiz).slice(0, 160))
  step('API: wizard counts (2 islands / 4 machines / 7 meters)',
    wiz.created && wiz.created.islands === 2 && wiz.created.machines === 4 && wiz.created.meters === 7,
    JSON.stringify(wiz.created))
  const ST = wiz.station
  const islands = ((await apiGet(page, `islands/?station=${ST}`)).results || [])
  const machines = ((await apiGet(page, `machines/?station=${ST}`)).results || [])
  step('API: island 1 has 3 pumps, island 2 has 1',
    machines.filter(m => m.island === islands.find(i => i.number === 1).name).length === 3
    && machines.filter(m => m.island === islands.find(i => i.number === 2).name).length === 1,
    JSON.stringify(islands.map(i => i.number)))

  // ---------- shift generation: normal + emergency ----------
  const today = new Date().toISOString().split('T')[0]
  const g1 = await apiPost(page, 'generate-shifts/', { date: today })
  step('API: generate-shifts (normal mode) responds', !g1.__status && g1.ok !== undefined, JSON.stringify(g1).slice(0, 140))
  const g2 = await apiPost(page, 'generate-shifts/', { date: today, emergency: 1 })
  step('API: generate-shifts emergency mode responds', !g2.__status && g2.ok !== undefined, JSON.stringify(g2).slice(0, 140))
  step('API: re-run is idempotent (no duplicates)', g2.created === 0, `created=${g2.created} skipped=${g2.skipped}`)

  // ---------- يوم المحطة UI ----------
  await nav(page, 'shifts/day')
  await page.waitForTimeout(1200)
  const dayText = await page.locator('body').innerText()
  step('UI: يوم المحطة renders', dayText.includes('يوم المحطة') && dayText.includes('شبكة قراءات العدادات'))
  step('UI: emergency button visible', dayText.includes('وضع الطوارئ'))
  await shot(page, '60-station-day')

  // ---------- continuity reason enforcement (UI + API) ----------
  const meter = ((await apiGet(page, 'meters/')).results || []).find(m => machines.some(x => x.name === m.machine))
  step('DATA: meter exists for continuity test', !!meter, meter ? meter.meter_code : 'none')
  if (meter) {
    // create a shift, open it, then try a gap reading without a reason
    const sh = await apiPost(page, 'shifts/', { station: ST, shift_name: 'مناوبة فجوة ' + Date.now(), date: today, start_time: '08:00', end_time: '16:00' })
    const SH = sh.name
    const tok = (await page.evaluate(async () => (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token))
    const put = (body) => page.evaluate(async ({ sh, body, tok }) => {
      const r = await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok }, body: JSON.stringify(body) })
      return r.status
    }, { sh: SH, body, tok })
    await put({ status: 'open' })

    // seed a "previous" reading ending at 1000
    await apiPost(page, 'meter-readings/', { shift: SH, meter: meter.name, start_reading: 900, end_reading: 1000 })
    // gap: start at 1100 without reason → must be rejected
    const gap = await apiPost(page, 'meter-readings/', { shift: SH, meter: meter.name, start_reading: 1100 })
    step('API: continuity gap without reason rejected', gap.__status === 417 || gap.__status >= 400, 'http=' + (gap.__status || 200))
    // with reason → accepted
    const okGap = await apiPost(page, 'meter-readings/', { shift: SH, meter: meter.name, start_reading: 1100, exception_type: 'other', notes: 'انقطاع مسجل بعذر' })
    step('API: continuity gap with reason accepted', !okGap.__status || okGap.__status === 200, 'http=' + (okGap.__status || 200))
    // negative span → always rejected
    const neg = await apiPost(page, 'meter-readings/', { shift: SH, meter: meter.name, start_reading: 1200, end_reading: 1150, exception_type: 'other', notes: 'x' })
    step('API: negative span always rejected', neg.__status >= 400, 'http=' + (neg.__status || 200))
  }

  // ---------- dashboard trend payload (single-station mode only) ----------
  const dash = await page.evaluate(async (st) => {
    const r = await fetch('/api/dashboard-station/?station=' + st, { credentials: 'include' })
    return (await r.json()).message || {}
  }, ST)
  step('API: dashboard has 14-day trend arrays', Array.isArray(dash.trend?.labels) && dash.trend.labels.length === 14,
    `labels=${(dash.trend?.labels || []).length} has_data=${dash.trend?.has_data}`)

  // ---------- password admin ----------
  // Self-seeding: finance_a/finance_b were UAT-era users removed in the legacy
  // cleanup — create per-run users (same pattern as phase5c).
  const finA = 'fin' + Date.now().toString().slice(-8)
  const finB = 'fin' + (Date.now() + 1).toString().slice(-8)
  const mkU = await apiPost(page, 'users/', {
    username: finA, first_name: 'مالي اختبار', password: 'Pilot@2026!fin', role: 'finance',
  })
  step('API: finance user created for password-admin test', !!mkU.name, mkU.name || '')
  const mkU2 = await apiPost(page, 'users/', {
    username: finB, first_name: 'مالي اختبار 2', password: 'Pilot@2026!fin', role: 'finance',
  })
  step('API: second finance user created', !!mkU2.name, mkU2.name || '')
  const pw = await apiPost(page, 'auth/set-user-password/', { username: finA, new_password: 'pilot-finance-1' })
  step('API: admin can reset a user password', !pw.__status && pw.password_updated, JSON.stringify(pw).slice(0, 120))
  const dis = await apiPost(page, 'auth/set-user-password/', { username: finB, enabled: 0 })
  step('API: admin can disable a user', !dis.__status && dis.enabled === false, JSON.stringify(dis).slice(0, 120))
  const en = await apiPost(page, 'auth/set-user-password/', { username: finB, enabled: 1 })
  step('API: admin can re-enable a user', !en.__status && en.enabled === true, JSON.stringify(en).slice(0, 120))

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
