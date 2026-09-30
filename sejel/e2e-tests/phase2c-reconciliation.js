// Phase 2c: reconciliation flow — close a shift and verify the financial
// chain end-to-end (reconciliation auto-creation, frozen-price expected
// sales, net cash after expenses, daily-sales aggregation).
//
// Requires phase1 master data (test station mfp4p7r1gn + meter TEST-M01A).
// All money flows through the backend; the test only computes the expected
// value from the backend's own active price to check the invariant.
const { launch, login, apiGet, apiPost, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))

  const today = new Date().toISOString().split('T')[0]

  // Self-seeding: the old seed station (mfp4p7r1gn / TEST-M01A) was removed in
  // the legacy cleanup — create a dedicated station + meter for this run.
  const wiz = await apiPost(page, 'setup-station/', {
    station: { station_name: 'محطة تسوية ' + Date.now(), address: 'طرابلس', relationship_type: 'owned' },
    islands: [{ machines: 1, meters: 1 }],
    tanks: [{ fuel_type: 'بنزين', capacity: 20000 }],
  })
  const ST = wiz.station
  const wizMachines = ((await apiGet(page, `machines/?station=${ST}`)).results || [])
  const meters = ((await apiGet(page, 'meters/')).results || []).filter(m =>
    wizMachines.some(x => x.name === m.machine))
  const METER = (meters[0] || {}).name
  step('DATA: phase1 meter exists', !!METER, METER || 'missing')
  const meterDoc = await apiGet(page, `meters/${METER}/`)
  const start = Number(meterDoc.current_reading || 0)
  const end = start + 500 // exactly 500 liters this shift

  const prices = (await apiGet(page, 'fuel-prices/')).results || []
  const benzine = prices.find(p => p.fuel_type === 'بنزين' && p.is_active)
  step('DATA: active بنزين price exists', !!benzine, benzine ? String(benzine.selling_price) : 'missing')
  const unitPrice = Number(benzine.selling_price)

  // ---------- fresh shift ----------
  const uniqueName = 'مناوبة تسوية ' + Date.now()
  const shRes = await apiPost(page, 'shifts/', {
    station: ST, shift_name: uniqueName, date: today,
    start_time: '08:00', end_time: '16:00',
  })
  const shift = shRes.__status ? null : shRes
  step('API: create shift', !!shift, shift ? shift.name : 'http=' + (shRes.__status || '?'))
  const SH = shift.name

  // activate → seed reading + collections → close
  const tok = (await page.evaluate(async () => (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token))
  const put = (body) => page.evaluate(async ({ sh, body, tok }) => {
    const r = await fetch('/api/shifts/' + sh + '/', { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': tok }, body: JSON.stringify(body) })
    return r.status
  }, { sh: SH, body, tok })

  step('API: activate shift (scheduled → open)', (await put({ status: 'open' })) === 200)
  const r1 = await apiPost(page, 'meter-readings/', { shift: SH, meter: METER, start_reading: start, end_reading: end })
  step('API: seed meter reading (500 L)', !r1.__status || r1.__status === 200, 'http=' + (r1.__status || 200))

  const cats = (await apiGet(page, 'voucher-categories/')).results || []
  const cat = cats[0]
  const c1 = await apiPost(page, 'cash-collections/', { shift: SH, amount: 5000, time: new Date().toISOString().slice(0, 19) })
  const v1 = cat ? await apiPost(page, 'vouchers/', { shift: SH, category: cat.name, count: 2 }) : { __status: 0 }
  const p1 = await apiPost(page, 'pos-records/', { shift: SH, total_amount: 300, transaction_count: 1 })
  step('API: seed cash 5000 / vouchers 2×' + (cat ? cat.value : '?') + ' / POS 300',
    (c1.__status || 200) === 200 && (v1.__status || 200) === 200 && (p1.__status || 200) === 200,
    `cash=${c1.__status || 200} voucher=${v1.__status || 200} pos=${p1.__status || 200}`)
  const expectedCollected = 5000 + 2 * Number(cat ? cat.value : 0) + 300

  step('API: close shift (close endpoint works — old crash fixed)', (await put({ status: 'submitted' })) === 200)
  const closeRes = await apiPost(page, `shifts/${SH}/close/`)
  step('API: close endpoint returns ok', (closeRes.__status || 200) === 200, 'http=' + (closeRes.__status || 200))

  // ---------- reconciliation invariant checks ----------
  const recons = (await apiGet(page, 'reconciliations/')).results || []
  const recon = recons.find(r => String(r.shift) === SH)
  step('API: reconciliation auto-created on close', !!recon)
  if (recon) {
    const expectedSales = 500 * unitPrice
    step('API: expected_sales = liters × frozen price (500 × ' + unitPrice + ')',
      Number(recon.expected_sales) === expectedSales, 'got ' + recon.expected_sales + ' want ' + expectedSales)
    step('API: total_collection = cash + vouchers + POS',
      Number(recon.total_collection) === expectedCollected,
      'got ' + recon.total_collection + ' want ' + expectedCollected)
    step('API: difference = collection − expected_sales',
      Number(recon.difference) === expectedCollected - expectedSales,
      'got ' + recon.difference)
    step('API: net_cash = cash − expenses (expenses honored, old bug fixed)',
      Number(recon.net_cash) === Number(recon.total_cash) - Number(recon.total_expenses),
      JSON.stringify({ net: recon.net_cash, cash: recon.total_cash, exp: recon.total_expenses }))
  }

  // ---------- UI checks ----------
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(1000)
  const detailText = await page.locator('body').innerText()
  step('UI: shift detail shows reconciliation block', detailText.includes('التسوية المالية'))
  await shot(page, '18-shift-with-recon')

  await nav(page, 'finance/reconciliations')
  await page.waitForTimeout(800)
  step('UI: reconciliation list renders shift', (await page.locator('body').innerText()).includes(uniqueName))
  await shot(page, '19-recon-list')
  if (recon) {
    await nav(page, `finance/reconciliations/${recon.name}`)
    await page.waitForTimeout(800)
    step('UI: reconciliation detail renders numbers', (await page.locator('body').innerText()).length > 200)
    await shot(page, '19b-recon-detail')
  }

  // daily-sales must equal the sum of ALL today's collections (whatever other
  // tests seeded today) — a true aggregation check, independent of ordering.
  const ds = await page.evaluate(async (d) => {
    const r = await fetch('/api/reports/daily-sales/?date=' + d, { credentials: 'include' })
    return (await r.json()).message || {}
  }, today)
  const allCash = ((await apiGet(page, 'cash-collections/?limit_page_length=0')).results || [])
    .reduce((s, c) => s + Number(c.amount), 0) // endpoint returns today's rows? no — all; filtered below
  // precise: sum via per-shift totals only for today's shifts
  const todaysShifts = ((await apiGet(page, `shifts/?date=${today}&limit_page_length=0`)).results || []).map(s => s.name)
  const sumFor = (rows, key) => rows.filter(r => todaysShifts.includes(String(r.shift))).reduce((s, r) => s + Number(r[key] ?? r[key === 'amount' ? 'amount' : key === 'total_value' ? 'total_value' : 'total_amount']), 0)
  const cashSum = sumFor((await apiGet(page, 'cash-collections/?limit_page_length=0')).results || [], 'amount')
  const voucherSum = sumFor((await apiGet(page, 'vouchers/?limit_page_length=0')).results || [], 'total_value')
  const posSum = sumFor((await apiGet(page, 'pos-records/?limit_page_length=0')).results || [], 'total_amount')
  step('API: daily-sales cash = Σ today\'s cash', Number(ds.cash_sales) === cashSum, `got ${ds.cash_sales} want ${cashSum}`)
  step('API: daily-sales coupons = Σ today\'s vouchers', Number(ds.coupon_sales) === voucherSum, `got ${ds.coupon_sales} want ${voucherSum}`)
  step('API: daily-sales POS = Σ today\'s POS', Number(ds.epayment_sales) === posSum, `got ${ds.epayment_sales} want ${posSum}`)
  await nav(page, 'finance/daily-sales')
  await page.waitForTimeout(800)
  step('UI: daily-sales page renders totals', (await page.locator('body').innerText()).includes('إجمالي'))

  console.log('\nSHIFT ID:', SH)
  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
