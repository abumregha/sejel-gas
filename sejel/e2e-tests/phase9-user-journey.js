// Phase 9: FULL USER JOURNEY — everything a real station manager does, driven
// ONLY through the browser UI (clicks, forms, sidebar). No API seeding, no
// setup-station shortcut (phase5/7/8 style) — the wizard itself is the test.
//
// Journey:
//   1. Login via the real form
//   2. Sidebar → إعداد محطة → 4-step wizard → station created (2 guns)
//   3. فتح صفحة المحطة → station detail renders
//   4. Sidebar → قراءات المضخات → pick the station
//   5. Reading-period chip shows the station's configured close time (23:00
//      default — the fresh wizard station proves config flows, nothing hardcoded)
//   6. Type ONLY current readings → live liters preview → save (day container
//      auto-created with is_day_close=1) → progress 2/2
//   7. Second entry for gun 1 (auto-previous = same gun's 1000) → 500 L
//   8. إقفال اليوم through the button (both confirms auto-accepted)
//   9. المناوبات list shows the إقفال اليوم badge row مغلقة
//  10. Reconciliations list shows today's reconciliation (مسودة)
//  11. Mobile 390×844: hamburger → قراءات المضخات → same page + bottom nav
const { launch, login, nav, shot, step, summary } = require('./helpers')

const norm = (s) => s.replace(/[\u066B\u066C]/g, '.')

