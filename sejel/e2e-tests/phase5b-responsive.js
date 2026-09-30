// Mobile + tablet viewport verification (§28 #10) — screenshots + overflow check.
const { launch, login, nav, shot, step, summary } = require('./helpers')

;(async () => {
  // Self-seeding: the seed station (81sqlmq0hs) was removed in the legacy
  // cleanup — create a dedicated station for the responsive checks.
  const m = await launch({ viewport: { width: 390, height: 844 } })
  step('mobile: login', await login(m.page))
  const { apiPost } = require('./helpers')
  const wiz = await apiPost(m.page, 'setup-station/', {
    station: { station_name: 'محطة عرض ' + Date.now(), address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 2, meters: 2 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const stationId = wiz.station
  // hard-reload so the freshly created station appears in the owner selector
  await m.page.reload()
  await m.page.waitForTimeout(1500)
  await m.page.waitForSelector('[data-testid="station-selector"]', { timeout: 15000 }).catch(() => {})
  await m.page.locator('[data-testid="station-selector"]').selectOption(stationId)
  await m.page.waitForSelector('[data-testid="island-panel"]', { timeout: 15000 })
  const overflow = await m.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  step(`mobile: no horizontal overflow (px=${overflow})`, overflow <= 0)
  await shot(m.page, '55-mobile-station.png')
  const meterBtn = m.page.locator('[data-testid="island-panel"] button', { hasText: /M\d/ }).first()
  if (await meterBtn.count()) {
    await meterBtn.click()
    await m.page.waitForTimeout(600)
    step('mobile: meter drawer opens', (await m.page.locator('body').innerText()).includes('العداد'))
    await shot(m.page, '56-mobile-drawer.png')
  }
  await m.browser.close()

  // tablet
  const t = await launch({ viewport: { width: 820, height: 1180 } })
  step('tablet: login', await login(t.page))
  await nav(t.page, '/')
  await t.page.waitForSelector('[data-testid="station-selector"]', { timeout: 15000 }).catch(() => {})
  await t.page.locator('[data-testid="station-selector"]').selectOption(stationId)
  await t.page.waitForSelector('[data-testid="island-panel"]', { timeout: 15000 })
  const overflow2 = await t.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  step(`tablet: no horizontal overflow (px=${overflow2})`, overflow2 <= 0)
  await shot(t.page, '57-tablet-station.png')
  await t.browser.close()

  const fails = summary()
  process.exit(fails ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
