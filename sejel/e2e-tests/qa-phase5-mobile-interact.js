// PHASE 5 (Round 3) — hands-on 390×844 interaction check.
// Automated width measurements only prove the numbers; this script actually
// taps and types on the phone viewport the way the employee does, and reports
// what the finger would hit.
const { shot, uiLogin } = require('./qa')

const BASE = 'http://localhost:8004'
const VIEW = { width: 390, height: 844 }

const rect = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const st = getComputedStyle(el)
  return {
    w: Math.round(r.width), h: Math.round(r.height),
    fontSize: st.fontSize, visible: r.width > 0 && r.height > 0,
  }
}, sel)

;(async () => {
  const { chromium } = require('playwright')
  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  const ctx = await browser.newContext({ viewport: VIEW, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()

  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await uiLogin(page, 'owner@sejel.ly', 'owner123')
  await page.waitForTimeout(1200)
  console.log('after login URL:', page.url())

  

  // ── Dashboard on a phone ────────────────────────────────────────────────
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  // A manager who works across several stations is asked to pick one before the
  // operational panel appears — correct behaviour, but this script drives the
  // station-bound view, so pick the pilot the way an employee would.
  const stationPicker = page.locator('[data-testid="station-selector"]')
  if (await stationPicker.count()) {
    const idx = (await stationPicker.locator('option').allTextContents())
      .findIndex((t) => t.includes('محطة تجريبية'))
    if (idx >= 0) await stationPicker.selectOption({ index: idx })
    await page.waitForTimeout(2000)
    console.log('station picked at index', idx)
  }
  const cta = await rect(page, '[data-testid="today-primary-action"]')
  console.log('dashboard primary action:', JSON.stringify(cta))
  console.log('dashboard bottom-nav buttons:', await page.evaluate(() =>
    [...document.querySelectorAll('.bottom-nav-item')].map((b) => Math.round(b.getBoundingClientRect().height))))
  await shot(page, 'qa-p5-mobile-dashboard')

  // tap the primary action like a finger would
  await page.click('[data-testid="today-primary-action"]')
  await page.waitForTimeout(2500)
  console.log('after tapping primary action URL:', page.url())
  await shot(page, 'qa-p5-mobile-cta-tap')

  // The CTA follows the state of the day: on an open day it opens the readings
  // screen, on a day that phase 4 already closed it points at the reconciliation.
  // This script exercises the readings form, so go there explicitly — and record
  // which way the CTA pointed, since that choice is itself worth knowing.
  if (!page.url().includes('/readings')) {
    console.log('CTA pointed somewhere other than readings (day already closed) — navigating directly')
    await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    // Use a station whose guns are still UNREAD. On the pilot every gun is
    // already read, so the card shows the saved value instead of an input and the
    // typing part of this check silently does nothing.
    const rs = page.locator('[data-testid="readings-station"]')
    if (await rs.count()) {
      const opts = await rs.locator('option').allTextContents()
      const ridx = opts.findIndex((t) => t.includes('QA Edge Station'))
      if (ridx >= 0) await rs.selectOption({ index: ridx })
      await page.waitForTimeout(2000)
    }
  }
  await shot(page, 'qa-p5-mobile-readings')

  // ── Readings screen: type into a gun ───────────────────────────────────
  const inputs = await page.evaluate(() => [...document.querySelectorAll('[data-testid="gun-current-input"]')]
    .map((el, i) => ({ i, h: Math.round(el.getBoundingClientRect().height), fs: getComputedStyle(el).fontSize })))
  console.log('reading inputs:', JSON.stringify(inputs))
  if (inputs.length) {
    const before = inputs[0].h
    await page.click('[data-testid="gun-current-input"]')
    await page.waitForTimeout(400)
    console.log('page zoomed on focus?', await page.evaluate(() =>
      window.visualViewport ? +(window.visualViewport.scale).toFixed(2) : 'n/a'), 'input h', before)
    await page.keyboard.type('123456')
    await page.waitForTimeout(300)
    console.log('typed value:', await page.inputValue('[data-testid="gun-current-input"]').catch(() => 'n/a'))
    await shot(page, 'qa-p5-mobile-typed')
  }

  const save = await rect(page, '[data-testid="save-readings"]')
  console.log('save button:', JSON.stringify(save))
  const close = await rect(page, '[data-testid="close-day"]')
  console.log('close-day button:', JSON.stringify(close))
  console.log('bottom nav overlap check:', await page.evaluate(() => {
    const nav = document.querySelector('nav.fixed.bottom-0')
    const save = document.querySelector('[data-testid="save-readings"]')
    if (!nav || !save) return 'n/a'
    const n = nav.getBoundingClientRect(), s = save.getBoundingClientRect()
    return s.bottom > n.top ? `SAVE IS UNDER THE NAV (${Math.round(s.bottom)} > ${Math.round(n.top)})` : 'clear'
  }))

  await browser.close()
})().catch((e) => { console.error('FATAL', e); process.exit(1) })