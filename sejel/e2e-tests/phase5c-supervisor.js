// Supervisor scoping UI check (§28 #13 + §3.1): a bound supervisor has no
// station selector, lands directly on their station, and never sees
// manager-only actions.
//
// Self-seeding: the seed user (supervisor_a @ station 445) was removed in the
// legacy cleanup — create a dedicated station + bound supervisor per run.
const { launch, apiPost, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  await page.goto('http://localhost:8004/login/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(400)
  await page.locator('input').nth(0).fill('admin@sejel.ly')
  await page.locator('input').nth(1).fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 20000 }).catch(() => {})
  step('admin: login', !(page.url().includes('login')))

  // --- dedicated station + supervisor bound to it -----------------------------
  const stationName = 'محطة مشرف ' + Date.now()
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: stationName, address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 2, meters: 2 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const ST = wiz.station
  step('admin: station for supervisor created', !!ST, ST)

  const username = 'supv' + Date.now().toString().slice(-8)
  const password = 'Pilot@2026!sup'
  const user = await apiPost(page, 'users/', {
    username,
    first_name: 'مشرف اختبار',
    password,
    role: 'supervisor',
    station: ST,
  })
  step('admin: supervisor user created + bound', !!user.name, JSON.stringify({ user: user.name, station: ST }))

  await browser.close()

  // --- supervisor logs in -------------------------------------------------------
  const s = await launch()
  await s.page.goto('http://localhost:8004/login/', { waitUntil: 'domcontentloaded' })
  await s.page.waitForTimeout(400)
  await s.page.locator('input').nth(0).fill(username)
  await s.page.locator('input').nth(1).fill(password)
  await s.page.locator('button[type="submit"]').click()
  await s.page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 20000 }).catch(() => {})
  step('supervisor: login', !(s.page.url().includes('login')))

  await s.page.waitForSelector('[data-testid="island-panel"]', { timeout: 15000 })
  await shot(s.page, '58-supervisor-dashboard.png')

  const body = await s.page.locator('body').innerText()
  step('supervisor: bound station auto-loads', body.includes(stationName))
  step('supervisor: no station selector', !(await s.page.locator('[data-testid="station-selector"]').count()))
  step('supervisor: manager-only action hidden', !body.includes('إدارة المحطات'))
  step('supervisor: supervisor actions visible', body.includes('قراءات المضخات') || body.includes('قراءة عداد') || body.includes('إقفال مناوبة'))

  const fails = summary()
  await s.browser.close()
  process.exit(fails ? 1 : 0)
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
