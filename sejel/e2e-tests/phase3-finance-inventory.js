// Phase 3: finance + inventory via UI (with workarounds labeled)
const { launch, login, apiGet, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  const today = new Date().toISOString().split('T')[0]
  step('UI: login', await login(page))
  const stations = (await apiGet(page, 'stations/')).results || []
  const ST = (stations.find(s => (s.station_name || '').includes('الاختبار')) || {}).name
  const tanks = (await apiGet(page, 'tanks/')).results || []
  const TANK = (tanks.find(t => t.station === ST) || {}).name

  // ---------- Reconciliation NaN check (bug #6) ----------
  await nav(page, 'finance/reconciliations')
  await page.waitForTimeout(900)
  const rlText = await page.locator('body').innerText()
  step('UI: reconciliation list renders without NaN cells (fixed in Phase 1)', !rlText.includes('NaN'), 'NaN cells: ' + (rlText.match(/NaN/g) || []).length)
  await shot(page, '19-recon-list-nan')
  const recons = (await apiGet(page, 'reconciliations/')).results || []
  const recon = recons.find(r => String(r.shift) === '319ehbkri6')
  if (recon) {
    await nav(page, `finance/reconciliations/${recon.name}`)
    await page.waitForTimeout(900)
    const rdText = await page.locator('body').innerText()
    step('BUG: reconciliation detail renders NaN + missing fuel summaries', rdText.includes('NaN'), 'NaN cells: ' + (rdText.match(/NaN/g) || []).length)
    await shot(page, '19b-recon-detail-nan')
  }

  // ---------- EXPENSE via UI ----------
  await nav(page, 'finance/expenses/create')
  await page.waitForTimeout(700)
  const expSels = page.locator('form select')
  await expSels.nth(0).selectOption(ST)
  const catOpts = await expSels.nth(1).locator('option').allTextContents()
  if (catOpts.length > 1) await expSels.nth(1).selectOption({ index: 1 })
  await page.locator('form input[type="number"]').first().fill('150')
  await page.locator('form input:not([type])').first().fill('صيانة مضخة اختبار')
  await shot(page, '20-expense-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/finance/expenses', { timeout: 10000 }).catch(() => {})
  const expenses = (await apiGet(page, 'expenses/')).results || []
  const myExp = expenses.find(e => e.station === ST && Number(e.amount) === 150)
  step('UI: expense created (150, pending)', !!myExp, myExp ? JSON.stringify({ amount: myExp.amount, status: myExp.status, method: myExp.payment_method }) : 'not found')

  // ---------- VOUCHER SETTLEMENT via UI ----------
  await nav(page, 'finance/settlements/create')
  await page.waitForTimeout(700)
  await page.locator('form select').first().selectOption(ST)
  const setNums = page.locator('form input[type="number"]')
  await setNums.nth(0).fill('10')
  await setNums.nth(1).fill('5')
  await setNums.nth(2).fill('3')
  await setNums.nth(3).fill('2')
  await shot(page, '21-settlement-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/finance/settlements', { timeout: 10000 }).catch(() => {})
  const settlements = (await apiGet(page, 'voucher-settlements/')).results || []
  const mySet = settlements.find(s => s.station === ST)
  step('UI: settlement created', !!mySet, mySet ? JSON.stringify({ total_value: mySet.total_value, total_count: mySet.total_count }) : 'not found')
  if (mySet) {
    step('API: settlement totals (117 LYD / 20 coupons)', Number(mySet.total_value) === 117 && Number(mySet.total_count) === 20, `got ${mySet.total_value}/${mySet.total_count}`)
    // mark paid via detail page
    await nav(page, `finance/settlements/${mySet.name}`)
    await page.waitForTimeout(900)
    const paidBtn = page.locator('button', { hasText: 'تحديد كمدفوع' })
    if (await paidBtn.count()) {
      await paidBtn.click()
      await page.waitForTimeout(1500)
      const after = await apiGet(page, `voucher-settlements/${mySet.name}/`)
      step('UI: mark settlement as paid', after.status === 'paid', 'status=' + after.status + ' paid=' + after.paid_amount)
    } else step('UI: mark-paid button available', false, 'button missing')
  }
  await shot(page, '22-settlement-done')

  // ---------- TANK READING via UI ----------
  await nav(page, 'inventory/tank-readings')
  await page.waitForTimeout(800)
  await page.locator('button', { hasText: 'إضافة قراءة' }).click()
  await page.waitForTimeout(300)
  const trSel = page.locator('form').last().locator('select').first()
  await trSel.selectOption(TANK)
  await page.locator('form').last().locator('input[type="number"]').first().fill('45000')
  await shot(page, '24-tank-reading-form')
  await page.locator('form').last().locator('button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const readings = (await apiGet(page, 'tank-readings/')).results || []
  const myReading = readings.find(r => String(r.tank) === TANK)
  step('UI: tank reading saved (45000)', !!myReading, myReading ? 'level=' + (myReading.reading_level || myReading.reading) : 'none')
  if (myReading) {
    const tankAfter = await apiGet(page, `tanks/${TANK}/`)
    step('API: tank current_level synced from reading', Number(tankAfter.current_level) === 45000, 'got ' + tankAfter.current_level)
  }

  // ---------- DELIVERY via UI (form sends wrong field names — suspect bug) ----------
  await nav(page, 'inventory/deliveries/create')
  await page.waitForTimeout(700)
  const delSels = page.locator('form select')
  await delSels.nth(0).selectOption(ST)
  await delSels.nth(1).selectOption(TANK).catch(e => console.log('tank select issue:', e.message.split('\n')[0]))
  await page.locator('form input[type="number"]').nth(0).fill('40000')
  await page.locator('form input[type="number"]').nth(1).fill('43000')
  await page.locator('form input[type="number"]').nth(2).fill('83000')
  await shot(page, '25-delivery-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1800)
  const errBox = await page.locator('.bg-red-50').innerText().catch(() => '')
  const deliveries = (await apiGet(page, 'deliveries/')).results || []
  const myDel = deliveries.find(d => d.station === ST)
  step('UI: delivery created', !!myDel, myDel ? JSON.stringify({ expected: myDel.expected_quantity, received: myDel.received_quantity, shortage: myDel.shortage }) : 'ERROR: ' + errBox.slice(0, 120).replace(/\n/g, ' '))
  await shot(page, '26-delivery-after')

  // ---------- DELIVERY REQUEST via UI (sends tank field, API wants fuel_type — suspect bug) ----------
  await nav(page, 'inventory/requests/create')
  await page.waitForTimeout(700)
  const reqSels = page.locator('form select')
  await reqSels.nth(0).selectOption(ST)
  await reqSels.nth(1).selectOption(TANK).catch(e => console.log('req tank select issue:', e.message.split('\n')[0]))
  await page.locator('form input[type="number"]').first().fill('20000')
  await shot(page, '27-request-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(1800)
  const reqErr = await page.locator('.bg-red-50').innerText().catch(() => '')
  const reqs = (await apiGet(page, 'delivery-requests/')).results || []
  const myReq = reqs.find(r => r.station === ST)
  step('UI: delivery request created', !!myReq, myReq ? JSON.stringify({ qty: myReq.requested_quantity, status: myReq.status }) : 'ERROR: ' + reqErr.slice(0, 120).replace(/\n/g, ' '))
  await shot(page, '28-request-after')

  // ---------- TRANSFER via UI (posts to /tank-transfers/ — not a documented resource) ----------
  await nav(page, 'inventory/transfers/create')
  await page.waitForTimeout(700)
  const xferSels = page.locator('form select')
  const fromSel = xferSels.nth(1)
  const fromOpts = await fromSel.locator('option').allTextContents()
  if (fromOpts.length > 1) {
    await fromSel.selectOption({ index: 1 })
    await page.locator('form input[type="number"]').first().fill('100')
    await shot(page, '29-transfer-filled')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1800)
    const resp = await page.evaluate(async () => (await fetch('/api/tank-transfers/', { credentials: 'include' })).status)
    step('API: /tank-transfers/ resource exists on backend (added in Phase 1)', resp !== 404, 'http=' + resp)
  } else {
    step('UI: transfer form needs ≥2 tanks', false, 'only 1 tank at test station')
  }
  await shot(page, '29-transfer-after')

  // ---------- GUID page ----------
  await nav(page, 'guide')
  await page.waitForTimeout(600)
  const g = await page.locator('body').innerText()
  step('UI: guide page renders', g.length > 200, 'chars=' + g.length)

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
