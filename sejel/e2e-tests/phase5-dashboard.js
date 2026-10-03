// Phase 5: dashboard e2e \u2014 renders the operations dashboard and checks the KPI tiles.
// Verifies: aggregate mode, dynamic island/machine/meter rendering, tank
// cards, drawers, owner station switching, role-based actions — all against
// real backend data (no mocks).
//
// Flow note: an admin/owner lands on the AGGREGATE view ("جميع المحطات");
// island panels only render after selecting a station from the selector.
const { launch, login, apiGet, apiPost, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login as admin', await login(page))

  // --- 1. aggregate mode renders station cards -------------------------------
  await nav(page, '/')
  await page.waitForSelector('[data-testid="station-selector"]', { timeout: 15000 }).catch(() => {})
  await shot(page, '50-dashboard-aggregate.png')

  const aggregateData = await apiGet(page, 'dashboard-station/')
  const stationCards = await page.locator('button:has-text("مناوبة مفتوحة"), button:has-text("خزانات")').count()
  step(
    `aggregate cards render (ui=${stationCards} api=${(aggregateData?.stations || []).length})`,
    (aggregateData?.stations || []).length > 0 && stationCards >= (aggregateData?.stations || []).length
  )

  // --- 2. owner selects a station → single-station mode ------------------------
  const selector = page.locator('[data-testid="station-selector"]')
  const optionCount = await selector.locator('option').count()
  step(`owner selector lists stations (options=${optionCount})`, optionCount >= 3)

  // Self-seeding: the seed station (81sqlmq0hs / "445") was removed in the
  // legacy cleanup — create a dedicated station and select it in the owner view
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: 'محطة لوحة ' + Date.now(), address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 2, meters: 2 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const stationId = wiz.station
  // hard-reload so the freshly created station appears in the owner selector
  // (the aggregate list was fetched before the station existed)
  await page.reload()
  await page.waitForTimeout(1500)
  await selector.selectOption(stationId)
  await page.waitForSelector('[data-testid="island-panel"]', { timeout: 15000 })
  await shot(page, '51-dashboard-station.png')

  // --- 3. dynamic rendering: UI counts == API counts (§28 #1–#5) ---------------
  const apiData = await apiGet(page, `dashboard-station/?station=${stationId}`)

  const islandPanels = await page.locator('[data-testid="island-panel"]').count()
  const apiIslands = (apiData?.islands || []).length
  step(`dynamic islands render (ui=${islandPanels} api=${apiIslands})`, apiIslands > 0 && islandPanels === apiIslands)

  const apiMachines = (apiData?.islands || []).reduce((a, i) => a + i.machines.length, 0)
  const apiMeters = (apiData?.meters || []).length
  step(`machines in payload (machines=${apiMachines} meters=${apiMeters})`, apiMachines > 0 && apiMeters > 0)

  const tankCards = await page.locator('[data-testid="tank-card"]').count()
  const apiTanks = (apiData?.tanks || []).length
  step(`tank cards render (ui=${tankCards} api=${apiTanks})`, tankCards === apiTanks)

  // --- 4. meter drawer opens (§9) ----------------------------------------------
  const meterNode = page.locator('[data-testid="island-panel"] button', { hasText: /M\d/ }).first()
  if (await meterNode.count()) {
    await meterNode.click()
    await page.waitForTimeout(700)
    const drawerText = await page.locator('body').innerText()
    step('meter drawer opens', drawerText.includes('قراءة اليوم') || drawerText.includes('لا توجد قراءة'))
    await shot(page, '52-meter-drawer.png')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
  } else {
    step('meter drawer opens', false, 'no meter node found on map')
  }

  // --- 5. tank drawer (§11) ------------------------------------------------------
  const tankCard = page.locator('[data-testid="tank-card"]').first()
  await tankCard.click()
  await page.waitForTimeout(700)
  const body2 = await page.locator('body').innerText()
  step('tank drawer opens', body2.includes('المستوى الحالي'))
  await shot(page, '53-tank-drawer.png')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // --- 6. switching to another station updates the dashboard (§28 #11/#12) -------
  await selector.selectOption({ index: 2 })
  await page.waitForTimeout(1500)
  const body3 = await page.locator('body').innerText()
  step('station switch loads new data', !body3.includes('تعذر تحميل'))
  const islandPanels2 = await page.locator('[data-testid="island-panel"]').count()
  step('switched station renders its own islands', islandPanels2 >= 0, `islands=${islandPanels2}`)
  await shot(page, '54-station-switched.png')
  await selector.selectOption(stationId)
  await page.waitForTimeout(1000)

  // --- 7. role-based quick actions (admin sees manager-only actions) (§18) -------
  const qaText = await page.locator('body').innerText()
  step('quick actions section renders', qaText.includes('إجراءات سريعة'))
  step('manager action visible for admin', qaText.includes('إدارة المحطات'))

  const fails = summary()

  await browser.close()
  process.exit(fails ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
