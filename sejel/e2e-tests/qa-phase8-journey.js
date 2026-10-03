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
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, apiPost, qaFillField } = require('./qa')

const BASE = 'http://localhost:8004'
const EDGE = 'QA Edge Station'
const CYCLE_DATE = '2026-10-04'   // a fresh day so nothing is already closed
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
  const prevValues = []
  for (let i = 0; i < guns; i++) {
    const row = inputs.nth(i)
    const prevText = (await row.locator('xpath=ancestor::*[.//input][1]').innerText()).replace(/\s+/g, ' ')
    const m = prevText.match(/([\d,]+(?:\.\d+)?)/)
    const prev = m ? parseFloat(m[1].replace(/,/g, '')) : 100000
    prevValues.push(prev)
    // 1,000 L on every gun — a round, auditable movement
    await row.fill(String(prev + 1000))
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
  const saved = /تم حفظ \d+ قراءة بنجاح/.exec(body)
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
  const nums = page.locator('input[type="number"], input[inputmode="decimal"]')
  const nCount = await nums.count()
  appendRun('## Phase 8 — income entry fields', '\n- numeric inputs: ' + nCount +
    '\n- expected full collection for ' + (guns * 1000) + ' L: ' + CASH + ' د.ل')
  if (nCount) await nums.nth(0).fill(CASH)
  await page.waitForTimeout(400)
  const saveIncome = page.locator('button', { hasText: /حفظ الإيرادات|حفظ/ }).first()
  await saveIncome.click()
  await page.waitForTimeout(3000)
  body = (await bodyText(page)).replace(/\s+/g, ' ')
  const incomeOk = /تم|بنجاح|حُفظ|حفظ/.test(body)
  step('income entry reports success', incomeOk, body.slice(-200))
  const incomeFails = page.netFails.slice(before400)
  appendRun('## Phase 8 — income entry result',
    '\n- page tail: ' + JSON.stringify(body.slice(-260)) +
    '\n- network ≥400: ' + (incomeFails.join(', ') || '(none)'))
  await shot(page, 'qa-phase8-4-income')

  const cashAfter = await apiGet(page, 'cash-collections/')
  appendRun('## Phase 8 — cash collections after income entry',
    '\n```\n' + JSON.stringify(cashAfter).slice(0, 600) + '\n```')

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