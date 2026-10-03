// PHASE 6 — Reports, exports and the remaining finance screens (QA prompt §17–§18).
//
// The headline question of this QA round is whether a station employee can finish the
// 11:00→11:00 cycle without Excel. So this phase deliberately checks:
//   A. every /reports/* screen renders real numbers for a station that has data
//   B. the Excel export link actually downloads something (and for which stations)
//   C. every remaining /finance/* screen as the OWNER role — the nav offers all of them,
//      so a screen the station employee cannot use is a defect, not a curiosity
//   D. a tank reading + tank transfer (the pilot station has two tanks)
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, qaFillField } = require('./qa')

const BASE = 'http://localhost:8004'
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
  const exportProbe = await page.evaluate(async () => {
    const out = []
    for (const url of ['/api/export/?view=station&name=f9sdreji1j', '/api/export/?view=station', '/api/export/']) {
      const r = await fetch(url, { credentials: 'include' })
      const ct = r.headers.get('content-type') || ''
      const body = r.status === 200 ? (await r.text()).slice(0, 160) : ''
      out.push({ url, status: r.status, contentType: ct, length: body.length, head: body.slice(0, 120) })
    }
    return out
  })
  appendRun('## Phase 6 — export endpoint probe',
    '\n```\n' + JSON.stringify(exportProbe, null, 1) + '\n```')
  const ok = exportProbe.find((e) => e.status === 200)
  step('Excel export endpoint responds 200', !!ok,
    ok ? `${ok.url} → ${ok.contentType}` : exportProbe.map((e) => `${e.url}=${e.status}`).join(', '))

  // is the Excel button even reachable for a multi-station report?
  await page.goto(BASE + '/reports/monthly', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const excelLink = page.locator('a', { hasText: 'Excel' })
  step('monthly report exposes an Excel link', (await excelLink.count()) > 0,
    (await excelLink.count()) ? await excelLink.first().getAttribute('href') : 'not rendered')
  if (await excelLink.count()) {
    const href = await excelLink.first().getAttribute('href')
    appendRun('## Phase 6 — monthly report Excel link',
      '- href: ' + href +
      '\n- note: the link renders only when the report covers exactly one station ' +
      '(`v-if="report?.stations?.length === 1"`), so with several stations there is no export at all.')
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
    await qaFillField(page, 'إلى خزان', 'خزان 2')
    await qaFillField(page, 'الكمية (لتر)', '500')
    await qaFillField(page, 'السبب', 'QA — اختبار التحويل')
    step('transfer form filled (pilot, tank 1 → tank 2, 500 L)', true)
    const save = page.locator('button[type="submit"], button', { hasText: /حفظ|إضافة|تسجيل/ }).first()
    await save.click()
    await page.waitForTimeout(2500)
    const t = (await bodyText(page)).replace(/\s+/g, ' ')
    const i = t.indexOf('رجوع')
    step('transfer created', /تم|نجح/.test(t.slice(i, i + 400)), t.slice(i, i + 220))
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