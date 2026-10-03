// PHASE 2 — Station + infrastructure + employee + shift-definition CRUD,
// through the real UI. Wizard steps discovered live: 0=data, 1=islands/pumps,
// 2=tanks ("+ إضافة خزان"), 3=review+create, 4=success.
const fs = require('fs')
const { appendRun, capture, uiLogin, clickNav, bodyText, defect, shot, step, summary, launch, apiGet, fillByLabel, qaFill, qaDelete } = require('./qa')

const QA_STATION = 'QA Test Station'

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  // pre-clean leftovers from earlier partial runs (admin session via API)
  {
    const { browser: b2, page: p2 } = await launch()
    await uiLogin(p2, 'admin@sejel.ly', 'admin123')
    for (const nm of ['QA Test Station', 'QA Delete Me']) {
      const list = ((await apiGet(p2, 'stations/')).results) || []
      const hit = list.find((s) => s.station_name === nm)
      if (hit) {
        // employees are NOT part of the station cascade (defect QA-4) — remove them first.
        // QA-5: the ?filters={"station":X} contract 500s — pass filter keys directly.
        const emps = ((await apiGet(p2, 'employees/?station=' + hit.name)).results) || []
        for (const e of emps) { const r = await qaDelete(p2, 'employees', e.name); console.log('[pre-clean] employee', e.name, r.status) }
        const r = await qaDelete(p2, 'stations', hit.name); console.log('[pre-clean]', nm, r.status)
      }
    }
    await b2.close()
  }
  step('owner login', await uiLogin(page, 'owner@sejel.ly', 'owner123'))
  await page.waitForTimeout(600)

  // ---------- STATION CREATE via the setup wizard ----------
  await clickNav(page, 'المحطات')
  await page.locator('a', { hasText: 'إعداد محطة جديدة' }).first().click()
  await page.waitForTimeout(900)

  // step 0: data
  await qaFill(page, 'اسم المحطة *', QA_STATION, 'div')
  await qaFill(page, 'العنوان', 'Tripoli QA Test', 'div')
  await page.locator('select').first().selectOption({ index: 0 }) // ملكية
  await shot(page, 'qa-10-wizard-step1')
  console.log('[trace] next clicked'); await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(800)

  // step 1: islands/pumps — 2 islands; island1: 2 pumps × 2 meters; island2: 1 pump × 2 meters
  // island rows render asynchronously after the step transition — wait for them
  const waitNums = async (min, ms = 8000) => {
    const t0 = Date.now()
    while (Date.now() - t0 < ms) {
      if ((await page.locator('input[type="number"]:visible').count()) >= min) return
      await page.waitForTimeout(300)
    }
    throw new Error('number inputs never reached ' + min)
  }
  await waitNums(6)
  // fresh locator per fill: Vue re-renders island rows when the count changes,
  // which can invalidate element handles mid-sequence
  const fillNum = async (i, v) => {
    for (let t = 0; t < 3; t++) {
      try {
        await page.locator('input[type="number"]:visible').nth(i).fill(v, { timeout: 6000 })
        return
      } catch (e) {
        if (t === 2) throw e
        await page.waitForTimeout(600)
        await waitNums(6, 4000).catch(() => {})
      }
    }
  }
  await fillNum(0, '2') // عدد الجزر
  await fillNum(1, '2') // عدادات لكل مضخة (افتراضي)
  await fillNum(2, '2') // island1 pumps
  await fillNum(3, '2') // island1 meters/pump
  await fillNum(4, '1') // island2 pumps
  await fillNum(5, '2') // island2 meters/pump
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(800)

  console.log('[trace] at tank step, numbers:', await page.locator('input[type="number"]:visible').count(), 'selects:', await page.locator('select:visible').count(), 'url:', page.url().slice(-30))
  // step 2: tanks — number inputs are [cap1, level1, (cap2, level2) after add];
  // the name field between them is TEXT (that is why only 2 numbers per row)
  await page.waitForTimeout(1200)
  await page.locator('select').first().selectOption({ index: 0 }) // gasoline
  await page.locator('input[type="number"]:visible').nth(0).fill('20000')
  await page.locator('input[type="number"]:visible').nth(1).fill('10000')
  await page.locator('button', { hasText: 'إضافة خزان' }).click()
  await page.waitForTimeout(700)
  const rows = await page.locator('select:visible').count()
  step('Second tank row added', rows >= 2, rows + ' tank rows')
  if (rows >= 2) {
    await page.locator('select').nth(1).selectOption({ index: 1 }) // diesel
    await page.locator('input[type="number"]:visible').nth(2).fill('20000')
    await page.locator('input[type="number"]:visible').nth(3).fill('8000')
  }
  await shot(page, 'qa-11-wizard-tanks')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(800)

  // step 3: review + create
  await shot(page, 'qa-12-wizard-review')
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForTimeout(4000)
  const afterCreate = await bodyText(page)
  const ok = afterCreate.includes('تم إنشاء المحطة بنجاح')
  step('Wizard reports success', ok)
  step('Wizard counts displayed (جزر/مضخة/خزان/عداد)', /جزر/.test(afterCreate) && /عداد/.test(afterCreate),
    (afterCreate.match(/[^\n]*جزر[^\n]*/) || ['?'])[0])
  await shot(page, 'qa-13-wizard-success')

  // backend cross-check
  const stations = (await apiGet(page, 'stations/')).results || []
  const qa = stations.find((s) => s.station_name === QA_STATION)
  step('Backend has QA station', !!qa, qa && qa.name)
  if (!qa) { await browser.close(); process.exit(summary() ? 1 : 0) }
  // ---------- backend cross-check ----------
  // QA-5 probe: the documented ?filters= contract 500s (recorded as a defect).
  // Cross-check the wizard's infrastructure through the dashboard-station
  // payload — the endpoint the readings screen itself uses.
  const fprobe = await page.evaluate(async (u) => { const r = await fetch(u, { credentials: 'include' }); return r.status },
    '/api/method/sejel_app.api.views.crud_list?resource=islands&filters=' + encodeURIComponent(JSON.stringify({ station: qa.name })))
  if (fprobe >= 500) defect({ id: 'QA-5', severity: 'P2', area: 'Generic list API — ?filters= contract broken', repro: 'GET /api/islands/?filters={"station":"X"} (machines/employees too)', expected: 'Filtered list per the documented filters JSON contract', actual: '500 UndefinedColumn — column tabIsland.filters does not exist (the raw filters key leaks into SQL; root-caused in views.py crud_list/_get_filters). SPA unaffected (uses direct ?station= params) but integrators and this harness break on it', evidence: 'curl repro + frappe.log Form Dict entries; qa-run-log QA-5 section' })
  const dsh = await apiGet(page, 'dashboard-station/?station=' + qa.name + '&date=' + new Date().toISOString().slice(0, 10))
  const islands = [], machines = [], metersAll = []
  if (dsh && !dsh.__status) {
    for (const isl of dsh.islands || []) {
      islands.push(isl)
      for (const mach of isl.machines || []) { machines.push(mach); metersAll.push(...(mach.meters || [])) }
    }
  }
