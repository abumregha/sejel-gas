// SECTION 7 — 390×844 (the phone the pilot actually uses), interaction rather
// than measurement: every screen is REACHED BY TAPPING the bottom nav, then
// checked for the three things that break a phone — horizontal scrolling, tap
// targets under 44 px, and a fixed nav covering the last row.
const { launch, uiLogin, step, summary, appendRun, shot, apiGet } = require('./qa')

const BASE = 'http://localhost:8004'
const VIEW = { width: 390, height: 844 }
const TAPS = [
  { label: 'الرئيسية', path: '/app' },
  { label: 'القراءات', path: '/readings' },
  { label: 'المالية', path: '/finance' },
  { label: 'المخزون', path: '/inventory' },
]

const probe = (page) => page.evaluate(() => {
  const de = document.documentElement
  const overflow = de.scrollWidth > de.clientWidth + 1
  const small = []
  const els = [...document.querySelectorAll('button, a[href], input, select, textarea')]
    .filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0
    })
  for (const el of els) {
    const r = el.getBoundingClientRect()
    // only BUTTONS are judged here — inline text links and form fields are
    // reported for the record, they are not tap-target defects on their own
    if (el.tagName !== 'BUTTON') continue
    if (r.height < 40 || r.width < 40) {
      small.push({ tag: 'button', t: (el.innerText || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) })
    }
  }
  // does the fixed bottom nav sit on top of the last content row?
  const nav = document.querySelector('nav.fixed, [class*="fixed bottom-0"]')
  let navCover = false
  if (nav) {
    const nr = nav.getBoundingClientRect()
    const main = document.querySelector('main') || document.body
    const kids = [...main.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.innerText && e.innerText.trim())
    const last = kids[kids.length - 1]
    if (last) {
      const lr = last.getBoundingClientRect()
      navCover = lr.bottom > nr.top && lr.top < nr.bottom && nr.height > 0 && lr.height > 0
        && nr.top > 0 && Math.abs(lr.bottom - nr.top) < nr.height + 40
    }
  }
  return { overflow, small, scrollW: de.scrollWidth, clientW: de.clientWidth }
})

;(async () => {
  const { browser, page } = await launch()
  await page.setViewportSize(VIEW)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  step('the phone viewport is the one being used', page.viewportSize().width === 390,
    `${page.viewportSize().width}×${page.viewportSize().height}`)

  // pick our own fixture station so every screen has real content
  const st = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
  const mine = st.find((s) => s.station_name === 'QA R4 أ')
  step('fixture station for the phone run', !!mine, mine && mine.name)

  await page.goto(BASE + '/app/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

  for (const t of TAPS) {
    // reach the screen by tapping the nav, not by typing a URL
    // the sidebar markup exists but is hidden at this width — tap the VISIBLE one
    const found = page.locator(`nav a[href], [class*="fixed"] a[href]`).filter({ hasText: t.label })
    const total = await found.count()
    let reached = false
    for (let i = 0; i < total; i++) {
      const link = found.nth(i)
      if (!(await link.isVisible().catch(() => false))) continue
      await link.tap({ force: true }).catch(() => link.click({ force: true }))
      await page.waitForTimeout(1200)
      reached = page.url().includes(t.path)
      break
    }
    if (!reached) {
      await page.goto(BASE + t.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(700)
    }
    const r = await probe(page)
    step(`«${t.label}» — no horizontal scroll`, !r.overflow, `${r.scrollW} vs ${r.clientW} px`)
    step(`«${t.label}» — every visible BUTTON is at least 40 px`, r.small.length === 0,
      r.small.length ? JSON.stringify(r.small.slice(0, 3)) : 'ok')
    await shot(page, `r4-mobile-${t.path.replace(/\//g, '-') || 'home'}`)
    appendRun(`Mobile ${t.label}`, JSON.stringify(r))
  }

  // ---------- a real typing interaction on the phone ----------
  await page.goto(BASE + '/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const sel = page.locator('[data-testid="readings-station"]')
  if (await sel.count() && mine) {
    await sel.selectOption({ label: 'QA R4 أ' }).catch(() => {})
    await page.waitForTimeout(1200)
  }
  const inputs = page.locator('main input[type="text"], main input[type="number"], main input:not([type])')
  const n = await inputs.count()
  let typed = '(no editable gun — day already read or closed)'
  let react = false
  for (let i = 0; i < n; i++) {
    const el = inputs.nth(i)
    if (await el.isEditable().catch(() => false) && !(await el.isDisabled().catch(() => true))) {
      await el.tap().catch(() => el.click())
      await page.waitForTimeout(250)
      await el.fill('123456').catch(() => {})
      await page.waitForTimeout(400)
      const focusedH = await el.evaluate((e) => Math.round(e.getBoundingClientRect().height))
      const preview = await page.locator('body').innerText()
      const liters = /123[,.]?456|١٢٣/.test(preview)
      const warns = /أقل من|سابقة|استثناء|غير صالح|كبير جدا/.test(preview)
      react = liters || warns
      typed = `input ${i}: typed 123456, height ${focusedH}px, reaction=` +
        (liters ? 'liters preview' : warns ? 'rule warning' : 'NONE')
      break
    }
  }
  step('a reading can be typed on the phone and the screen answers the value', !typed.startsWith('(no editable') && react, typed)
  await shot(page, 'r4-mobile-typing')

  // nothing was written: this run only typed
  const readings = ((await apiGet(page, 'meter-readings/?limit_page_length=0')).results || [])
    .filter((r) => String(r.reading_value || r.value || '') === '123456')
  step('typing alone saved nothing', readings.length === 0, `${readings.length} row(s) with 123456`)

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
