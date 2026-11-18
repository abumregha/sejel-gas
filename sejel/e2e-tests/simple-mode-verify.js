// Simple Mode end-to-end verification — TARGETS THE ISOLATED QA SITE ONLY.
// Run: QA_BASE=http://localhost:8007 node simple-mode-verify.js
// Refuses to run against any other host (isolation guard, same policy as helpers.js).
const { chromium } = require('playwright')
const fs = require('fs')

const BASE = process.env.QA_BASE || 'http://localhost:8007'
if (!BASE.includes(':8007')) {
  console.error('REFUSING: this suite only runs against the isolated :8007 QA site')
  process.exit(1)
}
const CREDS = JSON.parse(fs.readFileSync('/tmp/opencode/operator_creds.json', 'utf8'))

const results = []
function step(name, ok, detail = '') {
  results.push({ name, ok })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function apiLogin(page) {
  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  // login via UI, return csrf for raw fetches from the page context
  await page.waitForFunction(() => {
    const el = document.querySelector('#app'); return el && el.__vue_app__
  }, { timeout: 20000 }).catch(() => {})
  await page.locator('input').nth(0).fill(CREDS.username)
  await page.locator('input').nth(1).fill(CREDS.password)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 20000 })
  return page.evaluate(() => fetch('/api/auth/me/').then(r => r.json()))
    .then(m => m.message.csrf_token || (m.message.user && m.message.csrf_token))
}

