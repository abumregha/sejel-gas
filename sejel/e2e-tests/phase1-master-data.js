// Phase 1: UI login + master data seeding via forms
const { launch, login, apiGet, nav, fillByLabel, selectByOptionText, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login via form', await login(page))
  await shot(page, '01-dashboard')

  // reuse station from a previous partial run if present
  const stations0 = (await apiGet(page, 'stations/')).results || []
  let ST = (stations0.find(s => (s.station_name || '').includes('الاختبار')) || {}).name

  if (!ST) {
    await nav(page, 'stations/create')
    await fillByLabel(page, 'اسم المحطة', 'محطة الاختبار الأكتروني')
    await fillByLabel(page, 'العنوان', 'طريق المطار - طرابلس')
    await selectByOptionText(page, 0, 'وكالة')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1500)
    const stations1 = (await apiGet(page, 'stations/')).results || []
    const myStation = stations1.find(s => (s.station_name || '').includes('الاختبار'))
    step('UI: create station', !!myStation, myStation ? myStation.name + ' / ' + myStation.station_name : 'not found after save')
    ST = (myStation || {}).name
  } else {
    // Nothing was created here — read the doc back instead of asserting true,
    // so a deleted/renamed fixture fails this step rather than passing it.
    const reused = await apiGet(page, `stations/${ST}/`)
    step('UI: create station (reused fixture still present)', !!reused && !!reused.station_name,
      `reused ${ST} · ${reused && reused.station_name} · status=${reused && reused.status}`)
  }
  await shot(page, '02-station-created')
  if (!ST) { console.log('ABORT: no station'); await browser.close(); process.exit(1) }

  // ---------- ISLAND via UI ----------
  let myIsland
  const islands0 = (await apiGet(page, 'islands/')).results || []
  myIsland = islands0.find(i => i.station === ST)
  if (!myIsland) {
    await nav(page, 'islands/create')
    await fillByLabel(page, 'اسم الجزيرة', 'جزيرة اختبار 1')
    await page.locator('form select').first().selectOption(ST)
    // numbering is server-side now — no manual number input on the form
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1500)
    const islands1 = (await apiGet(page, 'islands/')).results || []
    myIsland = islands1.find(i => i.station === ST)
  }
  step('UI: create island', !!myIsland, myIsland ? myIsland.name : 'not found')

  // ---------- MACHINE via UI ----------
  let myMachine
  if (myIsland) {
    const machines0 = (await apiGet(page, 'machines/')).results || []
    myMachine = machines0.find(m => m.island === myIsland.name)
    if (!myMachine) {
      await nav(page, 'machines/create')
      await fillByLabel(page, 'اسم المضخة', 'مضخة اختبار 1')
      await page.locator('form select').first().selectOption(myIsland.name)
      // numbering is server-side now — no manual number input on the form
      await page.locator('form button[type="submit"]').click()
      await page.waitForTimeout(1500)
      const machines1 = (await apiGet(page, 'machines/')).results || []
      myMachine = machines1.find(m => m.island === myIsland.name)
    }
  }
  step('UI: create machine', !!myMachine, myMachine ? myMachine.name : 'not found')
  if (myMachine) {
    const mFull = await apiGet(page, `machines/${myMachine.name}/`)
    step('API: machine station auto-populated from island', mFull.station === ST, 'station=' + mFull.station)
  }

  // ---------- TANK via UI ----------
  let myTank
  const tanks0 = (await apiGet(page, 'tanks/')).results || []
  myTank = tanks0.find(t => t.station === ST)
  if (!myTank) {
    await nav(page, 'tanks/create')
    await fillByLabel(page, 'اسم الخزان', 'خزان اختبار بنزين')
    await page.locator('form select').first().selectOption(ST)
    await selectByOptionText(page, 1, 'بنزين')
    await fillByLabel(page, 'السعة (لتر)', '50000')
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1500)
    const tanks1 = (await apiGet(page, 'tanks/')).results || []
    myTank = tanks1.find(t => t.station === ST)
  }
  step('UI: create tank', !!myTank, myTank ? myTank.name + ' fuel=' + myTank.fuel_type : 'not found')

  // ---------- METER via UI ----------
  let myMeter
  if (myMachine) {
    const meters0 = (await apiGet(page, 'meters/')).results || []
    myMeter = meters0.find(m => m.machine === myMachine.name)
    if (!myMeter) {
      await nav(page, 'meters/create')
      await fillByLabel(page, 'كود العداد', 'TEST-M01A')
      await page.locator('form select').first().selectOption(myMachine.name)
      await selectByOptionText(page, 1, 'بنزين')
      if (myTank) await page.locator('form select').nth(2).selectOption(myTank.name)
      await page.locator('form button[type="submit"]').click()
      await page.waitForTimeout(1500)
      const meters1 = (await apiGet(page, 'meters/')).results || []
      myMeter = meters1.find(m => m.machine === myMachine.name)
    }
  }
  step('UI: create meter', !!myMeter, myMeter ? myMeter.name + ' / ' + myMeter.meter_code : 'not found')

  // ---------- EMPLOYEE via UI ----------
  let myEmp
  const emps0 = (await apiGet(page, 'employees/')).results || []
  myEmp = emps0.find(e => e.station === ST)
  if (!myEmp) {
    await nav(page, 'employees/create')
    await fillByLabel(page, 'الاسم', 'موظف الاختبار الآلي')
    await fillByLabel(page, 'الهاتف', '0912345678')
    await page.locator('form select').first().selectOption(ST)
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1500)
    const emps1 = (await apiGet(page, 'employees/')).results || []
    myEmp = emps1.find(e => e.station === ST)
  }
  step('UI: create employee', !!myEmp, myEmp ? myEmp.name : 'not found')

  // ---------- SHIFT DEFINITION via UI ----------
  let myDef
  const defs0 = (await apiGet(page, 'shift-definitions/')).results || []
  myDef = defs0.find(d => d.station === ST)
  if (!myDef) {
    await nav(page, 'shifts/definitions/create')
    await fillByLabel(page, 'اسم التعريف', 'مناوبة اختبار صباحية')
    await page.locator('form select').first().selectOption(ST)
    await fillByLabel(page, 'وقت البدء', '08:00')
    await fillByLabel(page, 'وقت الانتهاء', '16:00')
    const boxes = page.locator('form input[type="checkbox"]')
    await boxes.nth(0).check().catch(() => {})
    await boxes.nth(1).check().catch(() => {})
    await page.locator('form button[type="submit"]').click()
    await page.waitForTimeout(1500)
    const defs1 = (await apiGet(page, 'shift-definitions/')).results || []
    myDef = defs1.find(d => d.station === ST)
  }
  step('UI: create shift definition', !!myDef, myDef ? myDef.name + ' days=' + JSON.stringify(myDef.days) : 'not found')

  console.log('\nSEEDED:', JSON.stringify({ ST, ISL: (myIsland || {}).name, MACHINE: (myMachine || {}).name, TANK: (myTank || {}).name, METER: (myMeter || {}).name, EMP: (myEmp || {}).name, DEF: (myDef || {}).name }))
  await shot(page, '03-phase1-done')
  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message); process.exit(2) })
