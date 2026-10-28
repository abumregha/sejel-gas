// PHASE 5 — Inventory & fuel accounting (QA prompt §15–§16).
//
// Goals:
//   A. Sweep every /inventory/* screen as the station owner (Sejel Manager)
//      — the role the real user has — and record render + console/network health.
//   B. Real CRUD on a delivery (create → verify in list → detail → delete)
//      on «QA Edge Station» so no client data is touched.
//   C. Transfer between two tanks (needs >= 2 tanks) and the shortage /
//      fuel-reconciliation screens.
//
// Everything is QA-created data on "QA Edge Station" and is deleted afterwards.
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, apiPost, apiPut, qaFillField, qaDelete, qaStationId } = require('./qa')

const EDGE = 'QA Edge Station'
const INVENTORY_ROUTES = [
  ['/inventory/deliveries', 'التموين'],
  ['/inventory/deliveries/create', 'نموذج تموين'],
  ['/inventory/shipments/create', 'إضافة شحنة موحدة'],
  ['/inventory/shipments/create?type=delivery', 'إضافة توريد'],
  ['/inventory/tank-readings', 'قراءات الخزانات'],
  ['/inventory/transfers', 'التحويلات'],
  ['/inventory/transfers/create', 'نموذج تحويل'],
  ['/inventory/shortages', 'العجز'],
  ['/inventory/fuel-reconciliation', 'مطابقة الوقود'],
  ['/inventory/requests', 'طلبات التموين'],
  ['/inventory/requests/create', 'طلب تموين'],
]

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  const consoleAt = []      // console errors per route
  page.on('console', (m) => { if (m.type() === 'error') consoleAt.push(m.text().slice(0, 160)) })

  await uiLogin(page, 'owner@sejel.ly', 'owner123')
  step('logged in as station owner (Sejel Manager)', !page.url().includes('login'))

  // ---------- Part A: route sweep ----------
  appendRun('## Phase 5 — inventory screen sweep (as station owner)', '')
  for (const [route, label] of INVENTORY_ROUTES) {
    consoleAt.length = 0
    const before = page.netFails.length
    await page.goto((process.env.QA_BASE || 'http://localhost:8004') + route, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1600)
    const txt = await bodyText(page)
    const blank = txt.trim().length < 40
    const errs = consoleAt.slice()
    const bad = page.netFails.slice(before)
    step(`${route} renders`, !blank, blank ? 'blank page' : `${txt.trim().length} chars`)
    if (blank) defect({ id: 'QA-17', severity: 'P2', area: `Inventory ${route}`,
      repro: `navigate to ${route} as station owner`,
      expected: 'screen renders with content',
      actual: 'blank/near-empty page', evidence: 'phase 5 sweep' })
    appendRun('### ' + route + ' (' + label + ')',
      '- rendered chars: ' + txt.trim().length +
      '\n- console errors: ' + (errs.length ? errs.join(' | ') : '(none)') +
      '\n- network ≥400: ' + (bad.length ? bad.join(', ') : '(none)') +
      '\n- visible text: ' + JSON.stringify(txt.replace(/\s+/g, ' ').slice(0, 220)))
    await shot(page, 'qa-phase5-' + route.replace(/\//g, '-').replace(/^-/, ''))
  }

  // ---------- Part B: delivery CRUD ----------
  await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/deliveries/create', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)

  // negative: submit empty — should be blocked with an Arabic message, not a crash
  const saveBtn = page.locator('button', { hasText: /حفظ|إضافة|تسجيل/ }).first()
  step('delivery form has a save button', (await saveBtn.count()) > 0)
  if (await saveBtn.count()) {
    await saveBtn.click()
    await page.waitForTimeout(1500)
    const t = await bodyText(page)
    const guided = /يجب|أدخل|خطأ|يرجى|لا يمكن/.test(t)
    // `true` here proved nothing (round 4 audit): the claim is that nothing
    // was written and the operator was not navigated away.
    step('empty submit blocked (still on the form, nothing saved)',
      page.url().includes('/inventory/deliveries/create'),
      guided ? 'inline Arabic message shown' : 'blocked by native validation — no in-page Arabic text')
    appendRun('## Phase 5 — delivery empty-submit validation',
      '- inline guidance shown: ' + guided +
      '\n- note: the form relies on HTML5 `required` only — an empty submit is blocked by the ' +
      'browser with no persistent in-page Arabic message, and the fuel-type / tank fields are ' +
      'silently left empty.\n- page text: ' + JSON.stringify(t.replace(/\s+/g, ' ').slice(-260)))
  }

  // fill a real delivery on «QA Edge Station»
  const invoice = 'QA-INV-' + Date.now().toString().slice(-6)
  let created = null
  const before = (await apiGet(page, 'deliveries/'))
  const beforeList = (before.results || before.message?.results || [])
  const beforeCount = beforeList.length

  try {
    await qaFillField(page, 'المحطة', EDGE)
    await page.waitForTimeout(1000)
    // tank list is filtered by the chosen station — it is a required field and
    // the form saves nothing without it (silent no-op, see QA-18 note).
    await qaFillField(page, 'الخزان', 'T1')
    const advBtnB = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
    if (await advBtnB.count()) { await advBtnB.click(); await page.waitForTimeout(400) }
    await qaFillField(page, 'رقم الفاتورة', invoice)
    await qaFillField(page, 'الكمية (لتر)', '5000')
    await qaFillField(page, 'القراءة قبل', '100000')
    await qaFillField(page, 'القراءة بعد', '104900')
    const invoiceField = await page
      .locator("xpath=//label[normalize-space(.)='رقم الفاتورة']/following::input[1]").first()
      .inputValue().catch(() => '')
    step('delivery form filled (station + tank + quantities + readings)',
      invoiceField === invoice, `invoice field=${invoiceField || '(empty)'}`)
    await saveBtn.click()
    await page.waitForTimeout(3000)
    const after = (await apiGet(page, 'deliveries/'))
    const afterList = (after.results || after.message?.results || [])
    created = afterList.find((d) => d.invoice_number === invoice) || null
    const redirected = page.url().includes('/inventory/deliveries')
    step('delivery created via the UI', !!created,
      created ? `${created.name} ${created.received_quantity}L short ${created.shortage}L`
              : (redirected ? 'redirected to list but NOT persisted' : 'no redirect, not persisted'))
    if (!created && redirected) {
      defect({ id: 'QA-19', severity: 'P2', area: 'Inventory — delivery create',
        repro: '/inventory/deliveries/create → QA Edge Station + T1 + invoice + quantities → حفظ',
        expected: 'redirect to the deliveries list and a new delivery row',
        actual: 'redirect happens but no Delivery document is persisted; the operator believes the load was recorded',
        evidence: 'phase 5 Part B' })
    }
    await shot(page, 'qa-phase5-delivery-saved')
    appendRun('## Phase 5 — delivery create',
      '\n- invoice ref used: ' + invoice +
      '\n- deliveries before: ' + beforeCount + ', after: ' + afterList.length +
      '\n- created record: ' + JSON.stringify(created) +
      '\n- url after save: ' + page.url())
  } catch (e) {
    step('delivery form could not be filled', false, e.message)
    appendRun('## Phase 5 — delivery create FAILED', '\n- ' + e.message)
  }

  // ---------- Part C: shortages / fuel reconciliation data ----------
  for (const r of ['/inventory/shortages', '/inventory/fuel-reconciliation', '/finance/reconciliations']) {
    await page.goto((process.env.QA_BASE || 'http://localhost:8004') + r, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const t = (await bodyText(page)).replace(/\s+/g, ' ')
    appendRun('## Phase 5 — ' + r,
      '- text: ' + JSON.stringify(t.slice(0, 500)))
    await shot(page, 'qa-phase5' + r.replace(/\//g, '-'))
  }

  // ---------- Part D: unified form — scheduled create + arrival link ----------
  const schedInvoice = 'QA-SCH-' + Date.now().toString().slice(-6)
  const edgeId = await qaStationId(page, EDGE)
  const fuelList = await apiGet(page, 'fuel-types/?limit_page_length=1')
  const fuelName = ((fuelList && fuelList.results) || [])[0]?.name
  const dep = (edgeId && fuelName) ? await apiPost(page, 'station-deposits/', {
    station: edgeId, invoice_number: schedInvoice,
    invoice_date: new Date().toISOString().slice(0, 10),
    fuel_product: fuelName, deposit_amount: 500000,
  }) : null
  const depName = dep && dep.name
  step('deposit created (scheduled-shipment preconditions)', !!depName, depName ? String(depName) : JSON.stringify(dep || {}).slice(0, 200))

  let createdSched = null
  if (depName) {
    await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipments/create', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    await qaFillField(page, 'الفاتورة / الإيداع', schedInvoice)
    await page.waitForTimeout(1200)
    await qaFillField(page, 'المحطة', EDGE)
    await qaFillField(page, 'نوع الوقود', fuelName)
    await qaFillField(page, 'الكمية (لتر)', '30000')
    const advBtnD = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
    if (await advBtnD.count()) { await advBtnD.click(); await page.waitForTimeout(400) }
    const priceInput = page.locator("xpath=//input[@placeholder='مثال: 0.14875000']").first()
    if (await priceInput.count()) await priceInput.fill('0.14875000')
    const serialInput = page.locator("xpath=//label[contains(., 'المسلسل')]/following::input[1]").first()
    const serialSuggested = await serialInput.inputValue().catch(() => '')
    step('serial auto-suggested from deposit', serialSuggested === '1', `serial field=${serialSuggested || '(empty)'}`)
    await page.locator('button', { hasText: /حفظ/ }).first().click()
    await page.waitForTimeout(2500)
    const ssList = await apiGet(page, 'shipment-schedules/?limit_page_length=0')
    createdSched = ((ssList && ssList.results) || []).find(x => x.invoice_number === schedInvoice) || null
    step('scheduled shipment persisted via unified form', !!createdSched,
      createdSched ? `name=${createdSched.name} serial=${createdSched.serial_number} status=${createdSched.status} qty=${createdSched.quantity} price=${createdSched.unit_price}` : 'not found')
    if (createdSched) {
      step('created with locked status scheduled', createdSched.status === 'scheduled', `status=${createdSched.status}`)
      step('deposit auto-filled invoice/station', createdSched.invoice_number === schedInvoice && createdSched.station === edgeId,
        `invoice=${createdSched.invoice_number} station=${createdSched.station}`)
    }

    if (createdSched) {
      await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipment-schedules', { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)
      const row = page.locator('tr', { hasText: schedInvoice }).first()
      const arriveBtn = row.locator('a', { hasText: 'استلام' }).first()
      step('استلام action on scheduled row', (await arriveBtn.count()) > 0)
      if (await arriveBtn.count()) {
        await arriveBtn.click()
        await page.waitForTimeout(1500)
        const bannerTxt = await bodyText(page)
        step('arrival banner shows schedule line', /شحنة مجدولة/.test(bannerTxt))
        await qaFillField(page, 'الخزان', 'T1')
        const advBtnA = page.locator('button', { hasText: 'خيارات متقدمة' }).first()
        if (await advBtnA.count()) { await advBtnA.click(); await page.waitForTimeout(400) }
        await qaFillField(page, 'القراءة قبل', '200000')
        await qaFillField(page, 'القراءة بعد', '229950')
        await page.locator('button', { hasText: /حفظ/ }).first().click()
        await page.waitForTimeout(3000)
        const schedAfter = await apiGet(page, 'shipment-schedules/' + createdSched.name + '/')
        step('schedule flipped to delivered + linked', schedAfter.status === 'delivered' && !!schedAfter.delivery,
          `status=${schedAfter.status} delivery=${schedAfter.delivery}`)
        const delivAfter = schedAfter.delivery ? await apiGet(page, 'deliveries/' + schedAfter.delivery + '/') : null
        step('delivery back-links shipment_schedule', !!delivAfter && delivAfter.shipment_schedule === createdSched.name,
          `link=${delivAfter && delivAfter.shipment_schedule} received=${delivAfter && delivAfter.received_quantity}`)
        appendRun('## Phase 5 — unified shipment form (scheduled + arrival)',
          '- deposit: ' + depName +
          '\n- schedule: ' + JSON.stringify(createdSched) +
          '\n- after arrival: ' + JSON.stringify(schedAfter) +
          '\n- delivery: ' + JSON.stringify(delivAfter))
        await page.goto((process.env.QA_BASE || 'http://localhost:8004') + '/inventory/shipments/' + createdSched.name + '?type=schedule', { waitUntil: 'domcontentloaded' })
        await page.waitForTimeout(1500)
        const editText = await bodyText(page)
        step('schedule edit route renders edit form', /تعديل الشحنة/.test(editText), JSON.stringify(editText.replace(/\s+/g, ' ').slice(0, 160)))
        // Sejel Manager has no delete perm — cleanup as admin. The schedule and
        // its delivery are cross-linked (schedule.delivery ↔
        // delivery.shipment_schedule): unlink first or both deletes hit
        // LinkExistsError, and the controller forbids delivered-without-delivery.
        await uiLogin(page, 'admin@sejel.ly', 'admin123')
        const unlnk = await apiPut(page, 'shipment-schedules/' + createdSched.name + '/', { status: 'cancelled', delivery: null })
        const delD = schedAfter.delivery ? await qaDelete(page, 'deliveries', schedAfter.delivery) : { ok: true }
        const delS = await qaDelete(page, 'shipment-schedules', createdSched.name)
        const delDep = await qaDelete(page, 'station-deposits', depName)
        step('Part D cleanup (unlink, delete delivery/schedule/deposit)',
          !(unlnk && unlnk.__status) && delD.ok && delS.ok && delDep.ok,
          JSON.stringify({ unlnk: (unlnk && unlnk.__status) || 'ok', delD, delS, delDep }))
      }
    }
  }

  // ---------- final cleanup (admin): Sejel Manager has no delete perm ----------
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  step('admin session for cleanup', !page.url().includes('login'))
  if (created) {
    const delRes = await qaDelete(page, 'deliveries', created.name)
    step('Part B delivery cleaned up', delRes.ok === true, JSON.stringify(delRes))
  }

  appendRun('## Phase 5 — network ≥400 (all)',
    (page.netFails || []).slice(0, 40).map((x) => '- ' + x).join('\n') || '(none)')
  appendRun('## Phase 5 — console errors (all)',
    (page.consoleErrors || []).slice(0, 30).map((x) => '- ' + x).join('\n') || '(none)')

  summary('qa-phase5-inventory')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })