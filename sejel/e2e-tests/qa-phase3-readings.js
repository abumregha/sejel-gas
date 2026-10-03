// PHASE 3 — Pump readings workflow + edge cases (QA prompt §13–§14).
//
// Part A (pilot "محطة تجريبية — سجل", pristine meters):
//   M01A=3,280,418  M01B=3,077,096  M02A=27,546,777  M02B=0
//   - validation UX only (huge/decimal/non-numeric/empty — nothing saved)
//   - live liters preview, zero-movement, negative→exception block
//   - save 4 good readings: 3,288,641 (8,223 L) / 3,085,676 (8,580 L) / 0 / 0
//   - duplicate-submit (fast double click), reload persistence, disabled inputs
//   - backend cross-check via dashboard-station payload
//
// Part B (throwaway "QA Edge Station" — destructive saves live here):
//   - exception save (negative → تصفير العداد + reason) persists as exception
//   - huge value save → expect 417 Arabic message (Part-1 _humanize regression)
//   - decimal reading save
//   - teardown attempt (expected: audit block once readings exist — record)
const fs = require('fs')
const { appendRun, capture, uiLogin, bodyText, defect, shot, step, summary, launch, apiGet, qaDelete } = require('./qa')

const BASE2 = 'http://localhost:8004'
const PILOT = 'محطة تجريبية — سجل'
const EDGE = 'QA Edge Station'

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await page.setViewportSize({ width: 1366, height: 768 })
  step('owner login', await uiLogin(page, 'owner@sejel.ly', 'owner123'))
  await page.waitForTimeout(600)

  // ---------- open readings, pick pilot ----------
  await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const stationSel = page.locator('[data-testid="readings-station"]')
  step('Readings station picker visible for manager', await stationSel.isVisible())
  const opts = await stationSel.locator('option').allTextContents()
  const pidx = opts.findIndex((t) => t.includes(PILOT))
  if (pidx >= 0) await stationSel.selectOption({ index: pidx })
  await page.waitForTimeout(1500)

  // QA-2 complement: the readings screen SHOULD show the 11:00 cycle
  const period = await page.locator('[data-testid="reading-period"]').innerText().catch(() => '')
  step('Reading period chip shows 11:00 cycle (readings screen)', period.includes('11:00'), period.replace(/\n/g, ' '))
  if (!period.includes('11:00')) appendRun('QA-2 complement', 'readings screen period chip: "' + period + '"')

  // ---------- gun cards + auto previous readings ----------
  const inputs = page.locator('[data-testid="gun-current-input"]')
  const nGuns = await inputs.count()
  const gunIdx = {} // meter code → input index
  const prevs = {}
  for (let i = 0; i < nGuns; i++) {
    const card = inputs.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    const code = (await card.locator('b').first().innerText()).trim()
    gunIdx[code] = i
    const prevTxt = await card.locator('div.bg-gray-50 b').first().innerText()
    prevs[code] = prevTxt.replace(/[^\d.]/g, '')
  }
  appendRun('Pilot guns (auto previous readings)', nGuns + ' guns: ' + JSON.stringify(prevs))
  step('4 guns listed on pilot', nGuns === 4, Object.keys(gunIdx).join(','))
  step('M01A previous auto-retrieved = 3,280,418', prevs['M01A'] === '3280418', prevs['M01A'])
  step('M01B previous auto-retrieved = 3,077,096', prevs['M01B'] === '3077096', prevs['M01B'])
  step('M02A previous auto-retrieved = 27,546,777', prevs['M02A'] === '27546777', prevs['M02A'])
  step('M02B previous auto-retrieved = 0', prevs['M02B'] === '0', prevs['M02B'])

  // unit suffix + Libyan format are part of the acceptance criteria
  const unitLabel = await bodyText(page)
  step('Gun input carries لتر unit suffix/label', unitLabel.includes('القراءة الحالية (لتر)'))

  // ---------- empty state: save disabled ----------
  step('Save disabled with no entries', await page.locator('[data-testid="save-readings"]').isDisabled())

  // ---------- validation UX (nothing saved) ----------
  const inp = (code) => inputs.nth(gunIdx[code])
  // huge value — client accepts, preview renders (no crash)
  await inp('M01A').fill('999999999999')
  await page.waitForTimeout(300)
  const hugeCard = await inp('M01A').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').innerText()
  step('Huge input renders live preview without crash', /999/.test(hugeCard.replace(/\s/g, '')))
  await inp('M01A').fill('')
  // decimal — accepted by input (step 0.001)
  await inp('M01A').fill('3288641.5')
  await page.waitForTimeout(300)
  const decCard = await inp('M01A').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').innerText()
  step('Decimal input accepted with fractional liters preview', /8,223\.5/.test(decCard.replace(/\n/g, ' ')), decCard.match(/= [^\n]*لتر مباعة/)?.[0] || '')
  await inp('M01A').fill('')
  // non-numeric — browser number input strips letters
  let nonNumeric = ''
  try { await inp('M01A').fill('abc', { timeout: 3000 }); nonNumeric = 'fill accepted' } catch (e) { nonNumeric = 'rejected by input' }
  const abcVal = await inp('M01A').inputValue().catch(() => '?')
  step('Non-numeric input cannot enter data', nonNumeric !== 'fill accepted' || abcVal === '', nonNumeric + ' value="' + abcVal + '"')
  await inp('M01A').fill('')

  // ---------- negative → exception required (M01B) ----------
  await inp('M01B').fill('3000000')
  await page.waitForTimeout(300)
  const negCard = await inp('M01B').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').innerText()
  step('Lower-than-previous reading flagged invalid (قراءة غير صالحة)', negCard.includes('قراءة غير صالحة'))
  step('Exception panel auto-opens with reason fields', negCard.includes('نوع الاستثناء') && negCard.includes('سبب الاستثناء'))
  step('Live liters shown negative in red', negCard.includes('-77,096') || /-\s?77,096/.test(negCard.replace(/\n/g, ' ')))
  await inp('M01B').fill('')

  // ---------- fill the 4 good readings ----------
  await inp('M01A').fill('3288641')
  await page.waitForTimeout(250)
  const lit = await inp('M01A').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').innerText()
  step('M01A live preview = 8,223 لتر (en-US grouping)', /8,223\s*لتر/.test(lit.replace(/\n/g, ' ')))
  await inp('M01B').fill('3085676')
  await inp('M02A').fill('27546777') // zero movement
  await page.waitForTimeout(250)
  const zeroCard = await inp('M02A').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]').innerText()
  step('Zero movement = 0 لتر, NOT flagged invalid', zeroCard.includes('0 لتر') && !zeroCard.includes('قراءة غير صالحة'))
  await inp('M02B').fill('0') // zero-counter gun, zero movement
  await page.waitForTimeout(250)

  // ---------- duplicate-submit: fast double click ----------
  const saveBtn = page.locator('[data-testid="save-readings"]')
  await saveBtn.click()
  await saveBtn.click({ force: true }).catch(() => {})
  await page.waitForTimeout(2500)
  const savedNotice = await bodyText(page)
  step('Save succeeded with success notice', savedNotice.includes('تم حفظ'), (savedNotice.match(/تم حفظ[^\n]*/) || ['?'])[0])

  // ---------- backend cross-check + duplicate detection ----------
  const dsh = await apiGet(page, 'dashboard-station/?station=f9sdreji1j&date=' + new Date().toISOString().slice(0, 10))
  const savedRows = []
  if (dsh && !dsh.__status) {
    for (const isl of dsh.islands || []) for (const mach of isl.machines || []) for (const m of mach.meters || [])
      if (m.reading) savedRows.push({ code: m.meter_code, id: m.id, start: m.reading.start_reading, end: m.reading.end_reading, liters: m.reading.liters_sold })
  }
  appendRun('Saved readings (backend payload)', JSON.stringify(savedRows, null, 1))
  const byCode = Object.fromEntries(savedRows.map((r) => [r.code, r]))
  step('M01A: 3,280,418 → 3,288,641 = 8,223 L', byCode['M01A'] && Number(byCode['M01A'].start) === 3280418 && Number(byCode['M01A'].end) === 3288641 && Number(byCode['M01A'].liters) === 8223, JSON.stringify(byCode['M01A'] || {}))
  step('M01B: 3,077,096 → 3,085,676 = 8,580 L', byCode['M01B'] && Number(byCode['M01B'].liters) === 8580, JSON.stringify(byCode['M01B'] || {}))
  step('M02A zero movement saved as 0 L', byCode['M02A'] && Number(byCode['M02A'].liters) === 0, '')
  step('M02B zero movement saved as 0 L', byCode['M02B'] && Number(byCode['M02B'].liters) === 0, '')

  // duplicates? count raw meter-readings per meter id
  let dup = []
  for (const r of savedRows) {
    const list = ((await apiGet(page, 'meter-readings/?meter=' + r.id)).results) || []
    const todays = list.filter((x) => (x.recorded_at || '').slice(0, 10) === new Date().toISOString().slice(0, 10))
    if (todays.length > 1) dup.push(r.code + '×' + todays.length)
  }
  step('Double-click save did NOT duplicate readings', dup.length === 0, dup.join(', ') || 'no duplicates')
  if (dup.length) {
    defect({ id: 'QA-7', severity: 'P2', area: 'Readings — duplicate submit', repro: 'Fill readings → click save twice rapidly', expected: 'One reading per gun per day', actual: 'Duplicate Meter Reading rows created: ' + dup.join(', '), evidence: 'meter-readings/?meter=… counts in run log' })
    // cleanup duplicates (keep the earliest)
    for (const r of savedRows) {
      const list = ((await apiGet(page, 'meter-readings/?meter=' + r.id)).results) || []
      const todays = list.filter((x) => (x.recorded_at || '').slice(0, 10) === new Date().toISOString().slice(0, 10))
      for (const extra of todays.slice(1)) await qaDelete(page, 'meter-readings', extra.name)
    }
  }

  // ---------- reload: persistence + disabled inputs ----------
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  const reloaded = await bodyText(page)
  step('Readings persist after reload', reloaded.includes('8,223') || reloaded.includes('جميع القراءات مكتملة'))
  step('Progress: all 4 guns complete', reloaded.includes('جميع القراءات مكتملة') || /4\s*\/\s*4/.test(reloaded))
  step('Saved gun inputs are locked (disabled)', await page.locator('[data-testid="gun-current-input"]').first().isDisabled())
  step('Save button inert after save (no duplicate path)', await saveBtn.isDisabled().catch(() => true))
  await shot(page, 'qa-20-pilot-saved')

  appendRun('Console errors (phase 3 part A)', page.consoleErrors.length ? page.consoleErrors.map((e) => '- ' + e).join('\n') : '- none')

  // ============ PART B — QA Edge Station (destructive saves) ============
  await page.goto(BASE2 + '/app/stations/setup-wizard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const wizFill = async (label, value) => {
    const el = page.locator(`xpath=//label[normalize-space(.)='${label}']/following-sibling::*[1]`).first()
    await el.fill(String(value))
  }
  await wizFill('اسم المحطة *', EDGE)
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('input[type="number"]:visible').nth(0).fill('1')
  await page.locator('button', { hasText: 'التالي' }).first().click()
  await page.waitForTimeout(600)
  await page.locator('button', { hasText: 'إنشاء المحطة' }).click()
  await page.waitForTimeout(3500)
  step('Edge station created', (await bodyText(page)).includes('تم إنشاء المحطة بنجاح'))
  const edgeList = ((await apiGet(page, 'stations/?station_name=' + encodeURIComponent(EDGE))).results) || []
  const edge = edgeList[0]
  step('Edge station in backend', !!edge, edge && edge.name)

  if (edge) {
    await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
    await page.waitForTimeout(900)
    const sel2 = page.locator('[data-testid="readings-station"]')
    const o2 = await sel2.locator('option').allTextContents()
    const i2 = o2.findIndex((t) => t.includes(EDGE))
    if (i2 >= 0) await sel2.selectOption({ index: i2 })
    await page.waitForTimeout(1500)
    const eInputs = page.locator('[data-testid="gun-current-input"]')
    const eN = await eInputs.count()
    appendRun('Edge station guns', eN + ' guns')

    // exception SAVE path: negative reading with reason (prev=0 → any negative)
    if (eN) {
      await eInputs.nth(0).fill('-5')
      await page.waitForTimeout(300)
      const c1 = await eInputs.nth(0).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
      const selx = c1.locator('select')
      if (await selx.count()) {
        await selx.selectOption({ index: 1 }) // تصفير العداد
        await c1.locator('input[placeholder="اكتب السبب هنا"]').fill('اختبار استثناء QA')
        await page.locator('[data-testid="save-readings"]').click()
        await page.waitForTimeout(2500)
        const exBody = await bodyText(page)
        step('Exception reading saved (badge استثناء)', exBody.includes('استثناء'))
        const eDsh = await apiGet(page, 'dashboard-station/?station=' + edge.name + '&date=' + new Date().toISOString().slice(0, 10))
        let exType = null
        for (const isl of eDsh?.islands || []) for (const mach of isl.machines || []) for (const m of mach.meters || [])
          if (m.reading && m.reading.exception_type) exType = m.reading.exception_type
        step('Backend stored exception_type', exType === 'reset', 'type=' + exType)
        appendRun('Exception save (edge)', 'exception_type=' + exType)
      } else {
        step('Exception panel appeared for negative reading', false, 'no select found')
      }

      // huge value save — Part-1 regression: 417 with Arabic message, not bare 500
      if (eN > 1) {
        await eInputs.nth(1).fill('99999999999999999999')
        await page.waitForTimeout(300)
        await page.locator('[data-testid="save-readings"]').click()
        await page.waitForTimeout(2500)
        const hugeBody = await bodyText(page)
        const arabic417 = hugeBody.includes('كبيرة جداً') || hugeBody.includes('غير صالحة')
        step('Huge counter value → clear Arabic rejection (417), not silent error', arabic417, (hugeBody.match(/[^\\n]*(كبيرة|غير صالحة|خطأ)[^\\n]*/) || ['(no arabic error)'])[0].slice(0, 120))
        if (!arabic417 && hugeBody.includes('حدث خطأ')) defect({ id: 'QA-8', severity: 'P1', area: 'Huge reading value handling', repro: 'Enter 20-digit reading → save', expected: '417 with Arabic "value too large" message (Part-1 fix)', actual: 'Generic error shown', evidence: 'run log' })
        await eInputs.nth(1).fill('')
        // decimal save
        await eInputs.nth(1).fill('100.25')
        await page.waitForTimeout(300)
        await page.locator('[data-testid="save-readings"]').click()
        await page.waitForTimeout(2500)
        const decSaved = await bodyText(page)
        step('Decimal reading (100.25) accepted', decSaved.includes('تم حفظ'), '')
      }
      await shot(page, 'qa-21-edge-results')
    }

    // teardown: station with readings history — audit block expected
    const del1 = await qaDelete(page, 'stations', edge.name)
    appendRun('Edge station teardown', '- direct delete → ' + del1.status + (del1.ok ? ' (gone)' : ' (blocked: readings/shift history)'))
    if (!del1.ok) {
      // try full teardown order: readings → shift → station
      const mrs = ((await apiGet(page, 'meter-readings/')).results) || []
      const shiftIds = [...new Set(mrs.map((m) => m.shift).filter(Boolean))]
      for (const m of mrs) if ((await qaDelete(page, 'meter-readings', m.name)).ok) console.log('[teardown] reading removed', m.name)
      for (const s of shiftIds) { const r = await qaDelete(page, 'shifts', s); console.log('[teardown] shift', s, r.status) }
      const del2 = await qaDelete(page, 'stations', edge.name)
      step('Edge station removable after clearing history', !!del2.ok, 'direct=' + del1.status + ' after-clean=' + del2.status)
      if (!del2.ok) defect({ id: 'QA-9', severity: 'P3', area: 'Station teardown with operational history', repro: 'Delete a station that has readings/shifts', expected: 'Either guided teardown or clear instruction', actual: '417 named-blocker remains even after config cascade; operator must clear history via API', evidence: 'run log teardown section' })
    }
  }

  appendRun('Console errors (phase 3 part B)', page.consoleErrors.length ? page.consoleErrors.map((e) => '- ' + e).join('\n') : '- none')
  appendRun('Network ≥400 (phase 3)', page.netFails.length ? page.netFails.map((e) => '- ' + e).join('\n') : '- none')

  await browser.close()
  fs.writeFileSync(__dirname + '/qa-checkpoints/phase3-done.txt', new Date().toISOString())
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message.split('\n')[0], '\n', (e.stack || '').split('\n').slice(1, 4).join('\n')); process.exit(2) })
