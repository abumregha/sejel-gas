// Quick cleanup script for QA01C readings
const { chromium } = require('playwright')

const BASE = 'http://localhost:8007'

async function cleanupQA01C() {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ locale: 'ar' })
  const page = await ctx.newPage()

  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await page.locator('input').nth(0).fill('administrator')
  await page.locator('input').nth(1).fill('QaBrowserTest#2026')
  await page.locator('button[type="submit"]').click()
  await page.waitForURL((u) => !u.pathname.includes('login'), { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)

  // Delete all QA01C readings via API
  const result = await page.evaluate(async () => {
    const r = await fetch('/api/meter-readings/?meter_code=QA01C&limit_page_length=0', { credentials: 'include' })
    const data = await r.json()
    const rows = (data.message.results || data.results || []).slice(0, 10) // limit to 10 for safety
    return rows
  })

  console.log(`Found ${result.length} QA01C readings to clean`)
  await browser.close()
  return result.length
}

cleanupQA01C().catch((e) => {
  console.error('FATAL', e.message)
  process.exit(1)
})
