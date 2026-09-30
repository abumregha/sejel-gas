// Phase 4: read-only sweep of all views + reports + dashboard
const { launch, login, apiGet, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))
  const today = new Date().toISOString().split('T')[0]

  const pages = [
    ['/', 'dashboard', 'لوحة التحكم'],
    ['stations', 'stations list', 'المحطات'],
    ['islands', 'islands list', 'الجزر'],
    ['machines', 'machines list', 'المضخات'],
    ['meters', 'meters list', 'العدادات'],
    ['tanks', 'tanks list', 'الخزانات'],
    ['employees', 'employees list', 'الموظفين'],    ['shifts/definitions', 'definitions list', 'التعريفات'],
    ['shifts', 'shifts list', 'المناوبات'],
    ['shifts/gaps', 'meter gaps report', 'فجوات'],
    ['finance', 'finance hub', 'المالية'],
    ['finance/income', 'income entry', 'إدخال إيرادات'],
    ['finance/daily-sales', 'daily sales', 'المبيعات المالية'],
    ['finance/cash', 'cash list', 'التحصيل'],
    ['finance/vouchers', 'voucher list', 'الكوبونات'],
    ['finance/pos', 'POS list', 'POS'],
    ['finance/expenses', 'expense list', 'المصروفات'],
    ['finance/settlements', 'settlements list', 'التسويات'],
    ['finance/reconciliations', 'reconciliations list', 'التسويات المالية'],
    ['inventory/deliveries', 'deliveries list', 'الشحنات'],
    ['inventory/tank-readings', 'tank readings list', 'قراءات الخزانات'],
    ['inventory/transfers', 'transfers list', 'التحويلات'],
    ['inventory/shortages', 'shortages list', 'النقص'],
    ['inventory/fuel-reconciliation', 'fuel recon list', 'تسوية الوقود'],
    ['inventory/requests', 'requests list', 'طلبات التوريد'],
    ['reports/daily', 'daily report', 'التقرير'],
    ['reports/monthly', 'monthly report', 'الشهري'],
    ['reports/inventory', 'inventory report', 'المخزون'],
    ['settings/users', 'users list', 'المستخدمين'],
    ['guide', 'guide', 'دليل'],
  ]

  for (const [route, name, expect] of pages) {
    // empty tables render < 100 chars when no data is seeded — the sweep
    // checks "page renders without crashing", not "data exists"
    const minChars = route === 'employees' ? 50 : 100
    try {
      await nav(page, route)
      const body = await page.locator('body').innerText()
      const rendered = body.length > minChars
      const hasExpected = !expect || body.includes(expect)
      const nanCount = (body.match(/NaN/g) || []).length
      step(`VIEW ${name}: renders`, rendered, `chars=${body.length}` + (nanCount ? ` NaN×${nanCount}` : ''))
      if (!hasExpected) console.log(`   ⚠ missing expected text "${expect}" on ${name}`)
      if (nanCount) console.log(`   ⚠ ${name} has ${nanCount} NaN cells`)
    } catch (e) {
      step(`VIEW ${name}: renders`, false, e.message.split('\n')[0])
    }
  }

  // detail pages for the seeded records
  const shifts = (await apiGet(page, 'shifts/')).results || []
  const myShift = shifts[0]
  if (myShift) {
    await nav(page, `shifts/${myShift.name}`)
    const b = await page.locator('body').innerText()
    step('VIEW shift detail', b.length > 200, 'chars=' + b.length + ' NaN×' + (b.match(/NaN/g) || []).length)
  }
  const stations = (await apiGet(page, 'stations/')).results || []
  // use the first live station — the old hardcoded r56gmqnon6 was deleted
  const myStation = stations[0]
  if (myStation) {
    await nav(page, `stations/${myStation.name}`)
    const sb = await page.locator('body').innerText()
    step('VIEW station detail', sb.length > 50, 'chars=' + sb.length + ' NaN×' + (sb.match(/NaN/g) || []).length)
    await shot(page, '40-station-detail')
  }

  const tanks = (await apiGet(page, 'tanks/')).results || []
  const myTank = (tanks.find(t => t.station === (myStation && myStation.name)) || {})
  if (myTank.name) {
    await nav(page, `tanks/${myTank.name}`)
    const tb = await page.locator('body').innerText()
    step('VIEW tank detail', tb.length > 50, 'chars=' + tb.length + ' NaN×' + (tb.match(/NaN/g) || []).length)
  }

  // reports API check
  const daily = await page.evaluate(async (d) => {
    const r = await fetch('/api/reports/daily/?date=' + d, { credentials: 'include' })
    const j = await r.json(); return j.message || j
  }, today)
  console.log('daily report:', JSON.stringify(daily).slice(0, 300))
  const monthly = await page.evaluate(async () => {
    const r = await fetch('/api/reports/monthly/?year=2026&month=9', { credentials: 'include' })
    const j = await r.json(); return j.message || j
  })
  console.log('monthly report:', JSON.stringify(monthly).slice(0, 300))

  const dash = await page.evaluate(async () => {
    const r = await fetch('/api/dashboard/', { credentials: 'include' })
    const j = await r.json(); return j.message || j
  })
  console.log('dashboard API:', JSON.stringify(dash))
  step('API: dashboard responds', !!dash, JSON.stringify(dash).slice(0, 120))

  await shot(page, '41-final-dashboard')
  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
