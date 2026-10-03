// PHASE 1 — Authentication + navigation + dashboard.
// Owner/admin login flows, negative login, logout invalidation, dashboard
// first impression, 11:00 cycle verification, Employee-Shift vs Reading-Period
// vs Daily-Close distinction.
const fs = require('fs')
const { initRunLog, appendRun, capture, uiLogin, clickNav, bodyText, defect, shot, step, summary, launch, nav, apiGet, CKPT_DIR } = require('./qa')

;(async () => {
  initRunLog()
  const { browser, page } = await launch()
  capture(page)
  await page.setViewportSize({ width: 1366, height: 768 })

  // 0. baseline
  const t0 = Date.now()
  await page.goto('http://localhost:8004/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  step('App loads (redirects to login)', page.url().includes('login'), page.url())
  step('HTTP/UI responds', (await page.locator('body').count()) > 0)
  const vp = page.viewportSize()
  appendRun('Environment', '- viewport: ' + vp.width + 'x' + vp.height +
    '\n- load ms: ' + (Date.now() - t0) +
    '\n- console errors at baseline: ' + page.consoleErrors.length)
  await shot(page, 'qa-01-baseline')

  // 2. negative login tests (before real login)
  await uiLogin(page, '', '')
  step('NEG: empty creds stay on login', page.url().includes('login'))
  const emptyErr = await bodyText(page)
  await uiLogin(page, 'nobody@sejel.ly', 'WrongPass1!')
  step('NEG: invalid user stays on login', page.url().includes('login'))
  const invalidErr = await bodyText(page)
  await uiLogin(page, 'owner@sejel.ly', 'definitely-wrong')
  step('NEG: wrong password stays on login', page.url().includes('login'))
  const msgQuality = emptyErr.match(/أدخل|خطأ|required|invalid/gi)
  appendRun('Login negative tests',
    '- empty-creds error text present: ' + !!msgQuality +
    '\n- invalid-user error text present: ' + /أدخل|خطأ|غير صحيح|invalid/i.test(invalidErr) +
    '\n- no password echo in error text: ' + !/WrongPass1/.test(invalidErr))

  // 2. owner login via real form
  const okOwner = await uiLogin(page, 'owner@sejel.ly', 'owner123')
  step('owner@sejel.ly login', okOwner)
  await page.waitForTimeout(800)
  const body1 = await bodyText(page)
  step('Owner identity visible in UI', body1.includes('owner') || body1.includes('مالك') || body1.includes('Owner'), '')
  await shot(page, 'qa-02-owner-dashboard')

  // 4. dashboard first impression
  //
  // QA-2 was: "the cycle lives only on the readings screen". Round 3 added the
  // TodayPanel, so the dashboard now states the cycle itself. A manager owns
  // several stations and lands on the aggregate picker, which shows no cycle
  // until one is chosen — so pick a station first, exactly as a person would.
  const pick = page.locator('a, button').filter({ hasText: 'تجريبية' }).first()
  if (await pick.count()) { await pick.click(); await page.waitForTimeout(2500) }
  const dash = await bodyText(page)
  const hasPeriod = /دورة (القراءة|اليوم)/.test(dash)
  const period11 = /11:00\s*←\s*11:00/.test(dash)
  if (!hasPeriod || !period11) {
    defect({
      id: 'QA-2', severity: 'P2', area: 'Dashboard — reading cycle visibility',
      repro: 'Login → land on the KPI dashboard (الرئيسية) with a station selected',
      expected: 'The dashboard states the active reading cycle (11:00 ← 11:00) alongside the daily KPIs',
      actual: `dashboard text has «دورة …»=${hasPeriod}, «11:00 ← 11:00»=${period11}`,
      evidence: 'body text captured in run log; screenshots qa-02-owner-dashboard.png',
    })
  } else {
    step('Dashboard shows the station\'s 11:00 cycle', period11, '11:00 ← 11:00')
  }
  step('Dashboard shows liters/sales KPIs', /لتر|مبيعات/.test(dash))
  // Employee shift vs reading period vs daily close distinction:
  step('Dashboard mentions shifts (المناوبات) separately', /مناوب/.test(dash))
  appendRun('Dashboard first impression', '```\n' + dash.slice(0, 1500) + '\n```')

  // pilot station presence + cycle via API cross-check (backend consistency)
  const stations = (await apiGet(page, 'stations/')).results || []
  const pilot = stations.find((s) => s.station_name && s.station_name.includes('تجريبية'))
  step('Pilot station exists in list', !!pilot, JSON.stringify(stations.map((s) => s.station_name)))
  if (pilot) {
    const doc = await apiGet(page, 'stations/' + pilot.name + '/')
    step('Backend: pilot day_close_time = 11:00', String(doc.day_close_time || '').startsWith('11:00'), String(doc.day_close_time))
  }

  // navigation sweep: every sidebar item opens without a blank page
  const navTexts = ['الرئيسية', 'قراءات المضخات', 'المناوبات', 'المحطات', 'الخزانات', 'الموظفين', 'المالية', 'المخزون', 'التقارير']
  const navResults = []
  for (const t of navTexts) {
    const clicked = await clickNav(page, t)
    if (!clicked) { navResults.push(t + ': (not in sidebar)'); continue }
    await page.waitForTimeout(700)
    const b = await bodyText(page)
    const blank = b.trim().length < 60
    navResults.push(t + ': ' + (blank ? 'BLANK' : 'ok'))
    if (blank) await shot(page, 'qa-03-blank-' + t.replace(/\s/g, '_'))
  }
  step('All sidebar pages render non-blank', !navResults.some((r) => r.includes('BLANK')), navResults.join(' | '))

  // 3. logout + back-button protection.
  // The logout control is an ICON-ONLY header button (no text/aria-label) —
  // recorded as UX friction; we click it structurally.
  const beforeUrl = page.url()
  const logoutBtn = page.locator('header button').last()
  step('Logout control found in header', await logoutBtn.count() > 0)
  await logoutBtn.click()
  await page.waitForTimeout(1500)
  step('Logout returns to login page', page.url().includes('login'), page.url())

  // SERVER-side invalidation: does the old session cookie still authenticate?
  const meStatus = await page.evaluate(async () => {
    const r = await fetch('/api/auth/me/', { credentials: 'include' })
    return r.status
  })
  step('CRITICAL: server session invalidated after logout (expect 401)', meStatus === 401, '/api/auth/me/ → ' + meStatus)
  await shot(page, 'qa-04-after-logout')

  await page.goBack()
  await page.waitForTimeout(1200)
  const revived = !page.url().includes('login')
  if (revived) {
    defect({
      id: 'QA-1', severity: 'P0', area: 'Authentication — logout',
      repro: 'Login as any user → click the header logout icon → press browser Back (or Refresh)',
      expected: 'Session invalid server-side; protected pages require re-login',
      actual: 'SPA re-authenticates from the still-alive Frappe session cookie (Back → ' + page.url() + ')',
      evidence: '/api/auth/me/ after logout → ' + meStatus + '; screenshot qa-04-after-logout.png',
    })
  }
  step('Back-button after logout stays protected', !revived, page.url())

  // guest access to a protected URL
  await page.goto('http://localhost:8004/app/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  step('Protected URL as guest → redirected to login', page.url().includes('login'), page.url())

  // 3. admin login + role difference
  const okAdmin = await uiLogin(page, 'admin@sejel.ly', 'admin123')
  step('admin@sejel.ly login', okAdmin)
  await page.waitForTimeout(800)
  const adminBody = await bodyText(page)
  appendRun('Admin dashboard', '```\n' + adminBody.slice(0, 800) + '\n```')
  // admin should see the station switcher (multi-station) — owner too if manager
  const stations2 = (await apiGet(page, 'stations/')).results || []
  appendRun('Role check', '- admin stations visible: ' + stations2.length +
    '\n- admin sees station picker: ' + /اختر المحطة|المحطة/.test(adminBody))

  // console/network errors collected during the phase
  appendRun('Console errors (phase 1)', page.consoleErrors.length ? page.consoleErrors.map((e) => '- ' + e).join('\n') : '- none')
  appendRun('Network ≥400 (phase 1)', page.netFails.length ? page.netFails.map((e) => '- ' + e).join('\n') : '- none')

  await browser.close()
  fs.writeFileSync(CKPT_DIR + '/phase1-done.txt', new Date().toISOString())
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
