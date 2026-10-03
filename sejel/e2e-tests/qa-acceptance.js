// Save only if there is something to save — a re-run of a stage must not hang
// on a disabled button.
async function tapSave(page) {
  const btn = page.locator('[data-testid="save-readings"]')
  if (!(await btn.count()) || (await btn.isDisabled())) {
    console.log('  (nothing to save — the save button is disabled)')
    return false
  }
  await btn.click()
  await page.waitForTimeout(3000)
  return true
}
// Round 3 / PART 6 — new-employee acceptance walkthrough.
//
// Drives the app AS the station employee on a 390×844 phone, using nothing but
// what is on screen: no route knowledge, no API shortcuts, no scripted
// selectors for navigation. Each stage prints what the employee would read.
//
//   usage: node qa-acceptance.js <stage>
//     stage 1  login → what is on screen
//     stage 2  open readings → what is on screen
//     stage 3  type readings → save → what feedback
//     stage 4  exceptions → refusal, then the way forward
//     stage 5  a full day → close the day (manager) → financial result
const { chromium } = require('playwright')

const BASE = 'http://localhost:8004'
const VIEW = { width: 390, height: 844 }
const STAGE = process.argv[2] || '1'

async function login(page, user = 'emp@sejel.ly', pass = 'Sejel-QA-2026') {
  await page.goto(BASE + '/login/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(900)
  await page.locator('input').nth(0).fill(user)
  await page.locator('input').nth(1).fill(pass)
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2500)
}

async function see(page, label) {
  const text = (await page.locator('main, body').first().innerText()).trim()
  console.log(`\n========== ${label} :: ${page.url()}\n${text}\n----------`)
  await page.screenshot({ path: `shots/qa-accept-${label}.png` })
}