appendRun('Infrastructure', '- islands: ' + islands.length + ', pumps: ' + machines.length + ', guns: ' + metersAll.length +
    '\n- codes: ' + metersAll.map((m) => m.meter_code).join(', ') +
    '\n- Pump≠Gun preserved: ' + (metersAll.length >= machines.length))

  // ---------- STATION UPDATE via UI ----------
  await page.goto('http://localhost:8004/app/stations/' + qa.name, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  step('Station detail shows name', (await bodyText(page)).includes(QA_STATION))
  const editLink = page.locator('a', { hasText: 'تعديل' }).first()
  if (await editLink.count() && await editLink.isVisible()) {
    await editLink.click()
    await page.waitForTimeout(800)
    const addr = page.locator('input').nth(1)
    await addr.fill('Tripoli QA Test Updated')
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(1500)
    await page.goto('http://localhost:8004/app/stations/' + qa.name, { waitUntil: 'networkidle' })
    const persisted = (await bodyText(page)).includes('Tripoli QA Test Updated')
    step('Station UPDATE persists after reload', persisted)
    if (!persisted) defect({ id: 'QA-3', severity: 'P2', area: 'Station update', repro: 'Edit address → save → reload detail', expected: 'Address persists', actual: 'Reverted', evidence: 'run log' })
  } else {
    step('Station detail exposes edit link', false)
  }

  // ---------- EMPLOYEE CRUD ----------
  await page.goto('http://localhost:8004/app/employees', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.locator('a,button', { hasText: 'إضافة' }).first().click()
  await page.waitForTimeout(700)
  await qaFill(page, 'الاسم', 'Ahmed QA')
  await qaFill(page, 'المنصب', 'عامل مضخة')
  await qaFill(page, 'الهاتف', '0910000001')
  // the station select starts with no value — a real operator must pick one
  const empStation = page.locator('select').first()
  const eopts = await empStation.locator('option').allTextContents()
  const eidx = eopts.findIndex((t) => t.includes('QA Test Station'))
  if (eidx >= 0) await empStation.selectOption({ index: eidx })
  await shot(page, 'qa-14-employee-form')
  await page.locator('button[type="submit"]').first().click()
  await page.waitForTimeout(1500)
  step('Employee Ahmed QA created', (await bodyText(page)).includes('Ahmed QA'), page.url())

  // negative: empty name
  await page.locator('a,button', { hasText: 'إضافة' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button[type="submit"]').first().click()
  await page.waitForTimeout(900)
  const negEmp = await bodyText(page)
  step('Empty employee name rejected with Arabic message', /يرجى|مطلوب|الاسم/.test(negEmp), '')
  await shot(page, 'qa-15-employee-negative')
  await page.goto('http://localhost:8004/app/employees', { waitUntil: 'networkidle' })

  // ---------- SHIFT DEFINITIONS (employee shifts, NOT reading periods) ----------
  await page.goto('http://localhost:8004/app/shifts/definitions', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  const addDef = page.locator('a,button', { hasText: 'إضافة' }).first()
  const defsMade = []
  for (const [name, s, e] of [['صباحي QA', '08:00', '16:00'], ['مسائي QA', '16:00', '00:00'], ['ليلي QA', '00:00', '08:00']]) {
    await addDef.first().click()
    await page.waitForTimeout(700)
    await qaFill(page, 'اسم التعريف', name)
    const stationSel = page.locator('select').first()
    const sopts = await stationSel.locator('option').allTextContents()
    const sidx = sopts.findIndex((t) => t.includes(QA_STATION))
    if (sidx >= 0) await stationSel.selectOption({ index: sidx })
    const times = page.locator('input[type="time"]:visible')
    await times.nth(0).fill(s)
    await times.nth(1).fill(e)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(1300)
    defsMade.push((await bodyText(page)).includes(name))
  }
  step('3 shift definitions created (incl. overnight 00:00→08:00)', defsMade.every(Boolean), defsMade.join(','))

  // ---------- DELETE: throwaway station with children (cascade) ----------
  // Build a minimal second station, then delete it through the UI.
  await page.goto('http://localhost:8004/app/stations/setup-wizard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await qaFill(page, 'اسم المحطة *', 'QA Delete Me', 'div')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('input[type="number"]:visible').nth(0).fill('100')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForTimeout(4000)
  page.once('dialog', (d) => d.accept())
  // as OWNER first: Sejel Manager has no delete permission on Station —
  // expect a clear in-page denial (NOT a redirect to login, that was the old bug)
  await page.goto('http://localhost:8004/app/stations', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  // INCIDENT NOTE: an earlier run used .last() here and deleted the PILOT
  // station (restored via pilot_bootstrap). Target the QA card BY NAME now.
  const qaCard = page.locator('div.bg-white.rounded-xl', { hasText: 'QA Delete Me' }).first()
  await qaCard.locator('button', { hasText: 'حذف' }).click()
  await page.waitForTimeout(600)
  // the custom ConfirmDialog opened — click its red confirm button
  await page.locator('.fixed.inset-0 button.bg-red-600').click()
  await page.waitForTimeout(2500)
  const ownerStillOnApp = !page.url().includes('login')
  step('Owner delete denied WITHOUT login redirect (regression check)', ownerStillOnApp, page.url())
  await shot(page, 'qa-16-owner-delete-denied')

  // as ADMIN: cascade delete through the UI — name-targeted card (never .last())
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  await page.goto('http://localhost:8004/app/stations', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const delCard = page.locator('div.bg-white.rounded-xl', { hasText: 'QA Delete Me' }).first()
  await delCard.locator('button', { hasText: 'حذف' }).click()
  await page.waitForTimeout(600)
  await page.locator('.fixed.inset-0 button.bg-red-600').click() // ConfirmDialog confirm
  await page.waitForTimeout(3000)
  const afterDel = (await apiGet(page, 'stations/')).results || []
  const still = afterDel.some((s) => s.station_name === 'QA Delete Me')
  step('Cascade delete (admin): station with infra removed', !still, still ? 'STILL PRESENT' : 'gone')
  if (still) defect({ id: 'QA-4', severity: 'P2', area: 'Station delete — cascade gap', repro: 'Create station + employee via UI → delete station as admin', expected: 'Station-bound master data (employees) tears down with the station, or the error names the blocker clearly', actual: 'Delete returns 417 while an Employee is still linked (cascade covers islands/machines/meters/tanks/shift-definitions but not employees)', evidence: 'pre-clean log: station delete → 417 before employee removal' })
  await shot(page, 'qa-17-after-delete')

  // ---------- DUPLICATE-NAME probe (idempotency) ----------
  // Earlier partial runs observed: creating a station whose name already
  // exists answers 417 on /api/setup-station/ and the wizard shows neither
  // success nor an actionable error. Reproduce deliberately.
  await page.goto('http://localhost:8004/app/stations/setup-wizard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await qaFill(page, 'اسم المحطة *', QA_STATION, 'div')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('input[type="number"]:visible').nth(0).fill('1')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForTimeout(3000)
  const dupBody = await bodyText(page)
  const dupOk = dupBody.includes('تم إنشاء المحطة بنجاح')
  const dupList = ((await apiGet(page, 'stations/?station_name=' + encodeURIComponent(QA_STATION))).results) || []
  appendRun('Duplicate-name probe', '- wizard success message shown: ' + dupOk + '\n- stations named "' + QA_STATION + '" after attempt: ' + dupList.length + '\n- error text on wizard (if any): ' + (dupBody.match(/[^\n]*(خطأ|موجود|مكرر|فشل)[^\n]*/) || ['(none)'])[0])
  if (!dupOk && !/خطأ|فشل|موجود|مكرر/.test(dupBody)) {
    defect({ id: 'QA-6', severity: 'P2', area: 'Wizard — duplicate station name is silent', repro: 'Create station "X" via wizard → create another station named "X"', expected: 'Clear Arabic error naming the duplicate so the operator can rename', actual: 'Backend 417 on /api/setup-station/; wizard shows neither success nor an actionable error', evidence: 'dupList.length=' + dupList.length + ' (no new station), network log 417 /api/setup-station/, screenshot qa-18-duplicate-name' })
  } else if (dupOk) {
    defect({ id: 'QA-6', severity: 'P2', area: 'Wizard — duplicate station name allowed', repro: 'Create station "X" via wizard → create another station named "X"', expected: 'Reject duplicate names (or force-unique code)', actual: 'Wizard reports success and a second station with the same name exists', evidence: 'dupList.length=' + dupList.length })
  }
  await shot(page, 'qa-18-duplicate-name')

  // ---------- cleanup: remove ALL QA-name artifacts so the site returns to pilot-only ----------
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  for (const nm of [QA_STATION, 'QA Delete Me']) {
    const stList = ((await apiGet(page, 'stations/?station_name=' + encodeURIComponent(nm))).results) || []
    for (const st of stList) {
      // QA-4: employees are outside the cascade — remove them first
      const emps = ((await apiGet(page, 'employees/?station=' + st.name)).results) || []
      for (const e of emps) { const r = await qaDelete(page, 'employees', e.name); console.log('[cleanup] employee', e.name, r.status) }
      const r = await qaDelete(page, 'stations', st.name)
      console.log('[cleanup] station', st.name, r.status)
      step('Cleanup: "' + nm + '" removed', !!r.ok, st.name + ' → ' + r.status)
    }
  }

  appendRun('Console errors (phase 2)', page.consoleErrors.length ? page.consoleErrors.map((e) => '- ' + e).join('\n') : '- none')
  appendRun('Network ≥400 (phase 2)', page.netFails.length ? page.netFails.map((e) => '- ' + e).join('\n') : '- none')

  await browser.close()
  fs.writeFileSync(__dirname + '/qa-checkpoints/phase2-done.txt', new Date().toISOString())
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error("FATAL:", e.message.split("\n")[0], "\n", (e.stack||"").split("\n").slice(1,4).join("\n")); process.exit(2) })
