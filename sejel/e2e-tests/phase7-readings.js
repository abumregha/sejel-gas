// Phase 7: قراءات المضخات — pump/gun reading workflow (client redesign prompt
// §9–§23 + §34). Acceptance uses the client's REAL Excel numbers:
//   3,280,418 → 3,288,641 = 8,223 L
//   3,077,096 → 3,085,676 = 8,580 L
//   27,546,777 → 27,603,884 = 57,107 L
// plus zero movement, negative block, auto-previous retrieval, notes
// persistence (the pre-fix bug), readings_status, the /readings UI and the
// Excel-style dashboard table.
const { launch, login, apiGet, apiPost, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))

  // ---------- dedicated station: 2 islands / different pumps per island ----------
  const uni = 'محطة قراءات ' + Date.now()
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: uni, address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 2, meters: 2 }, { machines: 1, meters: 2 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 30000 }, { fuel_type: 'ديزل', capacity: 15000 }],
  })
  const ST = wiz.station
  step('API: readings station created (2 islands / 3 pumps / 6 guns)',
    wiz.created && wiz.created.machines === 3 && wiz.created.meters === 6, JSON.stringify(wiz.created))

  const islands = ((await apiGet(page, `islands/?station=${ST}`)).results || [])
  const machines = ((await apiGet(page, `machines/?station=${ST}`)).results || [])
  const meters = ((await apiGet(page, `meters/`)).results || []).filter((m) =>
    machines.some((x) => x.name === m.machine))
  step('DATA: 6 guns visible via API', meters.length === 6, 'guns=' + meters.length)

  // ---------- dynamic station payload (§7/§31): islands come from data ----------
  const dash0 = (await apiGet(page, `dashboard-station/?station=${ST}`))
  step('API: dashboard-station renders 2 islands dynamically',
    dash0.islands.length === 2 &&
    dash0.islands[0].machines.length === 2 && dash0.islands[1].machines.length === 1,
    JSON.stringify(dash0.islands.map((i) => i.machines.length)))
  step('API: readings_status starts 0/6', dash0.readings_status.total === 6 && dash0.readings_status.done === 0,
    JSON.stringify(dash0.readings_status))

  // ---------- shift for the day ----------
  const today = new Date().toISOString().split('T')[0]
  const sh = await apiPost(page, 'shifts/', {
    station: ST, shift_name: 'مناوبة قراءات ' + Date.now(), date: today,
    start_time: '08:00', end_time: '23:00',
  })
  const SH = sh.name
  // open the shift via CRUD PUT (nginx PATCH→PUT)
  const tok = (await page.evaluate(async () =>
    (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token))
  await page.evaluate(async ({ sh, tok }) => {
    await fetch('/api/shifts/' + sh + '/', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok },
      body: JSON.stringify({ status: 'open' }),
    })
  }, { sh: SH, tok })

  // ---------- §34: the client's REAL Excel numbers through the API ----------
  const mA = meters.find((m) => m.meter_code.startsWith('M01'))
  const mB = meters.find((m) => m.meter_code.startsWith('M02'))
  const mC = meters.find((m) => m.meter_code.startsWith('M03'))
  const r1 = await apiPost(page, 'meter-readings/', { shift: SH, meter: mA.name, start_reading: 3280418, end_reading: 3288641 })
  step('Excel: 3,280,418 → 3,288,641 = 8,223 L', r1.liters_sold === 8223, 'got ' + r1.liters_sold)
  const r2 = await apiPost(page, 'meter-readings/', { shift: SH, meter: mB.name, start_reading: 3077096, end_reading: 3085676 })
  step('Excel: 3,077,096 → 3,085,676 = 8,580 L', r2.liters_sold === 8580, 'got ' + r2.liters_sold)
  const r3 = await apiPost(page, 'meter-readings/', { shift: SH, meter: mC.name, start_reading: 27546777, end_reading: 27603884 })
  step('Excel: total row 27,546,777 → 27,603,884 = 57,107 L', r3.liters_sold === 57107, 'got ' + r3.liters_sold)
  step('Excel: row liters sum to the sheet scenario (8,223 + 8,580 = 16,803)',
    r1.liters_sold + r2.liters_sold === 16803)

  // ---------- §10/§13: auto-previous, zero movement, negative block, notes ----------
  const zero = await apiPost(page, 'meter-readings/', { shift: SH, meter: mA.name, start_reading: 3288641, end_reading: 3288641 })
  step('Zero movement accepted as 0 L', zero.liters_sold === 0, 'got ' + zero.liters_sold)
  const gap = await apiPost(page, 'meter-readings/', { shift: SH, meter: mA.name, start_reading: 3290000 })
  step('Silent gap rejected (continuity)', (gap.__status || 200) >= 400, 'http=' + (gap.__status || 200))
  const gapOk = await apiPost(page, 'meter-readings/', { shift: SH, meter: mA.name, start_reading: 3290000, exception_type: 'other', notes: 'سبب مسجل' })
  step('Documented exception accepted', !(gapOk.__status >= 400), 'http=' + (gapOk.__status || 200))
  step('notes persisted on the exception row (pre-fix bug)', (gapOk.notes || '').includes('سبب مسجل'), JSON.stringify(gapOk.notes))
  const neg = await apiPost(page, 'meter-readings/', { shift: SH, meter: mB.name, start_reading: 3085676, end_reading: 3085000, exception_type: 'other', notes: 'x' })
  step('Negative reading always rejected', (neg.__status || 200) >= 400, 'http=' + (neg.__status || 200))

  // ---------- readings_status after 4 guns done (mA, mB have readings; mC too) ----------
  const dash1 = await apiGet(page, `dashboard-station/?station=${ST}`)
  step('API: readings_status counts done (3 guns saved of 6)', dash1.readings_status.done === 3, JSON.stringify(dash1.readings_status))

  // ---------- §9: the /readings UI ----------
  await nav(page, 'readings')
  await page.waitForTimeout(1000)
  let body = await page.locator('body').innerText()
  step('UI: قراءات المضخات page renders', body.includes('قراءات المضخات') && body.includes('القراءة السابقة'))
  await shot(page, '70-readings-page')

  // station picker visible for admin; select the new station
  const sel = page.locator('[data-testid="readings-station"]')
  if (await sel.count()) {
    await sel.selectOption(ST)
    await page.waitForTimeout(1200)
  }
  body = await page.locator('body').innerText()
  // ar-LY groups thousands with U+066C/U+066B (render like '.' or ',') —
  // normalize before matching. mB's saved end (3,085,676) must appear as the
  // auto-retrieved previous reading of that gun.
  const norm = body.replace(/[\u066B\u066C]/g, '.')
  step('UI: gun rows grouped by island', body.includes('جزيرة 1') && body.includes('جزيرة 2'))
  step('UI: saved guns show مسجلة status', body.includes('مسجلة'))
  step('UI: auto previous reading shown (client Excel value 3,085,676)',
    /3[.,٫]085[.,٫]676/.test(norm), 'expected mB previous 3,085,676 in some formatting')

  // ---------- §10/§11: enter ONLY the current reading in the UI ----------
  // use a PENDING gun (input enabled, never saved). Its previous reading is
  // auto-retrieved (0 for a never-used gun); typing 1000 must live-preview
  // 1,000 L without the operator typing any previous value (§10).
  const pendingRow = page.locator('div.bg-white', { hasText: 'بانتظار القراءة' }).first()
  const input = pendingRow.locator('[data-testid="gun-current-input"]')
  await input.fill('1000')
  await page.waitForTimeout(300)
  const rowText = await pendingRow.innerText()
  const rowNorm = rowText.replace(/[\u066B\u066C]/g, '.')
  step('UI: live liters preview appears (1,000 L on a fresh gun)',
    /1[.,٫]000[\s\u00A0]*لتر/.test(rowNorm) || rowNorm.includes('1.000 لتر'), rowNorm.replace(/\s+/g, ' ').slice(0, 160))

  await page.locator('[data-testid="save-readings"]').click()
  await page.waitForTimeout(1500)
  body = await page.locator('body').innerText()
  step('UI: save succeeds with backend confirmation', body.includes('تم حفظ'), '')
  await shot(page, '71-readings-saved')

  // ---------- §22/§23: completion chip + closing ----------
  await nav(page, '')
  await page.waitForTimeout(1200)
  // admin lands in aggregate mode — select the test station so the
  // single-station dashboard (chip + Excel table) renders
  const dsel = page.locator('[data-testid="station-selector"]')
  if (await dsel.count()) {
    await dsel.selectOption(ST)
    await page.waitForTimeout(1500)
  }
  const dashText = await page.locator('body').innerText()
  step('UI: dashboard shows قراءات اليوم completion chip', dashText.includes('قراءات اليوم'), '')
  step('UI: Excel-style table columns present',
    dashText.includes('قراءة بداية اليوم') && dashText.includes('قراءة نهاية اليوم')
    && dashText.includes('اللترات المباعة') && dashText.includes('المسدس') && dashText.includes('رقم المضخة'))
  step('UI: totals row إجمالي اللترات المباعة present', dashText.includes('إجمالي اللترات المباعة'))
  await shot(page, '72-dashboard-excel-table')

  // ---------- §23: daily closing from the readings page ----------
  await nav(page, 'readings')
  await page.waitForTimeout(1000)
  const closeBtn = page.locator('[data-testid="close-day"]')
  await closeBtn.click() // dialogs auto-accepted by the launch helper
  await page.waitForTimeout(2500)
  body = await page.locator('body').innerText()
  step('UI: إقفال اليوم creates reconciliation', body.includes('تم إقفال اليوم') || body.includes('التسوية'), body.slice(0, 120))
  const recs = ((await apiGet(page, `reconciliations/?station=${ST}`)).results || [])
  step('API: reconciliation created for the closed day', recs.length >= 1, 'count=' + recs.length)
  if (recs.length) {
    const lit = recs[0].total_liters || 0
    step('API: reconciliation liters > 0 (real sum)', lit > 0, 'total_liters=' + lit)
  }
  await shot(page, '73-day-closed')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