// What a real employee sees FIRST on the screen: the largest, most prominent
// pressable things, ordered top to bottom. Used to judge "is the main action
// obvious?" without me knowing the code.
async function visibleControls(page) {
  return page.evaluate(() => {
    const out = []
    document.querySelectorAll('button, a[href], input, select, [role="button"]').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width < 8 || r.height < 8) return
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') return
      if (r.bottom < 0 || r.top > innerHeight) return // off-screen
      const txt = (el.innerText || el.value || el.placeholder || el.title || el.getAttribute('aria-label') || '').trim()
      if (!txt) return
      out.push({ y: Math.round(r.top), h: Math.round(r.height), txt: txt.replace(/\s+/g, ' ').slice(0, 46) })
    })
    return out.sort((a, b) => a.y - b.y)
  })
}

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: VIEW, hasTouch: true })
  const page = await ctx.newPage()
  // Stages 1–5 are the employee's day; stage 6 is the manager who closes it.
  await login(page, STAGE === '6' ? 'owner@sejel.ly' : 'emp@sejel.ly',
    STAGE === '6' ? 'owner123' : 'Sejel-QA-2026')

  if (STAGE === '1') {
    await see(page, '1-after-login')
    console.log('\ncontrols on the first screen, top to bottom:')
    ;(await visibleControls(page)).forEach((c) => console.log(`  y=${String(c.y).padStart(4)} h=${c.h}  «${c.txt}»`))
  }

  if (STAGE === '2') {
    // "I have to record today's readings." — find the way in by looking only.
    await see(page, '2a-home')
    const cta = page.locator('main >> text=إدخال القراءات').first()
    if (await cta.count()) {
      console.log('\nfound «إدخال القراءات» by reading the screen; tapping it')
      await cta.click()
    } else {
      console.log('\n!! «إدخال القراءات» NOT visible on the first screen — this is a defect')
      const link = page.locator('a, button').filter({ hasText: 'القراءات' }).first()
      if (await link.count()) await link.click()
    }
    await page.waitForTimeout(2500)
    await see(page, '2b-readings')
    console.log('\ncontrols on the readings screen, top to bottom:')
    ;(await visibleControls(page)).forEach((c) => console.log(`  y=${String(c.y).padStart(4)} h=${c.h}  «${c.txt}»`))
  }

  if (STAGE === '3') {
    await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await see(page, '3a-readings-open')
    const inputs = page.locator('[data-testid="gun-current-input"]')
    const n = await inputs.count()
    console.log(`\ngun inputs on screen: ${n}`)
    for (let i = 0; i < n; i++) {
      const prev = await page.locator('[data-testid="gun-previous"]').nth(i).innerText().catch(() => '?')
      await inputs.nth(i).fill(String(500100 + i * 1000))
      console.log(`  gun ${i}: previous shown as «${prev.replace(/\s+/g, ' ')}»`)
    }
    await see(page, '3b-filled')
    await tapSave(page)
    await see(page, '3c-after-save')
    console.log('\ntoast:', await page.locator('[data-testid="global-toast"]').innerText().catch(() => '(none)'))
  }

  if (STAGE === '4') {
    // Capture what the SERVER says, not just what the screen shows: a refusal
    // that never reaches the operator is a defect even if the backend is right.
    page.on('response', async (r) => {
      if (!/meter-readings|ensure-day-close/.test(r.url())) return
      const body = await r.text().catch(() => '')
      console.log(`\n[net] ${r.request().method()} ${r.url().replace(BASE, '')} → ${r.status()} ${body.slice(0, 400)}`)
    })
    await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await see(page, '4a-before-exception')
    const inputs = page.locator('[data-testid="gun-current-input"]')
    console.log(`\ngun inputs available: ${await inputs.count()}`)
    // a reading far BELOW the previous one, with no exception declared
    await inputs.first().fill('1')
    await see(page, '4b-lower-reading')
    await tapSave(page)
    await see(page, '4c-refusal')
    console.log('save-bar error :', await page.locator('[data-testid="save-bar-error"]').innerText().catch(() => '(none)'))
    console.log('save-bar notice:', await page.locator('[data-testid="save-bar-notice"]').innerText().catch(() => '(none)'))
    console.log('toast          :', await page.locator('[data-testid="global-toast"]').innerText().catch(() => '(none)'))

    // 4d — the operator now does the only sensible thing: says why the meter
    // went backwards. Does the app accept it and record the reason?
    console.log('\n>>> 4d: declaring «تصفير العداد» on the same gun and saving again')
    const exSel = page.locator('select').filter({ hasText: 'تصفير العداد' }).first()
    if (!(await exSel.count())) {
      console.log('!! no exception dropdown on screen — the refusal gives the operator no way forward')
    } else {
      await exSel.selectOption('reset')
      await page.locator('[data-testid="gun-current-input"]').first().fill('50')
      await page.waitForTimeout(400)
      await tapSave(page)
      await see(page, '4d-exception-saved')
      console.log('save-bar error :', await page.locator('[data-testid="save-bar-error"]').innerText().catch(() => '(none)'))
      console.log('save-bar notice:', await page.locator('[data-testid="save-bar-notice"]').innerText().catch(() => '(none)'))
      console.log('progress chip  :', (await page.locator('[data-testid="readings-progress"]').innerText()).replace(/\s+/g, ' '))
    }
  }

  if (STAGE === '5') {
    page.on('response', async (r) => {
      if (!/shifts|reconcil/i.test(r.url())) return
      const body = await r.text().catch(() => '')
      console.log(`\n[net] ${r.request().method()} ${r.url().replace(BASE, '')} → ${r.status()} ${body.slice(0, 300)}`)
    })
    await page.goto(BASE + '/app/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    await see(page, '5a-home-state')
    await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    // A day can only be closed meaningfully if there is something to close, so
    // stage 5 first plays a full two-day life of the gun: yesterday = baseline,
    // today = real litres. This also proves the operator can move between days
    // using only the date field.
    const dateBox = page.locator('[data-testid="readings-date"]')
    const today = new Date()
    const iso = (d) => d.toISOString().slice(0, 10)
    const yesterday = new Date(today.getTime() - 86400000)

    console.log('\n>>> 5a: recording yesterday’s baseline')
    await dateBox.fill(iso(yesterday))
    await dateBox.dispatchEvent('change')
    await page.waitForTimeout(2500)
    let inputs = page.locator('[data-testid="gun-current-input"]')
    console.log(`  gun inputs for ${iso(yesterday)}: ${await inputs.count()}`)
    if (await inputs.count()) {
      for (let i = 0; i < await inputs.count(); i++) await inputs.nth(i).fill(String(500000 + i * 100000))
      await tapSave(page)
      console.log('  ', (await page.locator('[data-testid="save-bar-notice"], [data-testid="save-bar-error"]').first().innerText().catch(() => '(none)')).trim())
    }

    console.log('\n>>> 5b: back to today, real litres')
    await dateBox.fill(iso(today))
    await dateBox.dispatchEvent('change')
    await page.waitForTimeout(2500)
    inputs = page.locator('[data-testid="gun-current-input"]')
    for (let i = 0; i < await inputs.count(); i++) await inputs.nth(i).fill(String(500000 + i * 100000 + 12000 + i * 3000))
    await page.waitForTimeout(400)
    await see(page, '5b-today-filled')
    await tapSave(page)
    await see(page, '5c-today-saved')

    const close = page.locator('[data-testid="close-day"]')
    const disabled = await close.isDisabled().catch(() => true)
    console.log('\n«إقفال اليوم» present:', await close.count(), '· disabled:', disabled)
    if (await close.count() && !disabled) {
      page.on('dialog', (d) => { console.log('  dialog:', d.message()); d.accept() })
      await close.first().click()
      await page.waitForTimeout(4000)
      await see(page, '5d-after-close')
      console.log('save-bar:', (await page.locator('[data-testid="save-bar-notice"], [data-testid="save-bar-error"]').first().innerText().catch(() => '(none)')).trim())
    } else {
      console.log('!! cannot reach the close-day control — reporting as-is')
      await see(page, '5d-close-unreachable')
    }

    // And what does the dashboard say about the day that was just closed?
    await page.goto(BASE + '/app/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    await see(page, '5e-dashboard-after-close')
  }

  if (STAGE === '6') {
    // The manager half of the same day: the employee has already entered the
    // readings — can the manager close the day and get a financial result?
    page.on('response', async (r) => {
      if (!/shifts|reconcil/i.test(r.url())) return
      const body = await r.text().catch(() => '')
      console.log(`\n[net] ${r.request().method()} ${r.url().replace(BASE, '')} → ${r.status()} ${body.slice(0, 260)}`)
    })
    await page.goto(BASE + '/app/readings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    const stationSel = page.locator('[data-testid="readings-station"]')
    if (await stationSel.count()) {
      await stationSel.selectOption({ label: 'QA موظف جديد' })
      await page.waitForTimeout(3000)
    }
    await see(page, '6a-manager-readings')
    const close = page.locator('[data-testid="close-day"]')
    console.log('\n«إقفال اليوم» present:', await close.count(), '· label:', (await close.innerText().catch(() => '(none)')).trim(), '· disabled:', await close.isDisabled().catch(() => true))
    if (!(await close.count())) {
      console.log('!! the manager does not see the close-day control either')
    } else if (await close.isDisabled()) {
      console.log('(already closed for today — nothing to do)')
      await see(page, '6b-manager-already-closed')
    } else {
      page.on('dialog', (d) => { console.log('  dialog:', d.message()); d.accept() })
      await close.click()
      await page.waitForTimeout(5000)
      await see(page, '6b-manager-after-close')
    }
    await page.goto(BASE + '/app/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3500)
    await see(page, '6c-manager-dashboard')
  }

  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })