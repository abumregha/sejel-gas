// PHASE 6 — Reports, exports and the remaining finance screens (QA prompt §17–§18).
//
// The headline question of this QA round is whether a station employee can finish the
// 11:00→11:00 cycle without Excel. So this phase deliberately checks:
//   A. every /reports/* screen renders real numbers for a station that has data
//   B. the Excel export link actually downloads something (and for which stations)
//   C. every remaining /finance/* screen as the OWNER role — the nav offers all of them,
//      so a screen the station employee cannot use is a defect, not a curiosity
//   D. a tank reading + tank transfer (the pilot station has two tanks)
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, qaFillField, qaStationId } = require('./qa')

const BASE = 'http://localhost:8004'
const PILOT = 'محطة تجريبية — سجل'   // the only station with real data
const REPORTS = ['/reports/daily', '/reports/monthly', '/reports/inventory', '/shifts/gaps', '/shifts/day']
const FINANCE = [
  '/finance', '/finance/daily-sales', '/finance/fuel-prices', '/finance/cash',
  '/finance/vouchers', '/finance/pos', '/finance/expenses', '/finance/settlements',
  '/finance/reconciliations',
]

// nav text -> route, to prove the sidebar offers links the owner cannot open
const NAVLINKS = [
  ['إدخال إيرادات', '/finance/income'],
  ['المبيعات', '/finance/daily-sales'],
  ['أسعار الوقود', '/finance/fuel-prices'],
  ['النقدية', '/finance/cash'],
  ['القسائم', '/finance/vouchers'],
  ['الدفع الإلكتروني', '/finance/pos'],
  ['المصروفات', '/finance/expenses'],
  ['تسوية القسائم', '/finance/settlements'],
  ['الفجوات', '/shifts/gaps'],
]

