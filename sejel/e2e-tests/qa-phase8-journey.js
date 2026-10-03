// PHASE 8 — The headline question: can a station employee complete the full
// 11:00→11:00 cycle without Excel?
//
// Runs the journey end-to-end through the UI as the **station owner** (Sejel Manager),
// the role the real employee holds, on the QA-owned edge station:
//
//   0. set the station's daily close time to 11:00 (via API — the UI cannot do it, QA-30)
//   1. readings screen shows the 11:00 cycle
//   2. read and save a reading for every gun
//   3. record the day's income (cash + electronic)
//   4. close the day
//   5. verify the reconciliation against the expected arithmetic
//
// Every step is checked against the backend so a green UI cannot hide a lost write.
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, apiPost, qaFillField, qaResetStationDay, qaSeedCounters, qaStationMeterCodes } = require('./qa')

const BASE = 'http://localhost:8004'
const EDGE = 'QA Edge Station'
// The readings screen works on the CURRENT cycle, not on "today": after the
// station's 11:00 close the running cycle belongs to the next day. Derive it the
// same way the app does instead of hardcoding a date that goes stale.
function currentCycleDate(dayClose = '11:00') {
  const [h, m] = String(dayClose).split(':').map((n) => parseInt(n, 10) || 0)
  const now = new Date()
  const close = new Date(now); close.setHours(h, m, 0, 0)
  const d = new Date(now)
  if (now >= close) d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
let CYCLE_DATE = currentCycleDate('11:00')
const PRICE = 0.15                 // frozen unit price used by the backend

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await uiLogin(page, 'owner@sejel.ly', 'owner123')
  await page.goto(BASE + '/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)

  // ---------- step 0: the cycle time ----------
  const stations = await apiGet(page, 'stations/')
  const edge = (stations.results || []).find((s) => s.station_name === EDGE)
  appendRun('## Phase 8 — station setup', '\n- QA Edge Station id: ' + (edge && edge.name) +
    '\n- day_close_time before: ' + (edge && edge.day_close_time))
  if (edge && !String(edge.day_close_time || '').startsWith('11:00')) {
    const put = await page.evaluate(async (name) => {
      const me = await fetch('/api/auth/me/', { credentials: 'include' })
      const token = (await me.json()).message.csrf_token
      const r = await fetch('/api/stations/' + name + '/', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': token },
        body: JSON.stringify({ day_close_time: '11:00:00' }),
      })
      return { status: r.status, body: (await r.text()).slice(0, 200) }
    }, edge.name)
    const after = await apiGet(page, 'stations/' + edge.name + '/')
    step('day_close_time set to 11:00 (via API — no UI exists, QA-30)',
      String(after.day_close_time).startsWith('11:00'),
      `PUT ${put.status} → ${after.day_close_time}`)
    appendRun('## Phase 8 — station setup (after)',
      '\n- PUT status: ' + put.status +
      '\n- day_close_time: ' + after.day_close_time)
  }

  // ---------- replay guard ----------
  // This journey closes the day, so a previous run left the cycle's readings and
  // reconciliation behind. Clear that one station-day (admin session, scoped to
  // this station through its own meter tree) and re-seed every gun to the same
  // base counter, so the expected arithmetic below is deterministic.
  const p8Ctx = await browser.newContext()
  const p8Admin = await p8Ctx.newPage()
  await uiLogin(p8Admin, 'admin@sejel.ly', 'admin123')
  const p8cleared = await qaResetStationDay(p8Admin, EDGE, CYCLE_DATE)
  step('cleared the edge station cycle so the journey can repeat', p8cleared.ok,
    p8cleared.ok
      ? `${p8cleared.removed} reading(s), ${p8cleared.clearedShifts} day-close shift(s), ${p8cleared.leftAlone} left alone`
      : String(p8cleared.error || (p8cleared.problems || []).join(' · ')))
  const BASE_COUNTER = 100000
  const codes = await qaStationMeterCodes(p8Admin, EDGE)
  step('this station\'s own meter codes resolved', codes.length > 0, codes.join(', '))
  const specs = {}
  for (const c of codes) specs[c] = BASE_COUNTER
  const p8seed = await qaSeedCounters(p8Admin, EDGE, specs)
  step('every gun re-seeded to the same base counter',
    p8seed.ok && codes.length > 0 && !(p8seed.done || []).some((d) => /not found/.test(d)),
    (p8seed.done || []).join(', '))

  // ---------- step 1: readings screen shows the 11:00 cycle ----------
  await page.goto(BASE + '/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await page.locator('[data-testid="readings-station"]').selectOption({ label: EDGE }).catch(async () => {
    const sel = page.locator('select').first()
    await sel.evaluate((el, want) => {
      const o = Array.from(el.options).find((x) => x.textContent.trim() === want)
      if (o) { el.value = o.value; el.dispatchEvent(new Event('change', { bubbles: true })) }
    }, EDGE)
  })
  await page.waitForTimeout(1200)
  await page.locator('[data-testid="readings-date"]').fill(CYCLE_DATE)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2000)

  let body = (await bodyText(page)).replace(/\s+/g, ' ')
  const periodChip = page.locator('[data-testid="reading-period"]')
  const chip = (await periodChip.count()) ? (await periodChip.first().innerText()).replace(/\s+/g, ' ') : '(no period chip)'
  step('readings screen shows the 11:00 cycle', /11:00/.test(body) || /11:00/.test(chip), chip)
  appendRun('## Phase 8 — readings screen, cycle label',
    '- period chip: ' + chip +
    '\n- body mentions 11:00: ' + /11:00/.test(body) +
    '\n- text: ' + JSON.stringify(body.slice(body.indexOf('رجوع'), body.indexOf('رجوع') + 700)))
  await shot(page, 'qa-phase8-1-readings')

  // ---------- step 2: read every gun ----------
  const inputs = page.locator('[data-testid="gun-current-input"]')
  const guns = await inputs.count()
  step('guns listed for the station', guns > 0, guns + ' guns')
  // Read each gun's previous counter from its own element, in the same order as
  // the inputs. Scraping the whole card and taking the FIRST number matched
  // "مضخة 4" (pump 4), so every gun was filled with 1,004 against a counter above
  // 100,000 — a reading the backend rightly refused, which then looked like a
  // save failure.
  const prevTexts = await page.evaluate(() => [...document.querySelectorAll('[data-testid="gun-previous"]')]
    .map((el) => el.innerText.replace(/\s+/g, ' ')))
  if (prevTexts.length !== guns) {
    throw new Error('expected one previous-reading box per gun, got ' + prevTexts.length + ' for ' + guns + ' guns')
  }
  const prevValues = []
  for (let i = 0; i < guns; i++) {
    const m = prevTexts[i].match(/([\d,]+(?:\.\d+)?)/)
    if (!m) throw new Error('could not read the previous counter for gun ' + i + ': ' + JSON.stringify(prevTexts[i]))
    const prev = parseFloat(m[1].replace(/,/g, ''))
    prevValues.push(prev)
    // 1,000 L on every gun — a round, auditable movement
    await inputs.nth(i).fill(String(prev + 1000))
    await page.waitForTimeout(150)
  }
  const preview = (await bodyText(page)).replace(/\s+/g, ' ')
  step('liters preview updates as readings are typed', /لتر/.test(preview))
  appendRun('## Phase 8 — readings entered',
    `\n- guns: ${guns}, previous readings: ${JSON.stringify(prevValues)}` +
    `\n- entered: previous + 1,000 L on each gun` +
    `\n- total movement expected: ${(guns * 1000).toLocaleString('en-US')} L`)
  await shot(page, 'qa-phase8-2-readings-filled')

  await page.locator('[data-testid="save-readings"]').click()
  await page.waitForTimeout(3500)
  body = (await bodyText(page)).replace(/\s+/g, ' ')
  // Arabic plurals: 1 قراءة / N قراءات. Requiring the singular missed a
  // successful multi-reading save and reported QA-31 against a save that worked.
  const saved = /تم حفظ \d+ قراءات? بنجاح/.exec(body)
  step('all readings saved', !!saved, saved ? saved[0] : body.slice(-220))
  if (!saved) {
    defect({ id: 'QA-31', severity: 'P1', area: 'Readings — full-cycle save',
      repro: 'readings screen, QA Edge Station, 2026-10-04, every gun +1,000 L → حفظ',
      expected: '«تم حفظ N قراءة بنجاح» and all guns marked saved',
      actual: 'no success message; page tail: ' + body.slice(-220),
      evidence: 'phase 8 step 2' })
  }
  appendRun('## Phase 8 — readings save result', '\n- page tail: ' + JSON.stringify(body.slice(-320)))
  await shot(page, 'qa-phase8-3-readings-saved')

  // backend cross-check
  const stationReadings = await apiGet(page, 'meter-readings/?station=' + edge.name)
  const savedList = stationReadings.results || []
  appendRun('## Phase 8 — readings backend cross-check',
    '\n- readings stored for the station: ' + savedList.length)

  // ---------- step 3: the day's income ----------
  await page.goto(BASE + '/finance/income', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2000)
  const before400 = page.netFails.length
  await qaFillField(page, 'المحطة', EDGE)
  await page.waitForTimeout(1000)
  // pick the day-close shift created by the readings save
  const shiftSel = page.locator('select').nth(1)
  const shiftOpts = await shiftSel.locator('option').allTextContents()
  appendRun('## Phase 8 — income entry shift options', '\n- ' + JSON.stringify(shiftOpts))
  const dayCloseIdx = shiftOpts.findIndex((t) => /إقفال/.test(t))
  if (dayCloseIdx >= 0) {
    await shiftSel.evaluate((el, i) => { el.selectedIndex = i; el.dispatchEvent(new Event('change', { bubbles: true })) }, dayCloseIdx)
    await page.waitForTimeout(800)
  }
  const CASH = (guns * 1000 * PRICE).toFixed(2)   // full collection, no shortage
  const COUPONS = 40
  // Fill by LABEL inside its own card. Taking the first numeric input on the page
  // filled nothing usable, and the success check matched the save BUTTON'S OWN
  // LABEL, so this step passed while recording nothing at all.
  const card = (h3) => page.locator(`xpath=//h3[normalize-space(.)='${h3}']/parent::div`).first()
  const byLabel = (label, scope) =>
    (scope || page).locator(`xpath=//label[normalize-space(.)='${label}']/following-sibling::*[1]`).first()
  await byLabel('المبلغ (د.ل)', card('المبيعات النقدية')).fill(CASH)
  await byLabel('5 د.ل').fill(String(COUPONS / 5))
  await byLabel('8 د.ل').fill('0')
  await page.locator('[data-testid="epayment-count"]').fill('1')
  await page.waitForTimeout(600)
  const incomeBody = (await bodyText(page)).replace(/\s+/g, ' ')
  const liveTotal = (incomeBody.match(/إجمالي الإيرادات\s*([\d,.]+)/) || [])[1] || ''
  step('live revenue total matches cash + coupons before saving',
    liveTotal.replace(/,/g, '').startsWith(String(Number(CASH) + COUPONS)),
    `shown=${liveTotal} expected=${Number(CASH) + COUPONS}`)

  const saveIncome = page.locator('[data-testid="save-income"]').first()
  await saveIncome.click()
  await page.waitForTimeout(3000)
  body = (await bodyText(page)).replace(/\s+/g, ' ')
  step('income entry reports success', /تم الحفظ بنجاح/.test(body),
    (body.match(/تم [^\n]{0,60}/) || [body.slice(-200)])[0])
  const incomeFails = page.netFails.slice(before400)
  appendRun('## Phase 8 — income entry result',
    '\n- page tail: ' + JSON.stringify(body.slice(-260)) +
    '\n- network ≥400: ' + (incomeFails.join(', ') || '(none)'))
  await shot(page, 'qa-phase8-4-income')

  // A green screen is not proof the money was recorded — check the backend.
  const cashRows = await apiGet(page, 'cash-collections/?station=' + edge.name + '&limit_page_length=0')
  const cashSum = ((cashRows && cashRows.results) || []).reduce((a, r) => a + Number(r.amount || 0), 0)
  step('the declared cash actually reached the backend', Math.abs(cashSum - Number(CASH)) < 0.02,
    `cash total=${cashSum} expected=${CASH}`)
  const vouRows = await apiGet(page, 'vouchers/?station=' + edge.name + '&limit_page_length=0')
  const vouSum = ((vouRows && vouRows.results) || []).reduce((a, r) => a + Number(r.total_value || 0), 0)
  step('the coupons actually reached the backend', Math.abs(vouSum - COUPONS) < 0.02,
    `voucher total=${vouSum} expected=${COUPONS}`)
  appendRun('## Phase 8 — income postings stored',
    '\n- cash: ' + cashSum + ' (expected ' + CASH + '), vouchers: ' + vouSum + ' (expected ' + COUPONS + ')')

  // ---------- step 4: close the day ----------
  await page.goto(BASE + '/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await page.locator('[data-testid="readings-station"]').selectOption({ label: EDGE }).catch(() => {})
  await page.waitForTimeout(1000)
  await page.locator('[data-testid="readings-date"]').fill(CYCLE_DATE)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2000)
  const closeBtn = page.locator('[data-testid="close-day"]')
  const closeDisabled = await closeBtn.isDisabled()
  step('close-day button enabled after readings are saved', !closeDisabled, closeDisabled ? 'disabled' : 'enabled')
  await closeBtn.click()
  await page.waitForTimeout(4000)
  body = (await bodyText(page)).replace(/\s+/g, ' ')
  const closedMsg = /تم إقفال اليوم وإنشاء التسوية المالية بنجاح/.test(body)
  step('day closed with the success message', closedMsg, closedMsg ? 'success message shown' : body.slice(-240))
  appendRun('## Phase 8 — day close',
    '\n- close button disabled: ' + closeDisabled +
    '\n- success message: ' + closedMsg +
    '\n- page tail: ' + JSON.stringify(body.slice(-300)))
  await shot(page, 'qa-phase8-5-closed')

  // ---------- step 5: the numbers ----------
  const recs = await apiGet(page, 'reconciliations/')
  const all = recs.results || []
  const rec = all.find((r) => r.station === edge.name && String(r.name))
  appendRun('## Phase 8 — reconciliations after the cycle',
    '\n```\n' + JSON.stringify(all.slice(0, 4), null, 1).slice(0, 1200) + '\n```')
  const shifts = await apiGet(page, 'shifts/')
  const shiftRows = (shifts.results || []).filter((s) => s.station === edge.name)
  appendRun('## Phase 8 — edge station shifts',
    '\n```\n' + JSON.stringify(shiftRows.slice(0, 5), null, 1).slice(0, 900) + '\n```')

  const totals = guns * 1000
  step('reconciliation litres match the entered movement',
    !!rec && Math.abs(rec.total_liters - totals) < 0.01,
    rec ? `${rec.total_liters} vs ${totals} expected` : 'no reconciliation for the station')

  appendRun('## Phase 8 — verdict inputs',
    `\n- guns read: ${guns}, litres entered: ${totals}` +
    `\n- expected sales at ${PRICE}: ${(totals * PRICE).toFixed(2)}` +
    `\n- cash declared: ${CASH}` +
    `\n- reconciliation: ${rec ? JSON.stringify(rec) : 'none'}`)

  appendRun('## Phase 8 — network ≥400 (all)',
    (page.netFails || []).slice(0, 40).map((x) => '- ' + x).join('\n') || '(none)')

  summary('qa-phase8-journey')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })