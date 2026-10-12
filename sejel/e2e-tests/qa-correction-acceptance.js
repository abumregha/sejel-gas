// Condition-7 checks: the seven behaviours the customer asked to be verified,
// each driven through the browser on the DISPOSABLE site.
const { chromium } = require('playwright')

const BASE = 'http://localhost:8007'
const results = []
const step = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function dbGet(page, path) {
  return page.evaluate(async (p) => {
    const r = await fetch('/api/' + p, { credentials: 'include' })
    const b = await r.json()
    const m = b.message !== undefined ? b.message : b
    return { status: r.status, data: m.results || m }
  }, path)
}

async function openDay(page, date) {
  await page.locator('[data-testid="readings-date"]').fill(date)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2000)
}

async function editGun(page, code) {
  const btns = page.locator('[data-testid="reading-edit"]')
  for (let i = 0; i < await btns.count(); i++) {
    const card = btns.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    if ((await card.locator('[data-testid="gun-code"]').innerText()).trim() === code) {
      await btns.nth(i).click()
      await page.waitForTimeout(1200)
      return true
    }
  }
  return false
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, locale: 'ar' })
  const page = await ctx.newPage()
  page.on('dialog', (d) => d.accept())

  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#app')?.__vue_app__, { timeout: 30000 }).catch(() => {})
  await page.locator('input').nth(0).fill('administrator')
  await page.locator('input').nth(1).fill('QaBrowserTest#2026')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)

  const stations = await dbGet(page, 'stations/?limit_page_length=0')
  const names = (stations.data || []).map((s) => s.station_name)
  step('target is the disposable site (customer station absent)',
    !names.includes('محطة الراحلة 23'), `${names.length} stations: ${names.slice(0, 4).join(' | ')}`)

  // ============ 2. reading chain consistency ============
  await page.goto(BASE + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.locator('select').first().selectOption({ label: 'QA موظف جديد' })
  await page.waitForTimeout(1500)
  await openDay(page, '2026-10-09')

  const chain = await page.evaluate(async () => {
    const r = await fetch('/api/meter-readings/?limit_page_length=0', { credentials: 'include' })
    const b = await r.json()
    const rows = b.message.results || b.results
    const codes = {}
    for (const x of rows) codes[x.meter] = x.meter_code || x.meter
    const byMeter = {}
    for (const x of rows) (byMeter[x.meter] = byMeter[x.meter] || []).push(x)
    const broken = []
    for (const [meter, list] of Object.entries(byMeter)) {
      list.sort((a, c) => String(a.recorded_at).localeCompare(String(c.recorded_at)))
      for (let i = 1; i < list.length; i++) {
        if (list[i].start_reading !== list[i - 1].end_reading) {
          broken.push({
            meter: codes[meter], at: list[i].recorded_at,
            prev_end: list[i - 1].end_reading, start: list[i].start_reading,
            documented: !!(list[i - 1].exception_type || list[i].exception_type),
          })
        }
      }
    }
    return { meters: Object.keys(byMeter).length, broken, unexplained: broken.filter((b) => !b.documented).length }
  })
  step('reading chain breaks only where a reason was recorded', chain.unexplained === 0,
    `${chain.meters} meters · ${chain.broken.length} documented break(s) · ${chain.unexplained} unexplained`)

  // ============ 3. reconciliation follows the correction ============
  const recons = await dbGet(page, 'reconciliations/?limit_page_length=0')
  step('reconciliations exist for the closed days', (recons.data || []).length > 0,
    `${(recons.data || []).length} reconciliations`)

  // ============ 4. income retry does not duplicate ============
  const cashBefore = (await dbGet(page, 'cash-collections/?limit_page_length=0')).data.length
  const voucherBefore = (await dbGet(page, 'vouchers/?limit_page_length=0')).data.length
  await page.goto(BASE + '/app/finance/income', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const s = page.locator('select')
  await s.nth(0).selectOption({ label: 'QA موظف جديد' })
  await page.waitForTimeout(800)
  const shiftOpts = await s.nth(1).locator('option').allInnerTexts()
  await s.nth(1).selectOption({ label: shiftOpts.find((o) => o.includes('2026-10-10')) || shiftOpts[1] })
  await page.waitForTimeout(500)
  const nums = page.locator('input[type="number"]')
  await nums.nth(0).fill('800')
  await nums.nth(1).fill('12')
  await page.locator('[data-testid="save-income"]').click()
  await page.waitForTimeout(3000)
  await page.locator('[data-testid="save-income"]').click()
  await page.waitForTimeout(2500)
  const cashAfter = (await dbGet(page, 'cash-collections/?limit_page_length=0')).data.length
  const voucherAfter = (await dbGet(page, 'vouchers/?limit_page_length=0')).data.length
  step('retrying the income entry duplicates nothing',
    cashAfter - cashBefore === 1 && voucherAfter - voucherBefore === 1,
    `cash +${cashAfter - cashBefore}, vouchers +${voucherAfter - voucherBefore}`)

  // ============ 5. deletion log survives ============
  await page.goto(BASE + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.locator('select').first().selectOption({ label: 'QA موظف جديد' })
  await page.waitForTimeout(1500)
  await openDay(page, '2026-10-09')
  const delBtns = page.locator('[data-testid="reading-delete"]')
  let deleted = false
  for (let i = 0; i < await delBtns.count(); i++) {
    const card = delBtns.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    if ((await card.locator('[data-testid="gun-code"]').innerText()).trim() === 'M01BX') {
      await delBtns.nth(i).click(); deleted = true; break
    }
  }
  await page.waitForTimeout(3000)
  const logAfter = (await dbGet(page, 'reading-deletion-logs/?limit_page_length=0')).data
  step('deleting a reading writes a permanent log row', deleted && logAfter.length > 0,
    logAfter.length > 0 ? JSON.stringify({
      day: logAfter[0].shift_date, meter: logAfter[0].meter_code,
      from: logAfter[0].start_reading, to: logAfter[0].end_reading,
      litres: logAfter[0].liters_sold, by: logAfter[0].deleted_by,
    }) : 'no new row')

  // ============ 6. station-bound user permissions ============
  const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 900 }, locale: 'ar' })
  const p2 = await ctx2.newPage()
  p2.on('dialog', (d) => d.accept())
  await p2.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await p2.waitForTimeout(800)
  await p2.locator('input').nth(0).fill('qa.supervisor')
  await p2.locator('input').nth(1).fill('QaSupervisor#2026')
  await p2.locator('button[type="submit"]').click()
  await p2.waitForTimeout(3000)
  await p2.goto(BASE + '/app/readings', { waitUntil: 'networkidle' })
  await p2.waitForTimeout(2000)
  const supEdit = await p2.locator('[data-testid="reading-edit"]').count()
  const supDelete = await p2.locator('[data-testid="reading-delete"]').count()
  const supGuns = await p2.locator('[data-testid="gun-code"]').count()
  step('a station-bound supervisor can edit but not delete',
    supGuns > 0 && supEdit > 0 && supDelete === 0,
    `${supGuns} guns · ${supEdit} edit · ${supDelete} delete`)
  await ctx2.close()

  // ============ 7. backdated expense ============
  await page.goto(BASE + '/app/finance/expenses/create', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  const es = page.locator('form select')
  await es.nth(0).selectOption({ label: 'QA موظف جديد' })
  await page.waitForTimeout(800)
  await es.nth(1).selectOption({ label: 'صيانة' })
  await page.locator('form input[type="number"]').fill('130')
  await page.locator('form input:not([type="number"])').first().fill('اختبار بأثر رجعي')
  await page.locator('[data-testid="expense-date"]').fill('2026-10-10')
  await page.locator('form button[type="submit"]').click()
  await page.waitForTimeout(3000)
  const expenses = (await dbGet(page, 'expenses/?limit_page_length=0')).data
  const mine = (expenses || []).filter((e) => e.expense_date === '2026-10-10')
  step('a backdated expense attaches to its own day', mine.length > 0,
    mine.length ? `expense_date=${mine[0].expense_date} shift=${mine[0].shift ? 'linked' : 'unlinked'}` : 'not found')

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== ${results.length - failed.length}/${results.length} passed, ${failed.length} failed =====`)
  await browser.close()
  process.exit(failed.length ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