;(async () => {
  const browser = await chromium.launch()

  // ---------- OPERATOR (supervisor, bound to station) ----------
  const op = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage()
  op.on('dialog', d => d.accept())

  const csrf = await apiLogin(op)
  step('operator: login', !op.url().includes('login'))
  step('operator: lands on /simple', op.url().includes('/simple'), op.url())
  await op.waitForSelector('[data-testid="simple-today"]', { timeout: 15000 })

  // Home shape
  const navReadings = await op.locator('[data-testid="simple-nav-readings"]').count()
  const navIncome = await op.locator('[data-testid="simple-nav-income"]').count()
  const navTank = await op.locator('[data-testid="simple-nav-tank"]').count()
  const navDelivery = await op.locator('[data-testid="simple-nav-delivery"]').count()
  const closeBtn = await op.locator('[data-testid="simple-close-day"]').count()
  const mmLink = await op.locator('[data-testid="simple-manager-mode"]').count()
  step('operator: readings/income/tank buttons visible', navReadings === 1 && navIncome === 1 && navTank === 1)
  step('operator: delivery button HIDDEN (B1 option a)', navDelivery === 0)
  step('operator: day-close button hidden (canCloseDay)', closeBtn === 0)
  step('operator: Manager Mode link hidden', mmLink === 0)

  // Deep nav into Manager Mode bounces back
  await op.goto(BASE + '/finance/')
  await op.waitForTimeout(1200)
  step('operator: /finance bounces to /simple', op.url().includes('/simple'), op.url())

  // --- Action 1: pump readings (2 taps: nav + save) ---
  await op.goto(BASE + '/simple/readings')
  await op.waitForSelector('[data-testid="simple-gun-input"]', { timeout: 15000 })
  const guns = await op.locator('[data-testid="simple-gun-input"]').count()
  step('operator: one field per gun', guns >= 2, `guns=${guns}`)
  // exception fields must be hidden initially
  let excCount = await op.locator('[data-testid="simple-gun-exception"]').count()
  step('operator: exception fields hidden initially', excCount === 0)
  // Exception fields appear ONLY while the typed value is lower/negative —
  // checked BEFORE saving, then corrected so the save books a normal reading.
  // (Fresh gun: prev = 0, so a negative value is the way to exercise it.)
  await op.locator('[data-testid="simple-gun-input"]').nth(0).fill('-5')
  await op.waitForTimeout(400) // Vue re-render after v-model update
  excCount = await op.locator('[data-testid="simple-gun-exception"]').count()
  step('operator: exception fields appear ONLY when lower', excCount === 1)
  await op.locator('[data-testid="simple-gun-input"]').nth(0).fill('1500')
  excCount = await op.locator('[data-testid="simple-gun-exception"]').count()
  step('operator: exception fields disappear when corrected', excCount === 0)
  // Idempotent check: the badge must appear for exactly the guns that are
  // unsaved AND have no previous reading. On a reused fixture station the guns
  // have history, so a hardcoded "2 fresh guns" expectation would fail.
  const gunCards = op.locator('[data-testid="simple-gun-card"]')
  let expectedOpening = 0
  for (let i = 0; i < (await gunCards.count()); i++) {
    const saved = await gunCards.nth(i).getAttribute('data-saved')
    const prev = await gunCards.nth(i).getAttribute('data-prev')
    if (saved === 'false' && prev === '') expectedOpening++
  }
  const openingBadges = await op.locator('[data-testid="simple-gun-opening"]').count()
  step('operator: opening-reading badge exactly on fresh guns', openingBadges === expectedOpening,
    `badges=${openingBadges} expected=${expectedOpening}`)
  await op.locator('[data-testid="simple-gun-input"]').nth(1).fill('2500')
  await op.screenshot({ path: 'shots/simple-readings-filled.png' })
  await op.locator('[data-testid="simple-save-readings"]').click()
  await op.waitForSelector('[data-testid="simple-gun-saved"]', { timeout: 20000 })
  const savedCount = await op.locator('[data-testid="simple-gun-saved"]').count()
  step('operator: readings saved', savedCount >= 2, `saved=${savedCount}`)

  // --- Action 2: income (2 taps: nav + save) ---
  await op.goto(BASE + '/simple/income')
  await op.waitForSelector('[data-testid="simple-income-shift-note"]', { timeout: 20000 })
  const shiftNote = await op.locator('[data-testid="simple-income-shift-note"]').innerText()
  step('operator: shift auto-resolved', /المناوبة/.test(shiftNote), shiftNote.slice(0, 60))
  await op.locator('[data-testid="simple-cash"]').fill('500')
  await op.locator('[data-testid="simple-coupon-5"]').fill('2')
  await op.locator('[data-testid="simple-pos-amount"]').fill('120')
  await op.locator('[data-testid="simple-pos-count"]').fill('3')
  await op.locator('[data-testid="simple-save-income"]').click()
  await op.waitForSelector('[data-testid="global-toast"]', { timeout: 20000 })
  const incomeToast = await op.locator('[data-testid="global-toast"]').innerText()
  step('operator: income saved', incomeToast.includes('نجاح'), incomeToast)

  // --- Action 3: tank reading (2-3 taps) ---
  await op.goto(BASE + '/simple/tank-reading')
  await op.waitForSelector('[data-testid="simple-tank-select"]', { timeout: 15000 })
  const tankOptions = await op.locator('[data-testid="simple-tank-select"] option').count()
  if (tankOptions <= 2) await op.locator('[data-testid="simple-tank-select"]').selectOption({ index: 1 })
  await op.locator('[data-testid="simple-tank-reading"]').fill('9500')
  await op.locator('[data-testid="simple-save-tank"]').click()
  await op.waitForSelector('[data-testid="global-toast"]', { timeout: 20000 })
  const tankToast = await op.locator('[data-testid="global-toast"]').innerText()
  step('operator: tank reading saved', tankToast.includes('نجاح'), tankToast)

  // Direct delivery URL: quiet refusal, no error
  await op.goto(BASE + '/simple/delivery')
  await op.waitForSelector('[data-testid="simple-delivery-forbidden"]', { timeout: 15000 })
  step('operator: direct /simple/delivery shows quiet refusal', true)

  // Today summary reflects the work
  await op.goto(BASE + '/simple/')
  await op.waitForSelector('[data-testid="simple-today"]', { timeout: 15000 })
  await op.waitForTimeout(1500)
  const liters = await op.locator('[data-testid="simple-today-liters"]').innerText()
  const income = await op.locator('[data-testid="simple-today-income"]').innerText()
  // NOTE: on a station's FIRST day every gun's first reading is an opening
  // baseline that books 0 L (backend rule, badged in the UI) — liters 0 here
  // is correct. Income must reflect the saved legs (500 cash + 120 POS).
  step('operator: today summary shows income', income.trim() !== '0.00 د.ل' && income.includes('620'), income)
  step('operator: today summary shows liters cell', liters.trim() !== '', liters)
  await op.screenshot({ path: 'shots/simple-home-operator.png' })

  // ---------- ADMIN (manager-level) ----------
  const admCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const adm = await admCtx.newPage()
  adm.on('dialog', d => d.accept())
  await adm.goto(BASE + '/login/')
  // Pre-select the fixture station so admin skips Manager Mode's
  // select-station screen and day-close targets the fixture's day.
  if (process.env.QA_STATION) {
    await adm.evaluate((s) => localStorage.setItem('sejel-current-station', s), process.env.QA_STATION)
  }
  await adm.waitForFunction(() => {
    const el = document.querySelector('#app'); return el && el.__vue_app__
  }, { timeout: 20000 }).catch(() => {})
  await adm.locator('input').nth(0).fill('admin@sejel.ly')
  await adm.locator('input').nth(1).fill('admin123')
  await adm.locator('button[type="submit"]').click()
  await adm.waitForURL((u) => !u.pathname.includes('login'), { timeout: 20000 })
  // Unbound admin without a prior selection: Manager Mode requires a station
  // (existing behavior) — pick the first station card and continue.
  if (adm.url().includes('select-station')) {
    await adm.locator('button').first().click()
    await adm.waitForURL((u) => !u.pathname.includes('select-station'), { timeout: 20000 })
  }
  step('admin: lands on old dashboard (not /simple)', !adm.url().includes('/simple'), adm.url())

  // admin visits simple mode: 4 buttons incl. delivery
  await adm.goto(BASE + '/simple/')
  await adm.waitForSelector('[data-testid="simple-today"]', { timeout: 15000 })
  const admDelivery = await adm.locator('[data-testid="simple-nav-delivery"]').count()
  const admMM = await adm.locator('[data-testid="simple-manager-mode"]').count()
  step('admin: delivery button visible (4 actions)', admDelivery === 1)
  step('admin: Manager Mode link visible', admMM === 1)

  // --- Action 4: delivery, direct, 3 taps (nav + quickfill + save) ---
  await adm.goto(BASE + '/simple/delivery')
  await adm.waitForSelector('[data-testid="simple-delivery-tank"]', { timeout: 15000 })
  await adm.locator('[data-testid="simple-delivery-tank"]').selectOption({ index: 1 })
  await adm.locator('[data-testid="simple-delivery-qty-40k"]').click()
  const qv = await adm.locator('[data-testid="simple-delivery-qty"]').inputValue()
  step('admin: quick-fill 40,000 works', qv === '40000', `qty=${qv}`)
  await adm.locator('[data-testid="simple-save-delivery"]').click()
  await adm.waitForSelector('[data-testid="global-toast"]', { timeout: 20000 })
  const delToast = await adm.locator('[data-testid="global-toast"]').innerText()
  step('admin: delivery saved', delToast.includes('نجاح'), delToast)

  // --- Day close from Simple Home: ONE confirmation ---
  await adm.goto(BASE + '/simple/')
  await adm.waitForSelector('[data-testid="simple-close-day"]', { timeout: 15000 })
  let confirms = 0
  adm.on('dialog', () => { confirms++ })
  await adm.locator('[data-testid="simple-close-day"]').click()
  await adm.waitForSelector('[data-testid="simple-day-closed"]', { timeout: 30000 })
  step('admin: day closed from Simple Mode', true)
  step('admin: exactly ONE confirmation dialog', confirms === 1, `confirms=${confirms}`)
  await adm.screenshot({ path: 'shots/simple-home-closed.png' })

  await browser.close()
  const fails = results.filter(r => !r.ok).length
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS')
  process.exit(fails ? 1 : 0)
})().catch((e) => { console.error('SUITE ERROR:', e.message); process.exit(1) })