;(async () => {
  const { browser, page } = await launch()
  const stationName = 'رحلة المستخدم ' + Date.now()

  // ---------- 1. login ----------
  step('J1: login through the real form', await login(page))

  // ---------- 2. wizard via sidebar ----------
  // Sidebar is always open now (client request) — anchors carry :title, click directly
  await page.locator('aside a[title="إعداد محطة"]').click()
  await page.waitForTimeout(600)
  step('J2: wizard opens from the sidebar', (await page.locator('body').innerText()).includes('بيانات المحطة'))

  // Step 1 — station data
  await page.locator('label', { hasText: 'اسم المحطة' }).locator('xpath=following-sibling::input[1]').fill(stationName)
  await page.locator('label', { hasText: 'العنوان' }).locator('xpath=following-sibling::input[1]').fill('طرابلس — رحلة')
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(400)

  // Step 2 — islands/pumps: 1 island × 2 pumps × 1 gun
  await page.locator('label', { hasText: 'عدد الجزر' }).locator('xpath=following-sibling::input[1]').fill('1')
  await page.waitForTimeout(300)
  await page.locator('label', { hasText: 'مضخات' }).first().locator('xpath=following-sibling::input[1]').fill('2')
  await page.locator('label', { hasText: 'عدادات/مضخة' }).first().locator('xpath=following-sibling::input[1]').fill('1')
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(400)

  // Step 3 — one tank
  await page.locator('select').first().selectOption({ label: 'بنزين' })
  await page.locator('label', { hasText: 'السعة' }).locator('xpath=following-sibling::input[1]').fill('20000')
  await page.locator('button', { hasText: 'التالي' }).click()
  await page.waitForTimeout(400)

  // Step 4 — review + create
  const review = await page.locator('body').innerText()
  step('J2: review shows 2 meters before create', review.includes(stationName) && review.includes('2'), '')
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForSelector('text=تم إنشاء المحطة بنجاح', { timeout: 30000 })
  step('J2: station created through the wizard UI', true)
  await shot(page, '90-wizard-created')

  // ---------- 3. open the station page (UI button) ----------
  await page.locator('button', { hasText: 'فتح صفحة المحطة' }).click()
  await page.waitForTimeout(1200)
  step('J3: فتح صفحة المحطة lands on the station detail', page.url().includes('/stations/'), page.url())
  await shot(page, '91-station-detail')

  // ---------- 4. readings page via sidebar ----------
  await page.locator('aside a[title="قراءات المضخات"]').click()
  await page.waitForTimeout(800)
  const pick = page.locator('[data-testid="readings-station"]')
  step('J4: station picker shown for admin', (await pick.count()) > 0)
  await pick.selectOption({ label: stationName })
  await page.waitForTimeout(1500)

  // ---------- 5. reading-period chip (configurable close time, default 23:00) ----------
  let body = norm(await page.locator('body').innerText())
  const today = new Date().toISOString().split('T')[0]
  step('J5: دورة القراءة chip shows the configured close time (23:00 default)',
    body.includes('دورة القراءة') && body.includes('23:00') && body.includes(today),
    (body.match(/دورة القراءة[^\n]*/) || ['?'])[0])
  step('J5: progress starts 0 / 2', /0\s*\/\s*2/.test(body), '')

  // ---------- 6. enter ONLY current readings, live preview, save ----------
  const row1 = page.locator('div.bg-white', { hasText: 'بانتظار القراءة' }).filter({ hasText: 'M01' }).first()
  const row2 = page.locator('div.bg-white', { hasText: 'بانتظار القراءة' }).filter({ hasText: 'M02' }).first()
  await row1.locator('[data-testid="gun-current-input"]').fill('1000')
  await row2.locator('[data-testid="gun-current-input"]').fill('2000')
  await page.waitForTimeout(400)
  const r1txt = norm(await row1.innerText())
  const r2txt = norm(await row2.innerText())
  step('J6: live preview gun1 = 1,000 L (fresh gun, auto-previous 0)', /1[.,\s\u00A0]?000/.test(r1txt), '')
  step('J6: live preview gun2 = 2,000 L', /2[.,\s\u00A0]?000/.test(r2txt), '')
  await page.locator('[data-testid="save-readings"]').click()
  await page.waitForSelector('text=تم حفظ', { timeout: 20000 })
  await page.waitForTimeout(1200) // reload
  body = norm(await page.locator('body').innerText())
  step('J6: saved — progress 2 / 2 مكتملة', /جميع القراءات مكتملة|2\s*\/\s*2/.test(body), '')
  step('J6: guns show مسجلة chips', body.includes('مسجلة'))
  await shot(page, '92-readings-saved')

  // ---------- 7. next-day cycle through the DATE PICKER (the real daily loop):
  // saved guns lock their input (one entry per gun/day), so the operator moves
  // to tomorrow — the previous reading must come from the SAME gun's last one ----------
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  await page.locator('[data-testid="readings-date"]').fill(tomorrow)
  await page.waitForTimeout(1500)
  body = norm(await page.locator('body').innerText())
  step('J7: tomorrow renders guns pending again (new cycle)', /بانتظار القراءة/.test(body), '')
  const row1c = page.locator('div.bg-white', { hasText: 'M01' }).first()
  await row1c.locator('[data-testid="gun-current-input"]').fill('1500')
  await page.waitForTimeout(300)
  const prevShown = norm(await row1c.innerText())
  step('J7: previous auto-filled = 1,000 (same gun, yesterday)', /1[.,\s\u00A0]?000/.test(prevShown), '')
  step('J7: live liters = 500', /500/.test(prevShown), '')
  await page.locator('[data-testid="save-readings"]').click()
  await page.waitForSelector('text=تم حفظ', { timeout: 20000 })
  await page.waitForTimeout(1200)

  // ---------- 8. close the day through the button ----------
  await page.locator('[data-testid="close-day"]').click() // both confirms auto-accepted
  await page.waitForSelector('text=تم إقفال اليوم', { timeout: 30000 })
  step('J8: إقفال اليوم succeeds from the readings page', true)
  await page.waitForTimeout(1200)
  await shot(page, '93-day-closed')

  // ---------- 9. shifts list shows the day-close badge row ----------
  await nav(page, 'shifts')
  await page.waitForTimeout(1000)
  body = norm(await page.locator('body').innerText())
  // two day-close containers exist now (today from J6, tomorrow from J7/J8);
  // tomorrow's is the closed one
  const badgeRow = page.locator('tr', { hasText: 'إقفال يوم' }).filter({ hasText: 'مغلقة' }).first()
  step('J9: shifts list shows إقفال اليوم badge on the closed day container',
    (await badgeRow.count()) > 0 && (await badgeRow.locator('[data-testid="day-close-badge"]').count()) > 0, '')
  await shot(page, '94-shifts-badge')

  // ---------- 10. reconciliation exists (via UI list) ----------
  await nav(page, 'finance/reconciliations')
  await page.waitForTimeout(1000)
  body = norm(await page.locator('body').innerText())
  const recRows = await page.locator('table tbody tr').count()
  step('J10: reconciliations list renders with at least one row',
    body.includes('التسويات') && recRows >= 1, 'rows=' + recRows)
  await shot(page, '95-reconciliations')

  await browser.close()

  // ---------- 11. mobile pass: same journey screen on a phone ----------
  const m = await launch({ viewport: { width: 390, height: 844 } })
  step('J11 mobile: login', await login(m.page))
  await m.page.locator('header button').first().click() // hamburger opens the drawer
  await m.page.locator('aside a[title="قراءات المضخات"]').first().click()
  await m.page.waitForTimeout(1000)
  const mpick = m.page.locator('[data-testid="readings-station"]')
  if (await mpick.count()) { await mpick.selectOption({ label: stationName }); await m.page.waitForTimeout(1500) }
  const mbody = norm(await m.page.locator('body').innerText())
  step('J11 mobile: readings page renders with the period chip', mbody.includes('دورة القراءة') && mbody.includes('23:00'), '')
  step('J11 mobile: bottom nav shows القراءات', mbody.includes('القراءات'), '')
  step('J11 mobile: closed day still shows completed (2/2)', /جميع القراءات مكتملة|2\s*\/\s*2/.test(mbody), '')
  const overflow = await m.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  step('J11 mobile: no horizontal overflow', overflow <= 0, 'px=' + overflow)
  await shot(m.page, '96-mobile-readings')
  await m.browser.close()

  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
