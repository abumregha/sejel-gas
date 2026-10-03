// PHASE 4 — Shift finance: income entry (cash / coupons / POS) → day close →
// reconciliation arithmetic cross-check (client prompt §15–§18).
//
// Station: pilot "محطة تجريبية — سجل" (day_close 11:00). Readings for today were saved in
// phase 3: M01A 8,223 L بنزين + M01B 8,580 L ديزل = 16,803 L; fuel price 0.15 د.ل/لتر.
// Inputs: cash 2,000 | coupons 10×5 + 5×8 = 90 | POS 300 → declared revenue 2,390.00
// Expected: expected_sales 2,520.45 → total_collection 2,390.00 → difference −130.45 (short).
// net_cash is the CASH position (invariant §1.6) = 2,000 — cash only, no cash expenses.
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, apiPost, qaStationId, qaReopenStationDay, qaEnsureShift, qaEnsureDayClose, PILOT_COUNTERS } = require('./qa')

const BASE2 = 'http://localhost:8004'
const PILOT = 'محطة تجريبية — سجل'
const CASH = 2000
const COUPON_5 = 10   // 50 د.ل
const COUPON_8 = 5    // 40 د.ل
const EPAYMENT = 300
const EPAYMENT_TXN = 7   // QA-12: electronic sales were 7 card transactions, not 1
const DECLARED = CASH + COUPON_5 * 5 + COUPON_8 * 8 + EPAYMENT  // 2390

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await page.setViewportSize({ width: 1366, height: 900 })
  step('owner login', await uiLogin(page, 'owner@sejel.ly', 'owner123'))
  await page.waitForTimeout(600)

  // ---------- replay guard ----------
  // Phase 4 CLOSES the day, so its own previous run left yesterday's finance
  // state sealed. Clear that ONE station-day's cash/vouchers/POS/reconciliation
  // and reopen the shifts so the run can repeat — but KEEP the meter readings,
  // which phase 3 wrote and which are the entire basis of the litre arithmetic
  // checked below. Deleting a Reconciliation needs Administrator (a manager gets
  // 403), so this runs in its own admin session.
  //
  // This suite therefore depends on qa-phase3-readings.js having run first.
  const TODAY = new Date().toISOString().slice(0, 10)
  const p4Ctx = await browser.newContext()
  const p4Admin = await p4Ctx.newPage()
  await uiLogin(p4Admin, 'admin@sejel.ly', 'admin123')
  const cleared = await qaReopenStationDay(p4Admin, PILOT, TODAY)
  step('cleared today\'s pilot finance state so the run can repeat',
    cleared.ok,
    cleared.ok
      ? `${cleared.removed} finance/recon row(s) removed, ${cleared.reopened} shift(s) reopened, ${cleared.readingsKept} reading(s) KEPT`
      : String(cleared.error || (cleared.problems || []).join(' · ')))
  step('today\'s pilot readings survived the clear (phase 3 ran first)', cleared.readingsKept > 0,
    `${cleared.readingsKept} reading(s) — run qa-phase3-readings.js first if this is 0`)
  const pilotId0 = await qaStationId(page, PILOT)
  const ensured = await qaEnsureShift(page, pilotId0, TODAY)
  step('an open shift exists for today', ensured.ok, ensured.ok
    ? `id=${ensured.id} status=${ensured.status} created=${ensured.created}`
    : ensured.error)
  // Two distinct Shifts are needed: an employee shift for the finance postings,
  // and the station's day-close container for «åââáá çليوم». The readings
  // screen only offers the close button against the latter.
  const dayClose = await qaEnsureDayClose(page, pilotId0, TODAY)
  step('the day-close container exists for today', dayClose.ok && !dayClose.closed, dayClose.ok
    ? `id=${dayClose.id} status=${dayClose.status} closed=${dayClose.closed}`
    : dayClose.error)

  // ================= income entry =================
  // Navigate AFTER provisioning: the screen loads its shift list on mount, so
  // a shift created a moment earlier is only visible on a fresh load.
  await page.goto(BASE2 + '/app/finance/income', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  const card = (h3) => page.locator(`xpath=//h3[normalize-space()='${h3}']/parent::div`).first()
  const byLabel = (label, scope) =>
    (scope || page).locator(`xpath=//label[normalize-space()='${label}']/following-sibling::*[1]`).first()

  const stationSel = byLabel('المحطة')
  const opts = await stationSel.locator('option').allTextContents()
  const pidx = opts.findIndex((t) => t.includes(PILOT))
  if (pidx >= 0) await stationSel.selectOption({ index: pidx })
  step('Income entry: station picker lists pilot', pidx >= 0, opts.join(' | ').slice(0, 120))

  const shiftSel = byLabel('المناوبة')
  const sopts = await shiftSel.locator('option').allTextContents()
  const today = new Date().toISOString().slice(0, 10)
  const sidx = sopts.findIndex((t) => t.includes(today))
  if (sidx >= 0) await shiftSel.selectOption({ index: sidx })
  step('Open shift selectable for today', sidx >= 0, sopts.join(' | ').slice(0, 140))

  await byLabel('المبلغ (د.ل)', card('المبيعات النقدية')).fill(String(CASH))
  await byLabel('5 د.ل').fill(String(COUPON_5))
  await byLabel('8 د.ل').fill(String(COUPON_8))
  await byLabel('المبلغ (د.ل)', card('المبيعات الإلكترونية')).fill(String(EPAYMENT))
  await page.locator('[data-testid="epayment-count"]').fill(String(EPAYMENT_TXN))
  await page.waitForTimeout(400)

  const totalTxt = await bodyText(page)
  const totalShown = (totalTxt.match(/إجمالي الإيرادات\s*([\d,]+\.?\d*)/) || [])[1] || ''
  step('Live revenue total = 2,390.00 before saving', totalShown.replace(/,/g, '') === '2390', 'shown=' + totalShown)
  const couponTxt = (totalTxt.match(/إجمالي الكوبونات:\s*([\d,]+)/) || [])[1] || ''
  step('Coupon subtotal = 90', couponTxt.replace(/,/g, '') === '90', 'shown=' + couponTxt)

  await page.locator('button', { hasText: 'حفظ الإيرادات' }).first().click()
  await page.waitForTimeout(2500)
  const saveTxt = await bodyText(page)
  step('Income entry saved with confirmation', saveTxt.includes('تم الحفظ بنجاح'))

  // QA-13: one save posts cash / coupons / electronic independently. The screen
  // must name each leg and its amount — a green tick with no figures tells an
  // operator nothing when they are reconciling the till against the screen.
  const legBox = page.locator('[data-testid="income-legs"]')
  const legText = (await legBox.innerText().catch(() => '')).replace(/\s+/g, ' ')
  step('each leg is confirmed by name with its amount (QA-13)',
    /المبيعات النقدية/.test(legText)
      && /كوبونات/.test(legText)
      && /2,000/.test(legText),
    legText.slice(0, 200))
  if (!saveTxt.includes('تم الحفظ بنجاح')) {
    defect({ id: 'QA-13', severity: 'P1', area: 'Shift income entry', repro: 'Income entry: station + shift + amounts → حفظ الإيرادات', expected: 'تم الحفظ بنجاح + cash/voucher/POS records', actual: 'No confirmation; page text: ' + saveTxt.slice(0, 160), evidence: 'phase 4 console' })
  }
  await shot(page, 'qa-30-income-entry')

  // ================= backend verification of the three postings =================
  const pilotId = await qaStationId(page, PILOT)
  step('pilot station resolved by name', !!pilotId, String(pilotId))
  const shifts = ((await apiGet(page, 'shifts/?station=' + pilotId)).results) || []
  const todaysShift = shifts.find((s) => (s.date || '').slice(0, 10) === today) || shifts[0]
  const shiftId = todaysShift && todaysShift.name
  const cashRows = ((await apiGet(page, 'cash-collections/?shift=' + shiftId)).results) || []
  const vouRows = ((await apiGet(page, 'vouchers/?shift=' + shiftId)).results) || []
  const posRows = ((await apiGet(page, 'pos-records/?shift=' + shiftId)).results) || []
  const cashSum = cashRows.reduce((s, r) => s + Number(r.amount || 0), 0)
  const vouSum = vouRows.reduce((s, r) => s + Number(r.total_value || 0), 0)
  const posSum = posRows.reduce((s, r) => s + Number(r.total_amount || 0), 0)
  step('Cash collection stored = 2,000', Math.abs(cashSum - CASH) < 0.01, cashSum + ' (' + cashRows.length + ' rows)')
  step('Coupons stored = 90 (10×5 + 5×8)', Math.abs(vouSum - 90) < 0.01, vouSum + ' rows=' + vouRows.length + ' ' + JSON.stringify(vouRows.map((v) => ({ c: v.count, t: v.total_value }))))
  step('POS record stored = 300', Math.abs(posSum - EPAYMENT) < 0.01, posSum + ' (' + posRows.length + ' rows)')
  const txnCount = posRows.length ? Number(posRows[0].transaction_count || 0) : null
  step('POS transaction_count is operator-controlled (QA-12)', txnCount === EPAYMENT_TXN, 'transaction_count=' + txnCount)

  // ================= day close =================
  await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const rsel = page.locator('[data-testid="readings-station"]')
  const ropts = await rsel.locator('option').allTextContents()
  const ri = ropts.findIndex((t) => t.includes(PILOT))
  if (ri >= 0) await rsel.selectOption({ index: ri })
  await page.waitForTimeout(1500)
  await page.locator('[data-testid="close-day"]').click()
  await page.waitForTimeout(3000)
  const closeTxt = await bodyText(page)
  step('Day close creates reconciliation (notice)', closeTxt.includes('تم إقفال اليوم'), (closeTxt.match(/تم إقفال[^]*/) || [''])[0].slice(0, 80))
  step('Day close error banner absent', !/خطأ|تعذّر|فشل/.test(closeTxt), '')
  await shot(page, 'qa-31-day-closed')

  // ================= reconciliation arithmetic =================
  const recs = ((await apiGet(page, 'reconciliations/?station=' + pilotId)).results) || []
  const rec = recs[0]
  appendRun('Reconciliation payload (pilot)', JSON.stringify(rec || null, null, 1))
  step('Reconciliation record created', !!rec, rec && rec.name)
  if (rec) {
    const liters = Number(rec.total_liters || 0)
    const expected = Number(rec.expected_sales || 0)
    const tCash = Number(rec.total_cash || 0)
    const tVou = Number(rec.total_vouchers || 0)
    const tPos = Number(rec.total_pos || 0)
    const net = Number(rec.net_cash || 0)
    const diff = Number(rec.difference || 0)
    step('total_liters = 16,803 (8,223 + 8,580)', Math.abs(liters - 16803) < 0.5, String(liters))
    step('expected_sales = 2,520.45 (16,803 × 0.15)', Math.abs(expected - 2520.45) < 0.02, String(expected))
    step('total_cash = 2,000', Math.abs(tCash - CASH) < 0.01, String(tCash))
    step('total_vouchers = 90', Math.abs(tVou - 90) < 0.01, String(tVou))
    step('total_pos = 300', Math.abs(tPos - EPAYMENT) < 0.01, String(tPos))
    // net_cash is the CASH position (invariant §1.6: cash_collected − cash_expenses),
    // NOT total collection (§1.7). Assert both so the distinction cannot drift silently.
    step('total_collection = declared 2,390', Math.abs(Number(rec.total_collection || 0) - DECLARED) < 0.02, String(rec.total_collection))
    step('net_cash = cash only 2,000 (no cash expenses)', Math.abs(net - CASH) < 0.02, String(net))
    step('difference = −130.45 (2,390 − 2,520.45)', Math.abs(diff - (DECLARED - 2520.45)) < 0.02, String(diff))
    step('difference_type flags the shortfall', /short|نقص/.test(String(rec.difference_type || '')), String(rec.difference_type))

    // reconciliation detail screen shows the same numbers
    await page.goto(BASE2 + '/app/finance/reconciliations/' + rec.name, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    const rtxt = await bodyText(page)
    step('Reconciliation detail renders', rtxt.includes('التسوية') || rtxt.includes('تسوية'), '')
    step('Detail shows cash in hand 2,000 and total collection 2,390',
      rtxt.includes('2,000') && rtxt.includes('2,390'),
      (rtxt.match(/النقد في الصندوق[^0-9]*([\d,.]+)/) || ['', '?'])[1])
    await shot(page, 'qa-32-reconciliation-detail')
  }

  // ================= finance screen sweep =================
  const screens = [
    ['/app/finance/daily-sales', 'daily-sales', ['المبيعات']],
    ['/app/finance/cash', 'cash', ['التحصيل النقدي']],
    ['/app/finance/vouchers', 'vouchers', ['الكوبونات']],
    ['/app/finance/pos', 'pos', ['POS']],
    ['/app/finance/expenses', 'expenses', ['المصروفات']],
    ['/app/finance/reconciliations', 'reconciliations', ['التسويات']],
    ['/app/finance/settlements', 'settlements', ['تسويات الكوبونات']],
    ['/app/shifts/day', 'shifts-day', ['يوم المحطة']],
  ]
  for (const [url, name, needles] of screens) {
    await page.goto(BASE2 + url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1100)
    const txt = await bodyText(page)
    const hit = needles.some((n) => txt.includes(n))
    const crashed = /خطأ في التحميل|تعذّر تحميل|Cannot read/.test(txt)
    step('Finance screen renders: ' + name, hit && !crashed, hit ? '' : 'missing heading, text=' + txt.slice(0, 80))
    await shot(page, 'qa-33-' + name)
  }

  appendRun('Console errors (phase 4)', page.consoleErrors.length ? page.consoleErrors.map((e) => '- ' + e).join('\n') : '- none')
  appendRun('Network ≥400 (phase 4)', page.netFails.length ? page.netFails.map((e) => '- ' + e).join('\n') : '- none')

  await browser.close()
  fs_write()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0], '\n', (e.stack || '').split('\n').slice(1, 4).join('\n')); process.exit(2) })

function fs_write() {
  require('fs').writeFileSync(__dirname + '/qa-checkpoints/phase4-done.txt', new Date().toISOString())
}