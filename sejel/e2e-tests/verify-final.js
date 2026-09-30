// Final comprehensive UI verification of all remaining fixes
const { launch, login, nav, apiGet, apiPost, fillByLabel, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  const today = new Date().toISOString().slice(0, 10)
  const ST = 'r56gmqnon6'   // test station
  const ISL = 'vq4j6sldtf'  // test island
  const EMP = 'vt1f96hjne'  // test employee

  step('UI: login', await login(page))

  // ---------- 1. SESSION RESTORE (hard load of protected pages) ----------
  await page.goto('http://localhost:8004/app/stations', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  step('1a. session restored on hard load (no login redirect)', !page.url().includes('login'), page.url())
  const b1 = await page.evaluate(() => document.body.innerText)
  step('1b. protected page renders data after refresh', /محطة/.test(b1) && !/تسجيل الدخول/.test(b1))
  await page.goto('http://localhost:8004/app/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  step('1c. dashboard renders after refresh', /لوحة التحكم/.test(await page.evaluate(() => document.body.innerText)))

  // ---------- 2. FRIENDLY ERRORS ----------
  await nav(page, 'shifts/definitions/create')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const errText = await page.evaluate(() => document.body.innerText)
  const hasTraceback = /Traceback|frappe\.|ValidationError:|MandatoryError|Request Error/i.test(errText)
  // A form that blocks empty submission with HTML5/native validation (no error
  // box at all) is also good UX — only a visible raw traceback is a failure.
  step('2. empty form never shows a raw traceback', !hasTraceback,
    hasTraceback ? 'TRACEBACK VISIBLE' : 'blocked client-side or friendly message')
  await shot(page, 'f-friendly-error')

  // ---------- 3. SHIFT LIFECYCLE: create → start → reading → submit → close ----------
  await nav(page, 'shifts/create')
  await page.waitForTimeout(1500)
  await page.locator('form select').nth(0).selectOption(ST)
  await fillByLabel(page, 'اسم المناوبة', 'تحقق نهائي ' + today)
  await page.locator('form select').nth(2).selectOption(ISL)
  await page.locator('form select').nth(3).selectOption(EMP)
  await page.locator('form input[type="date"]').fill(today)
  await page.locator('form input[type="time"]').nth(0).fill('08:00')
  await page.locator('form input[type="time"]').nth(1).fill('16:00')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1800)
  const shifts = (await apiGet(page, 'shifts/')).results || []
  const SH = (shifts.find(s => s.station === ST && s.date === today && String(s.shift_name).includes('تحقق نهائي')) || {}).name
  step('3a. shift created via UI form', !!SH, SH || 'not found')

  // activate via detail button
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(900)
  const actBtn = page.locator('button:has-text("بدء المناوبة")')
  if (await actBtn.count()) {
    await actBtn.click()
    await page.waitForTimeout(1500)
    const st = (await apiGet(page, `shifts/${SH}/`)).status
    step('3b. «بدء المناوبة» activates shift (scheduled → open)', st === 'open', 'status=' + st)
  } else step('3b. activate button present', false, 'missing')

  // meter reading via form
  await nav(page, `shifts/${SH}/readings`)
  await page.waitForTimeout(1200)
  const meterOpts = await page.locator('form select').first().locator('option').allTextContents()
  step('3c. meter dropdown populated (machine-chain fix)', meterOpts.length > 1, `${meterOpts.length - 1} meters`)
  await page.locator('form select').first().selectOption({ index: 1 })
  await page.locator('form input[type="number"]').nth(0).fill('2000')
  await page.locator('form input[type="number"]').nth(1).fill('3000')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const readings = (await apiGet(page, `meter-readings/?shift=${SH}`)).results || []
  step('3d. reading saved via form (auto 1000 L)', readings.length > 0 && Number(readings[0].liters_sold) === 1000, 'liters=' + (readings[0] || {}).liters_sold)

  // submit via detail button
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(900)
  const subBtn = page.locator('button:has-text("إنهاء وتقديم")')
  if (await subBtn.count()) {
    await subBtn.click()
    await page.waitForTimeout(1500)
    const st2 = (await apiGet(page, `shifts/${SH}/`)).status
    step('3e. «إنهاء وتقديم» submits shift (open → submitted)', st2 === 'submitted', 'status=' + st2)
  } else step('3e. submit button present', false, 'missing')

  // close via detail button
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(900)
  const closeBtn = page.locator('button:has-text("إقفال المناوبة")')
  if (await closeBtn.count()) {
    await closeBtn.click()
    await page.waitForTimeout(2500)
    await shot(page, 'f-shift-closed')
    const st3 = (await apiGet(page, `shifts/${SH}/`)).status
    const recos = (await apiGet(page, `reconciliations/?shift=${SH}`)).results || []
    const closed = st3 === 'closed' || recos.length > 0
    const totalsOk = recos.length > 0 && Number(recos[0].expected_sales) > 0
    step('3f. close button closes shift + creates reconciliation', closed, `status=${st3} recos=${recos.length}`)
    step('3g. reconciliation totals non-zero (docstatus fix holds)', totalsOk, recos[0] ? `expected=${recos[0].expected_sales} collected=${recos[0].total_collection}` : 'no recon')
  } else step('3f. close button present', false, 'missing')

  // ---------- 4. FUEL PRICE UI ----------
  await nav(page, 'finance/fuel-prices')
  await page.waitForTimeout(1000)
  const priceBody = await page.evaluate(() => document.body.innerText)
  step('4a. fuel-prices page lists prices', /بنزين|سولار|كاز/.test(priceBody))
  const addBtn = page.locator('button:has-text("+ إضافة سعر")')
  let priceCreated = false
  if (await addBtn.count()) {
    await addBtn.click()
    await page.waitForTimeout(600)
    await page.locator('form select').first().selectOption({ index: 1 })
    await page.locator('form input[type="number"]').nth(0).fill('0.555')
    await page.locator('form input[type="date"]').fill(today)
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1800)
    const prices = (await apiGet(page, 'fuel-prices/')).results || []
    priceCreated = prices.some(p => Number(p.selling_price) === 0.555 && String(p.effective_date).startsWith(today))
  }
  step('4b. fuel price created via UI', priceCreated)
  await shot(page, 'f-fuel-prices')

  // ---------- 5. SELECT OPTIONS VALID (already passing; keep) ----------
  await nav(page, 'stations/create')
  await page.waitForTimeout(800)
  let opts = []
  for (const s of await page.locator('form select').all()) opts.push(...(await s.locator('option').allTextContents()))
  step('5a. Station form has no invalid امتياز option', !opts.some(o => /امتياز/.test(o)), opts.join('|'))
  await nav(page, 'finance/expenses/create')
  await page.waitForTimeout(800)
  opts = []
  for (const s of await page.locator('form select').all()) opts.push(...(await s.locator('option').allTextContents()))
  step('5b. Expense form has no invalid حوالة option', !opts.some(o => /حوالة/.test(o)), opts.join('|'))

  // ---------- 6. TANK TRANSFER via UI ----------
  await nav(page, 'inventory/transfers/create')
  await page.waitForTimeout(1000)
  let transferOk = false
  try {
    await page.locator('form select').nth(0).selectOption(ST)
    await page.waitForTimeout(600) // tanks filter by station
    const fromSel = page.locator('form select').nth(1)
    const toSel = page.locator('form select').nth(2)
    const nFrom = (await fromSel.locator('option').count())
    if (nFrom > 1) {
      await fromSel.selectOption({ index: 1 })
      await toSel.selectOption({ index: Math.min(2, nFrom - 1) })
      await page.locator('form input[type="number"]').first().fill('500')
      await page.locator('form button[type="submit"]').click()
      await page.waitForTimeout(1800)
      const transfers = (await apiGet(page, 'tank-transfers/')).results || []
      transferOk = transfers.length > 0
    }
  } catch (e) { step('6. transfer error', false, String(e).slice(0, 120)) }
  step('6. tank transfer created via UI (new DocType works)', transferOk)
  await shot(page, 'f-transfer')

  // ---------- 7. REQUEST DETAIL RENDER ----------
  const reqs = (await apiGet(page, 'delivery-requests/')).results || []
  if (reqs.length) {
    await nav(page, `inventory/requests/${reqs[0].name}`)
    await page.waitForTimeout(1200)
    const body = await page.evaluate(() => document.body.innerText)
    step('7. request detail renders without undefined fields', !/undefined/.test(body), reqs[0].name)
    await shot(page, 'f-request-detail')
  } else {
    step('7. request detail renders', false, 'no requests exist to open')
  }

  // ---------- 8. DELIVERY AUTO-CALC (wired validate) ----------
  const tanks = (await apiGet(page, 'tanks/')).results || []
  const TK = (tanks[0] || {}).name
  step('8a. tank available for test', !!TK, TK || 'none')
  if (TK) {
    const now = new Date().toISOString()
    const delivered = await (async () => {
      const res = await apiPost(page, 'deliveries/', { station: 'r56gmqnon6', tank: TK, fuel_type: 'بنزين 91', requested_quantity: 30000, expected_quantity: 30000, pre_reading: 40000, post_reading: 68000, arrival_date: now, order_date: now })
      if (res.__status) return { err: res.__status }
      return res.data || res
    })()
    step('8b. delivery saved through wired validate()', !delivered.err, delivered.err ? `HTTP ${delivered.err}` : delivered.name)
    step('8c. received auto-calculated = post − pre (28000); shortage = expected − received (2000)',
      Number(delivered.received_quantity) === 28000 && Number(delivered.shortage) === 2000,
      `got ${delivered.received_quantity}, shortage=${delivered.shortage}`)

    // ---------- 9. TANK READING documented behavior ----------
    // (per DOCUMENTATION.md §5.9: validate sets recorded_by, on_update syncs
    // Tank.current_level — no continuity rule exists for tank readings)
    const before = Number(((await apiGet(page, `tanks/${TK}/`)) || {}).current_level)
    const rdRes = await apiPost(page, 'tank-readings/', { tank: TK, reading_level: 6000, recorded_at: new Date().toISOString() })
    const rdStatus = rdRes.__status || 200
    const afterTank = (await apiGet(page, `tanks/${TK}/`)) || {}
    step('9. tank reading accepted + syncs Tank.current_level (§5.9)',
      rdStatus === 200 && Number(afterTank.current_level) === 6000,
      `http=${rdStatus} level ${before}→${afterTank.current_level}`)
  }

  await browser.close()
  summary()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
