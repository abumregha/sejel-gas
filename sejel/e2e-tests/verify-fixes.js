// Verify the 4 critical fixes via pure UI:
// 1. meter-station filter (reading form dropdown)
// 2. received_by (income entry cash saves)
// 3. shift close crash (endpoint works)
// 4. docstatus filters (reconciliation totals non-zero)
const { launch, login, apiGet, nav, fillByLabel, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  const today = new Date().toISOString().split('T')[0]

  step('UI: login', await login(page))
  const ST = 'r56gmqnon6'
  const ISL = 'vq4j6sldtf'
  const EMP = 'vt1f96hjne'

  // ---------- create a fresh shift via UI ----------
  await nav(page, 'shifts/create')
  await page.locator('form select').first().selectOption(ST)
  await fillByLabel(page, 'اسم المناوبة', 'تحليل الإقفال ' + today)
  await page.locator('form select').nth(1).selectOption(ISL).catch(e => console.log('island sel:', e.message.split('\n')[0]))
  await page.locator('form select').nth(2).selectOption(EMP).catch(e => console.log('emp sel:', e.message.split('\n')[0]))
  await page.locator('form input[type="date"]').fill(today)
  await page.locator('form input[type="time"]').nth(0).fill('08:00')
  await page.locator('form input[type="time"]').nth(1).fill('16:00')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const shifts = (await apiGet(page, 'shifts/')).results || []
  const SH = (shifts.find(s => s.station === ST && s.date === today && s.shift_name.includes('تحليل الإقفال')) || {}).name
  step('UI: new shift created', !!SH, SH || 'fail')
  if (!SH) { await browser.close(); process.exit(2) }

  // The UI control DOES exist (ShiftDetail.vue «▶ بدء المناوبة» → status open);
  // this script skips the navigation and puts the row straight to open.
  await page.evaluate(async (sh) => {
    await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'open' }) })
  }, SH)
  const activated = ((await apiGet(page, 'shifts/')).results || []).find((s) => s.name === SH)
  step('WORKAROUND: shift activated via API (UI control: ShiftDetail «▶ بدء المناوبة»)',
    !!activated && activated.status === 'open',
    activated ? `status=${activated.status}` : 'shift not in the list')

  // ---------- FIX 1: reading form meter dropdown ----------
  await nav(page, `shifts/${SH}/readings`)
  await page.waitForTimeout(1200)
  const meterOpts = await page.locator('form select').first().locator('option').allTextContents()
  step('FIX 1: reading form meter dropdown populated', meterOpts.length > 1, JSON.stringify(meterOpts))
  await page.locator('form select').first().selectOption({ index: 1 })
  await page.locator('form input[type="number"]').nth(0).fill('2000')
  await page.locator('form input[type="number"]').nth(1).fill('3000')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL(`**/app/shifts/${SH}`, { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(800)
  const readings = (await apiGet(page, `meter-readings/?shift=${SH}`)).results || []
  step('UI: reading saved via form (3000-2000)', readings.length > 0 && Number(readings[0].liters_sold) === 1000, 'liters=' + (readings[0] || {}).liters_sold)

  // ---------- FIX 2: income entry cash saves ----------
  await nav(page, 'finance/income')
  await page.waitForTimeout(900)
  await page.locator('form select').first().selectOption(ST)
  await page.waitForTimeout(400)
  await page.locator('form select').nth(1).selectOption(SH)
  await page.locator('form input[type="number"]').nth(0).fill('2500')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1800)
  const cash = (await apiGet(page, `cash-collections/?shift=${SH}`)).results || []
  step('FIX 2: cash collection saves from income form (2500)', cash.length > 0 && Number(cash[0].amount) === 2500, cash.length ? 'amount=' + cash[0].amount : 'none')
  const successMsg = await page.locator('.bg-green-50').innerText().catch(() => '')
  step('UI: income form shows success', successMsg.includes('تم الحفظ'))

  // ---------- labeled workaround: submit (out of scope bug: no submit control) ----------
  const sub = await page.evaluate(async (sh) => {
    const r = await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'submitted' }) })
    return r.status
  }, SH)
  step('WORKAROUND: submit shift via API (separate known bug: no submit button)', sub === 200, 'http=' + sub)

  // ---------- FIX 3+4: close via UI button → no crash, real totals ----------
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(900)
  const closeBtn = page.locator('button', { hasText: 'إقفال المناوبة' })
  if (!(await closeBtn.count())) {
    step('UI: close button visible', false, 'missing for submitted shift')
  } else {
    await closeBtn.first().click()
    await page.waitForTimeout(2500)
    const after = await apiGet(page, `shifts/${SH}/`)
    step('FIX 3: shift closes without 500 (submitted → closed)', after.status === 'closed', 'status=' + after.status)
    const recons = (await apiGet(page, 'reconciliations/')).results || []
    const recon = recons.find(r => String(r.shift) === SH)
    step('FIX 4a: reconciliation auto-created', !!recon, recon ? recon.name : 'missing')
    if (recon) {
      // 1000 L × 0.48 = 480 expected; collected = 2500 cash
      const okExpected = Math.abs(Number(recon.expected_sales) - 480) < 0.01
      const okCollected = Number(recon.total_collection) === 2500
      step('FIX 4b: expected_sales = 1000L × 0.48 = 480 (docstatus fix works)', okExpected, 'got ' + recon.expected_sales)
      step('FIX 4c: total_collection = 2500', okCollected, 'got ' + recon.total_collection)
      step('FIX 4d: difference classified', recon.difference_type === 'surplus' && Number(recon.difference) === 2020, JSON.stringify({ diff: recon.difference, type: recon.difference_type }))
      console.log('RECON:', JSON.stringify(recon).slice(0, 400))
    }
  }
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(900)
  const detailText = await page.locator('body').innerText()
  step('UI: shift detail shows reconciliation block', detailText.includes('التسوية المالية'))
  await shot(page, '50-shift-closed-fixed')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