const visible = async (page, route) => {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  const t = (await bodyText(page)).replace(/\s+/g, ' ')
  const i = t.indexOf('رجوع')
  return t.slice(i, i + 900)
}

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await uiLogin(page, 'owner@sejel.ly', 'owner123')
  step('logged in as station owner', !page.url().includes('login'))

  // ---------- A. reports ----------
  appendRun('## Phase 6 — reports (as station owner)', '')
  for (const r of REPORTS) {
    const before = page.netFails.length
    const t = await visible(page, r)
    const hasData = !/اختر تاريخاً|لا توجد|لا يوجد/.test(t.slice(0, 200))
    step(`${r} shows data`, hasData, t.slice(0, 110))
    appendRun('### ' + r,
      '- text: ' + JSON.stringify(t.slice(0, 600)) +
      '\n- network ≥400: ' + (page.netFails.slice(before).join(', ') || '(none)'))
    await shot(page, 'qa-phase6' + r.replace(/\//g, '-'))
  }

  // daily report needs an explicit date → drive it and check the numbers
  await page.goto(BASE + '/reports/daily', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  const dateInput = page.locator('input[type="date"]').first()
  if (await dateInput.count()) {
    await dateInput.fill('2026-10-03')
    await page.locator('button', { hasText: 'عرض' }).first().click()
    await page.waitForTimeout(2000)
    const t = (await bodyText(page)).replace(/\s+/g, ' ')
    const i = t.indexOf('رجوع')
    appendRun('## Phase 6 — daily report for 2026-10-03 (explicit date)',
      '- text: ' + JSON.stringify(t.slice(i, i + 700)))
    step('daily report renders KPIs for 2026-10-03', /إجمالي اللترات/.test(t))
    await shot(page, 'qa-phase6-daily-report')
  }

  // ---------- B. export ----------
  // Resolve the station id OUTSIDE the page: qaStationId is a Node helper and
  // is not in scope inside page.evaluate (this used to throw ReferenceError).
  const pilotId = await qaStationId(page, PILOT)
  step('pilot station resolved by name', !!pilotId, String(pilotId))
  const exportProbe = await page.evaluate(async (pilotId) => {
    const out = []
    for (const url of [`/api/export/?view=station&name=${pilotId}`, '/api/export/?view=station', '/api/export/']) {
      const r = await fetch(url, { credentials: 'include' })
      const ct = r.headers.get('content-type') || ''
      const body = r.status === 200 ? (await r.text()).slice(0, 160) : ''
      out.push({ url, status: r.status, contentType: ct, length: body.length, head: body.slice(0, 120) })
    }
    return out
  }, pilotId)
  appendRun('## Phase 6 — export endpoint probe',
    '\n```\n' + JSON.stringify(exportProbe, null, 1) + '\n```')
  const ok = exportProbe.find((e) => e.status === 200)
  step('Excel export endpoint responds 200', !!ok,
    ok ? `${ok.url} → ${ok.contentType}` : exportProbe.map((e) => `${e.url}=${e.status}`).join(', '))

  // QA-25: the Excel link used to render ONLY for a single-station report, so the
  // manager role — the multi-station case — had no export at all. The link now
  // renders whenever the report has stations, with a picker for which one.
  await page.goto(BASE + '/reports/monthly', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const excelLink = page.locator('[data-testid="export-excel"]')
  step('monthly report exposes an Excel link for a multi-station report (QA-25)',
    (await excelLink.count()) > 0,
    (await excelLink.count()) ? await excelLink.first().getAttribute('href') : 'not rendered')
  const stationPicker = page.locator('[data-testid="export-station"]')
  const pickerOpts = await stationPicker.locator('option').allTextContents().catch(() => [])
  step('operator chooses which station to export', pickerOpts.length > 1,
    pickerOpts.length ? pickerOpts.slice(0, 4).join(' | ') + (pickerOpts.length > 4 ? ` (+${pickerOpts.length - 4})` : '') : 'no picker')
  if (await excelLink.count()) {
    const href = await excelLink.first().getAttribute('href')
    step('export href names a real station', /name=[a-z0-9]{6,}/i.test(href || ''), 'href: ' + href)
    appendRun('## Phase 6 — monthly report Excel link',
      '- href: ' + href + '\n- station picker offers: ' + pickerOpts.join(' | '))
  }

  // ---------- C. finance screens as owner ----------
  appendRun('## Phase 6 — finance screens (as station owner)', '')
  for (const r of FINANCE) {
    const before = page.netFails.length
    const t = await visible(page, r)
    const bad = page.netFails.slice(before)
    const denied = bad.some((b) => b.startsWith('403')) || /لا تملك صلاحية|غير مصرح|403/.test(t)
    step(`${r} usable by owner`, !denied, denied ? bad.join(', ') : t.slice(0, 90))
    appendRun('### ' + r,
      '- text: ' + JSON.stringify(t.slice(0, 400)) +
      '\n- network ≥400: ' + (bad.join(', ') || '(none)'))
    await shot(page, 'qa-phase6' + r.replace(/\//g, '-'))
  }

  // nav links the owner is offered but cannot use
  appendRun('## Phase 6 — sidebar links offered to the owner', '')
  for (const [label, route] of NAVLINKS) {
    const before = page.netFails.length
    const t = await visible(page, route)
    const bad = page.netFails.slice(before)
    step(`nav «${label}» (${route}) usable`, !bad.some((b) => b.startsWith('403')), bad.join(', ') || 'ok')
    appendRun(`- «${label}» → ${route}: ` + (bad.join(', ') || 'ok'))
  }

  // ---------- D. tank reading + transfer on the pilot station (2 tanks) ----------
  await page.goto(BASE + '/inventory/tank-readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  const addBtn = page.locator('button', { hasText: 'إضافة قراءة' }).first()
  if (await addBtn.count()) {
    await addBtn.click()
    await page.waitForTimeout(1200)
    const formText = (await bodyText(page)).replace(/\s+/g, ' ')
    const i = formText.indexOf('إضافة قراءة')
    appendRun('## Phase 6 — tank reading form', '- text: ' + JSON.stringify(formText.slice(i, i + 400)))
    const selects = page.locator('form select')
    const n = await selects.count()
    appendRun('## Phase 6 — tank reading form fields',
      '- selects: ' + n + ', inputs: ' + (await page.locator('form input').count()))
    step('tank reading form rendered', n > 0, n + ' selects')
    await shot(page, 'qa-phase6-tank-reading-form')
  }

  // transfer between the pilot station's two tanks
  await page.goto(BASE + '/inventory/transfers/create', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1600)
  try {
    await qaFillField(page, 'المحطة', 'محطة تجريبية')
    await page.waitForTimeout(900)
    await qaFillField(page, 'من خزان', 'خزان 1')
    await page.waitForTimeout(700)
    // The pilot's two tanks hold DIFFERENT fuels (بنزين / ديزل), so no
    // legitimate same-fuel transfer exists in this dataset. What matters is
    // that the form now says so BEFORE the operator fills in the rest, instead
    // of offering both tanks and rejecting the save with an English error.
    const toOpts = await page.locator('form select').nth(2).locator('option').allTextContents()
    const toVal = await page.locator('form select').nth(2).inputValue()
    step('destination list offers no tank of a different fuel (QA-24)',
      !toOpts.some((o) => /خزان 2/.test(o)),
      'options: ' + (toOpts.join(' | ') || '(none)') + ' selected=' + (toVal || '(empty)'))
    step('incompatible pair is explained on the form, not on save',
      (await page.locator('[data-testid="no-compatible-tank"]').count()) > 0,
      await page.locator('[data-testid="no-compatible-tank"]').innerText().catch(() => 'hint missing'))
    const save = page.locator('button[type="submit"], button', { hasText: /حفظ|إضافة|تسجيل/ }).first()
    await save.click()
    await page.waitForTimeout(2000)
    const t = (await bodyText(page)).replace(/\s+/g, ' ')
    // Assert the SERVER refusals are Arabic, not the page text: the body scan
    // above matched the word «الخزانات» in the sidebar and so could never fail.
    const tanks = await apiGet(page, 'tanks/?station=' + pilotId + '&limit_page_length=0')
    const pilotTanks = ((tanks && tanks.results) || [])
    const [t1, t2] = pilotTanks
    const refusals = await page.evaluate(async ({ t1, t2 }) => {
      const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
      const csrf = (me.message || me).csrf_token
      const cases = [
        { label: 'different fuel', body: { from_tank: t1.name, to_tank: t2.name, quantity: 500 } },
        { label: 'same tank', body: { from_tank: t1.name, to_tank: t1.name, quantity: 500 } },
        { label: 'zero quantity', body: { from_tank: t1.name, to_tank: t2.name, quantity: 0 } },
      ]
      const out = []
      for (const c of cases) {
        const res = await fetch('/api/tank-transfers/', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
          body: JSON.stringify(c.body),
        })
        const j = await res.json().catch(() => ({}))
        const msg = String((j.exception || '').split('\n').pop() || '').trim()
        out.push({ label: c.label, status: res.status, arabic: /[\u0600-\u06FF]/.test(msg), message: msg.slice(0, 80) })
      }
      return out
    }, { t1: t1 || {}, t2: t2 || {} })
    appendRun('## Phase 6 — QA-24 tank-transfer refusals',
      '\n```\n' + JSON.stringify(refusals, null, 1) + '\n```')
    step('every tank-transfer refusal is refused with HTTP 417', refusals.every((r) => r.status === 417),
      refusals.map((r) => `${r.label}=${r.status}`).join(', '))
    step('every tank-transfer refusal is in Arabic (QA-24)', refusals.every((r) => r.arabic),
      refusals.map((r) => `${r.label}: ${r.message}`).join(' | '))
    const i = Math.max(0, t.indexOf('رجوع'))
    appendRun('## Phase 6 — tank transfer create',
      '- text after save: ' + JSON.stringify(t.slice(i, i + 400)) + '\n- url: ' + page.url())
    await shot(page, 'qa-phase6-transfer')
    const list = await apiGet(page, 'tank-transfers/')
    appendRun('## Phase 6 — tank transfers via API',
      '\n```\n' + JSON.stringify(list).slice(0, 700) + '\n```')
  } catch (e) {
    step('transfer form could not be filled', false, e.message)
    appendRun('## Phase 6 — transfer create FAILED', '\n- ' + e.message)
  }

  appendRun('## Phase 6 — network ≥400 (all)',
    (page.netFails || []).slice(0, 60).map((x) => '- ' + x).join('\n') || '(none)')

  summary('qa-phase6-reports')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })