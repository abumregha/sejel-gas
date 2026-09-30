// Verify the 5 form fixes through the real UI:
// definition (days string), settlement (submission_date), tank reading (reading_level/recorded_at),
// delivery request (fuel_type from tank), delivery (pre/post_reading etc.)
const { launch, login, apiGet, nav, fillByLabel, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  const today = new Date().toISOString().split('T')[0]
  step('UI: login', await login(page))
  const ST = 'r56gmqnon6'
  const TANK = 'vrjno67bam'

  // ---------- FIX: definition form (days array → string) ----------
  await nav(page, 'shifts/definitions/create')
  await page.waitForTimeout(800)
  await fillByLabel(page, 'اسم التعريف', 'تعريف من99 ' + today)
  await page.locator('form select').first().selectOption(ST)
  await fillByLabel(page, 'وقت البدء', '08:00')
  await fillByLabel(page, 'وقت الانتهاء', '16:00')
  const boxes = page.locator('form input[type="checkbox"]')
  await boxes.nth(0).check()
  await boxes.nth(1).check()
  await boxes.nth(2).check()
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/app/shifts/definitions', { timeout: 10000 }).catch(() => {})
  const defs = (await apiGet(page, 'shift-definitions/')).results || []
  const myDef = defs.find(d => d.station === ST && (d.definition_name || '').includes('تعريف من99'))
  step('FIX: definition created via UI', !!myDef, myDef ? `days='${myDef.days}'` : 'not found')
  // list page no longer crashes and renders days
  await page.waitForTimeout(500)
  const defsListText = await page.locator('body').innerText()
  step('UI: definitions list renders (no crash)', defsListText.includes('تعريفات المناوبات') && !defsListText.includes('NaN'), myDef ? 'days row: ' + ((myDef.days || '').split(',').length) + ' days' : '')
  await shot(page, '60-definitions-fixed')

  // ---------- FIX: settlement form (submission_date) ----------
  await nav(page, 'finance/settlements/create')
  await page.waitForTimeout(800)
  await page.locator('form select').first().selectOption(ST)
  const setNums = page.locator('form input[type="number"]')
  await setNums.nth(0).fill('4')  // 5 LYD
  await setNums.nth(1).fill('3')  // 6 LYD
  await setNums.nth(2).fill('2')  // 7 LYD
  await setNums.nth(3).fill('1')  // 8 LYD
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/app/finance/settlements', { timeout: 10000 }).catch(() => {})
  const settlements = (await apiGet(page, 'voucher-settlements/')).results || []
  const mySet = settlements.find(s => s.station === ST && Number(s.total_value) === 60)
  step('FIX: settlement created via UI (4×5+3×6+2×7+1×8=60)', !!mySet, mySet ? JSON.stringify({ tv: mySet.total_value, tc: mySet.total_count, date: mySet.submission_date }) : 'not found')
  if (mySet) step('CHECK: submission_date auto-set', !!mySet.submission_date, mySet.submission_date)
  await shot(page, '61-settlements-fixed')

  // ---------- FIX: tank reading inline form (reading_level + recorded_at) ----------
  await nav(page, 'inventory/tank-readings')
  await page.waitForTimeout(800)
  await page.locator('button', { hasText: 'إضافة قراءة' }).click()
  await page.waitForTimeout(300)
  const trForm = page.locator('form').last()
  await trForm.locator('select').first().selectOption(TANK)
  await trForm.locator('input[type="number"]').first().fill('43500')
  await trForm.locator('button[type="submit"]').click()
  await page.waitForTimeout(1500)
  const trs = (await apiGet(page, 'tank-readings/')).results || []
  const myTr = trs.find(t => String(t.tank) === TANK && Number(t.reading_level) === 43500)
  step('FIX: tank reading saved via UI (43500)', !!myTr, myTr ? 'recorded_at=' + myTr.recorded_at : 'not found')
  const trListText = await page.locator('body').innerText()
  step('UI: tank readings list shows values (no NaN)', !trListText.includes('NaN') && trListText.includes('43,500'), '')
  const tankAfter = await apiGet(page, `tanks/${TANK}/`)
  step('API: tank.current_level synced', Number(tankAfter.current_level) === 43500, 'got ' + tankAfter.current_level)
  await shot(page, '62-tank-readings-fixed')

  // ---------- FIX: delivery request form (fuel_type derived from tank) ----------
  await nav(page, 'inventory/requests/create')
  await page.waitForTimeout(800)
  const reqSels = page.locator('form select')
  await reqSels.nth(0).selectOption(ST)
  await reqSels.nth(1).selectOption(TANK)
  await page.locator('form input[type="number"]').first().fill('15000')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/app/inventory/requests', { timeout: 10000 }).catch(() => {})
  const reqs = (await apiGet(page, 'delivery-requests/')).results || []
  const myReq = reqs.find(r => r.station === ST && Number(r.requested_quantity) === 15000)
  step('FIX: delivery request created via UI', !!myReq, myReq ? JSON.stringify({ fuel: myReq.fuel_type, qty: myReq.requested_quantity, status: myReq.status }) : 'not found')
  await shot(page, '63-requests-fixed')

  // ---------- FIX: delivery form (pre/post_reading, order_date, fuel_type) ----------
  await nav(page, 'inventory/deliveries/create')
  await page.waitForTimeout(800)
  const delSels = page.locator('form select')
  await delSels.nth(0).selectOption(ST)
  await delSels.nth(1).selectOption(TANK)
  // fuel_type should auto-fill from tank
  const fuelShown = await page.locator('form input[readonly]').inputValue()
  step('UI: fuel type auto-filled from tank', fuelShown.includes('بنزين'), fuelShown)
  await page.locator('form input[type="number"]').nth(0).fill('30000') // requested
  await page.locator('form input[type="number"]').nth(1).fill('30000') // expected
  await page.locator('form input[type="number"]').nth(2).fill('43500') // pre_reading
  await page.locator('form input[type="number"]').nth(3).fill('71500') // post_reading → 28000 received
  // live calc panel
  const calcText = await page.locator('form').innerText()
  step('UI: live received/shortage calc shown (28000)', calcText.includes('28,000') || calcText.includes('28000'), '')
  await shot(page, '64-delivery-filled')
  await page.locator('form button[type="submit"]').click()
  await page.waitForURL('**/app/inventory/deliveries', { timeout: 10000 }).catch(() => {})
  await page.waitForTimeout(800)
  const dels = (await apiGet(page, 'deliveries/')).results || []
  const myDel = dels.find(d => d.station === ST && Number(d.expected_quantity) === 30000)
  step('FIX: delivery created via UI', !!myDel, myDel ? JSON.stringify({ received: myDel.received_quantity, shortage: myDel.shortage, status: myDel.status }) : 'not found')
  if (myDel) {
    step('CHECK: received_quantity = 28000', Number(myDel.received_quantity) === 28000, 'got ' + myDel.received_quantity)
    step('CHECK: shortage = 2000', Number(myDel.shortage) === 2000, 'got ' + myDel.shortage)
  }
  const delListText = await page.locator('body').innerText()
  step('UI: deliveries list renders rows (no NaN)', !delListText.includes('NaN'), '')
  await shot(page, '65-deliveries-fixed')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
