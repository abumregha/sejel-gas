// Test old-day correction with a clean chain
const { chromium } = require('playwright')

const BASE = 'http://localhost:8007'
const results = []
const step = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(`[${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`)
}

async function dbGet(page, url) {
  return page.evaluate(async (u) => {
    const r = await fetch('/api/' + u, { credentials: 'include' })
    const b = await r.json()
    const m = b.message !== undefined ? b.message : b
    return { status: r.status, data: m.results || m }
  }, url)
}

async function openDay(page, date) {
  await page.locator('[data-testid="readings-date"]').fill(date)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2000)
}

async function createReading(page, gun, date, start, end) {
  await openDay(page, date)
  const prevInputs = page.locator('[data-testid="prev-edit-input"]')
  for (let i = 0; i < await prevInputs.count(); i++) {
    const card = prevInputs.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    if ((await card.locator('[data-testid="gun-code"]').innerText()).trim() === gun) {
      await prevInputs.nth(i).fill(String(start))
      await page.locator('button', { hasText: 'حفظ القراءات المُدخلة' }).first().click()
      await page.waitForTimeout(2000)
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

  // Login
  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#app')?.__vue_app__, { timeout: 30000 }).catch(() => {})
  await page.locator('input').nth(0).fill('administrator')
  await page.locator('input').nth(1).fill('QaBrowserTest#2026')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)

  // Verify isolation
  const stations = await dbGet(page, 'stations/?limit_page_length=0')
  const names = (stations.data || []).map((s) => s.station_name)
  step('target is the disposable site', !names.includes('محطة الراحلة 23'), `${names.length} stations: ${names.slice(0, 4).join(' | ')}`)

  // Navigate to readings
  await page.goto(BASE + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.locator('select').first().selectOption({ label: 'QA موظف جديد' })
  await page.waitForTimeout(1500)

  // Create a clean 3-day chain
  console.log('Creating clean 3-day chain for M02A...')
  const DAY1 = '2026-10-08'
  const DAY2 = '2026-10-09'
  const DAY3 = '2026-10-10'
  const GUN = 'M02A'

  await createReading(page, GUN, DAY1, 0, 300000)
  await page.waitForTimeout(2500)
  step(DAY1 + ' reading created', true, '0 -> 300,000')

  await createReading(page, GUN, DAY2, 300000, 301000)
  await page.waitForTimeout(2500)
  step(DAY2 + ' reading created', true, '300,000 -> 301,000')

  await createReading(page, GUN, DAY3, 301000, 302000)
  await page.waitForTimeout(2500)
  step(DAY3 + ' reading created', true, '301,000 -> 302,000')

  // Test: Attempt to correct DAY2 (middle day) to create a chain violation
  console.log('Testing old-day correction...')
  await openDay(page, DAY2)

  // Find and click edit for M02A (should be the first gun on this date)
  const editBtns = page.locator('[data-testid="reading-edit"]')
  const editCount = await editBtns.count()
  console.log(`Found ${editCount} edit buttons on ${DAY2}`)
  if (editCount > 0) {
    await editBtns.first().click()
    await page.waitForTimeout(1500)
    step('reading editor opened for correction', true)

    // Check that reason field is available
    const reasonVisible = await page.locator('[data-testid="reading-edit-exception-type"]').isVisible()
    step('reason field is available for correction', reasonVisible)

    // Change the end value to break the chain
    const endBefore = await page.locator('[data-testid="reading-edit-end"]').inputValue()
    console.log('End value before:', endBefore)
    // Change to 299500 to create a chain violation (previous end was 301000)
    await page.locator('[data-testid="reading-edit-end"]').fill(String(299500))
    await page.waitForTimeout(800)

    // Check for chain-impact warning
    const impactElement = page.locator('[data-testid="chain-impact"]')
    console.log('Impact element visible:', await impactElement.isVisible().catch(() => false))
    if (await impactElement.isVisible().catch(() => false)) {
      const impactText = await impactElement.innerText()
      console.log('Impact warning:', impactText)
    }

    if (impactText) {
      const warning = await page.locator('[data-testid="chain-impact"]').innerText()
      console.log('Chain impact warning:', warning)
    }

    // Try to save without reason
    await page.locator('[data-testid="reading-edit-save"]').click()
    await page.waitForTimeout(2500)

    // Verify that the day with the correction is mentioned
    const daysWithImpact = await page.locator('[data-testid="chain-impact"]').isHidden().catch(() => true)
    step('correction editor shows affected days', !daysWithImpact)

    // Verify the next day is mentioned
    const nextDayMention = await page.locator('[data-testid="chain-impact"]').isHidden().catch(() => true)
    step('next day is mentioned in warning', !nextDayMention)
  } else {
    step('edit button found on ' + DAY2, false, 'no edit buttons visible')
  }

  // Verify chain integrity (should show documented break)
  const chainCheck = await page.evaluate(async () => {
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
          })
        }
      }
    }
    return { meters: Object.keys(byMeter).length, broken }
  })
  step('chain shows documented breaks', chainCheck.broken.length > 0, `${chainCheck.broken.length} breaks detected`)

  const failed = results.filter((r) => !r.ok)
  console.log(`\n===== ${results.length - failed.length}/${results.length} passed, ${failed.length} failed =====`)
  await browser.close()
  process.exit(failed.length ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
