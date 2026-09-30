// Phase 2b: shift lifecycle via UI — with labeled API workarounds for confirmed UI bugs
const { launch, login, apiGet, apiPost, nav, goto, fillByLabel, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  const today = new Date().toISOString().split('T')[0]

  step('UI: login', await login(page))
  // Self-seed a dedicated station (timestamped) — shared seed data gets
  // polluted across suites/runs (meters accumulate readings → continuity
  // 417s when another suite already moved the counters). Same pattern as
  // phase2c/phase5/phase7/phase8.
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: 'محطة دورة حياة ' + Date.now(), address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 1, meters: 1 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 10000 }],
  })
  const ST = wiz.station
  step('SETUP: dedicated station seeded (1 island / 1 pump / 1 gun)', wiz.ok === true && !!ST, ST)

  // ---------- create shift via UI ----------
  // Lifecycle tests need a PRISTINE shift — reusing one from an earlier run
  // would accumulate old collections/readings and break the math assertions.
  // A timestamped name keeps every run independent — pick by that exact name
  // (creation/modified are not in the list fields, so ordering is unreliable).
  let myShift = null
  const uniqueName = 'مناوبة اختبار آلي ' + Date.now()
  await nav(page, 'shifts/create')
  await page.locator('form select').first().selectOption(ST)
  await fillByLabel(page, 'اسم المناوبة', uniqueName)
  await page.locator('form input[type="date"]').fill(today)
  await page.locator('form input[type="time"]').nth(0).fill('08:00')
  await page.locator('form input[type="time"]').nth(1).fill('16:00')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const shifts1 = (await apiGet(page, 'shifts/')).results || []
  myShift = shifts1.find(s => s.shift_name === uniqueName) || null
  step('UI: create shift', !!myShift, myShift ? myShift.name + ' status=' + myShift.status : 'failed')
  const SH = myShift.name

  // ---------- sanity: shift starts in a known lifecycle state ----------
  step('Shift created in a known lifecycle state (scheduled/open)', ['scheduled', 'open'].includes(myShift.status), 'status=' + myShift.status)

  // Activate via API (CSRF-aware — raw fetch must fetch the token first)
  const w1 = await page.evaluate(async (sh) => {
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const tok = me.message.csrf_token
    const r = await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok }, body: JSON.stringify({ status: 'open' }) })
    return r.status
  }, SH)
  step('WORKAROUND: activate shift via API (UI has no control for this)', w1 === 200, 'http=' + w1)

  // ---------- shift detail now shows action buttons ----------
  await nav(page, 'shifts')
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(800)
  let detailText = await page.locator('body').innerText()
  step('UI: shift detail shows add-readings button (after open)', detailText.includes('إضافة قراءات'))
  // open shifts show «إنهاء وتقديم»; the close button appears once submitted (4-state flow)
  step('UI: open shift shows submit control', detailText.includes('إنهاء وتقديم') || detailText.includes('إقفال المناوبة'))
  await shot(page, '12-shift-detail-open')

  // ---------- METER READING: UI form is broken (empty dropdown) — document, then seed via API ----------
  await nav(page, `shifts/${SH}/readings`)
  await page.waitForTimeout(800)
  const meterOpts = await page.locator('form select').first().locator('option').allTextContents()
  step('UI: reading form meter dropdown lists meters (fixed in Phase 1)', meterOpts.length > 1, JSON.stringify(meterOpts))
  await shot(page, '13-reading-form-broken')

  // Seed the reading exactly as the form would have posted — pick THIS
  // station's meter (the global meters list contains other suites' meters)
  const machines2 = ((await apiGet(page, `machines/?station=${ST}`)).results || [])
  const meters = ((await apiGet(page, 'meters/')).results || []).filter(m => machines2.some(x => x.name === m.machine))
  const METER = (meters.find(m => m.meter_code === 'M01A') || meters[0] || {}).name
  const startReading = 1000, endReading = 1500
  const w2res = await apiPost(page, 'meter-readings/', { shift: SH, meter: METER, start_reading: startReading, end_reading: endReading })
  const w2 = w2res.__status || 200
  step('WORKAROUND: seed meter reading via API (form is unusable)', w2 === 200, 'http=' + w2)
  const readings = (await apiGet(page, `meter-readings/?shift=${SH}`)).results || []
  step('API: liters_sold auto-calc (1500-1000=500)', readings.length > 0 && Number(readings[0].liters_sold) === 500, 'got ' + (readings[0] || {}).liters_sold)
  const meterAfter = (await apiGet(page, `meters/${METER}/`))
  step('API: meter.current_reading updated to end_reading', Number(meterAfter.current_reading) === endReading, 'got ' + meterAfter.current_reading)

  // ---------- INCOME ENTRY via UI (should work now that shift is open) ----------
  await nav(page, 'finance/income')
  await page.waitForTimeout(800)
  await page.locator('form select').first().selectOption(ST)
  await page.waitForTimeout(400)
  const shiftOpts = await page.locator('form select').nth(1).locator('option').allTextContents()
  step('UI: income form shift dropdown shows open shift', shiftOpts.some(t => t.includes(myShift.shift_name) || t.includes(SH)), JSON.stringify(shiftOpts))
  await page.locator('form select').nth(1).selectOption(SH)
  const nums = page.locator('form input[type="number"]')
  await nums.nth(0).fill('5000')  // cash
  await nums.nth(1).fill('2')     // 2 × 5 LYD coupons
  await nums.nth(4).fill('1')     // 1 × 8 LYD coupon
  await nums.nth(5).fill('300')   // POS
  const grand = await page.locator('form').innerText()
  step('UI: income form live total = 5318', grand.includes('5,318') || grand.includes('5318'), '')
  await shot(page, '15-income-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1800)
  const cash = (await apiGet(page, `cash-collections/?shift=${SH}`)).results || []
  const vouchers = (await apiGet(page, `vouchers/?shift=${SH}`)).results || []
  const pos = (await apiGet(page, `pos-records/?shift=${SH}`)).results || []
  step('UI: cash collection saved (5000)', cash.length > 0 && Number(cash[0].amount) === 5000, cash.length ? 'amount=' + cash[0].amount : 'none')
  step('UI: vouchers saved (2 rows)', vouchers.length === 2, 'rows=' + vouchers.length)
  step('API: voucher total_value auto-calc (2×5=10, 1×8=8)', vouchers.length === 2 && vouchers.map(v => Number(v.total_value)).sort().join(',') === '10,8', JSON.stringify(vouchers.map(v => v.total_value)))
  step('UI: POS record saved (300)', pos.length > 0 && Number(pos[0].total_amount) === 300, pos.length ? 'amount=' + pos[0].total_amount : 'none')
  await shot(page, '16-income-saved')

  // ---------- SUBMIT: UI has no control — API workaround ----------
  const w3 = await page.evaluate(async (sh) => {
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const tok = me.message.csrf_token
    const r = await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok }, body: JSON.stringify({ status: 'submitted' }) })
    return r.status
  }, SH)
  step('WORKAROUND: submit shift via API (UI has no submit button)', w3 === 200, 'http=' + w3)

  // ---------- CLOSE via UI button ----------
  await nav(page, 'shifts')
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(800)
  const closeBtn = page.locator('button', { hasText: 'إقفال المناوبة' })
  if (await closeBtn.count()) {
    await closeBtn.first().click()
    await page.waitForTimeout(2500)
    const afterClose = await apiGet(page, `shifts/${SH}/`)
    step('UI: close shift button works (submitted → closed)', afterClose.status === 'closed', 'status=' + afterClose.status)
  } else {
    step('UI: close button visible for submitted shift', false, 'button missing — ShiftDetail only shows it for status=open')
    const w4res = await apiPost(page, 'shifts/' + SH + '/close/')
    const w4 = w4res.__status || 200
    step('WORKAROUND: close via API endpoint', w4 === 200, 'http=' + w4)
  }
  const recons = (await apiGet(page, 'reconciliations/')).results || []
  const myRecon = recons.find(r => String(r.shift) === SH)
  step('API: reconciliation auto-created on close', !!myRecon, myRecon ? JSON.stringify(myRecon).slice(0, 300) : 'missing')
  if (myRecon) {
    // expected sales = 500L × 0.48 (بنزين 91 price) = 240 ; collected = 5000+10+8+300 = 5318
    step('API: recon totals math', Number(myRecon.total_collection) === 5318, JSON.stringify({ collected: myRecon.total_collection, expected: myRecon.total_expected_sales || myRecon.expected_sales, diff: myRecon.difference, type: myRecon.difference_type }))
  }
  await nav(page, 'shifts')
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(800)
  await shot(page, '17-shift-closed')
  detailText = await page.locator('body').innerText()
  step('UI: shift detail shows reconciliation section after close', detailText.includes('التسوية المالية'))

  console.log('\nSHIFT ID:', SH)
  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
