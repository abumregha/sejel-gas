// Verify: post-reset empty state + dashboard quick-report form
const { launch, login, nav, apiGet, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()

  step('UI: login', await login(page))

  // ---------- 1. EMPTY STATE AFTER RESET ----------
  const dash = await apiGet(page, 'dashboard/')
  step('1a. dashboard KPIs all zero after reset',
    Number(dash.total_stations) === 0 && Number(dash.total_tanks) === 0 && Number(dash.open_shifts) === 0,
    JSON.stringify(dash))

  await nav(page, 'shifts')
  const shiftBody = await page.evaluate(() => document.body.innerText)
  step('1b. shifts page shows empty message', /لا توجد|لا يوجد/.test(shiftBody))
  await shot(page, 'r-shifts-empty')

  await nav(page, 'stations')
  const stBody = await page.evaluate(() => document.body.innerText)
  step('1c. stations page shows empty message', /لا توجد|لا يوجد/.test(stBody))

  await nav(page, 'finance/fuel-prices')
  await page.waitForTimeout(800)
  const priceBody = await page.evaluate(() => document.body.innerText)
  const priceOk = /0\.15|٠٫١٥/.test(priceBody) && /بنزين|ديزل/.test(priceBody)
  step('1d. fuel prices page shows 0.15 for all fuels', priceOk)
  await shot(page, 'r-fuel-prices')

  // ---------- 2. QUICK-REPORT FORM ----------
  await nav(page, '')
  await page.waitForTimeout(1000)
  const formVisible = await page.locator('form:has(select)').count() > 0
  step('2a. quick-report form visible on dashboard', formVisible)

  // default = daily report with today's date → navigates to /reports/daily?date=...
  await page.locator('button:has-text("عرض التقرير")').click()
  await page.waitForTimeout(1200)
  const url1 = page.url()
  step('2b. daily report opens with date param', /reports\/daily/.test(url1) && /date=/.test(url1), url1)
  const dailyLoaded = await page.evaluate(() => document.body.innerText)
  step('2c. daily report page renders (empty data ok)', /التقرير اليومي|0/.test(dailyLoaded))

  // back to dashboard, pick monthly
  await nav(page, '')
  await page.waitForTimeout(800)
  await page.locator('form select').first().selectOption('monthly')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("عرض التقرير")').click()
  await page.waitForTimeout(1200)
  const url2 = page.url()
  step('2d. monthly report opens with year+month params', /reports\/monthly/.test(url2) && /year=/.test(url2) && /month=/.test(url2), url2)
  const monthlyLoaded = await page.evaluate(() => document.body.innerText)
  step('2e. monthly report page renders', /التقرير الشهري|0/.test(monthlyLoaded))

  // back to dashboard, pick daily-sales
  await nav(page, '')
  await page.waitForTimeout(800)
  await page.locator('form select').first().selectOption('daily-sales')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("عرض التقرير")').click()
  await page.waitForTimeout(1200)
  const url3 = page.url()
  step('2f. daily-sales opens with date param', /daily-sales/.test(url3) && /date=/.test(url3), url3)
  const dsLoaded = await page.evaluate(() => document.body.innerText)
  step('2g. daily-sales page renders', /المبيعات|0/.test(dsLoaded))

  // inventory (no params)
  await nav(page, '')
  await page.waitForTimeout(800)
  await page.locator('form select').first().selectOption('inventory')
  await page.waitForTimeout(400)
  await page.locator('button:has-text("عرض التقرير")').click()
  await page.waitForTimeout(1200)
  const url4 = page.url()
  step('2h. inventory report opens', /reports\/inventory/.test(url4), url4)
  const invLoaded = await page.evaluate(() => document.body.innerText)
  step('2i. inventory report renders empty state', /لا توجد|لا يوجد|0/.test(invLoaded))
  await shot(page, 'r-quick-report-flow')

  await browser.close()
  summary()
})().catch(e => { console.error('FATAL', e); process.exit(1) })
