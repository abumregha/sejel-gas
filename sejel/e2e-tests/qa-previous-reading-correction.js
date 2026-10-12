// PREVIOUS-READING CORRECTION — the value a wrong day leaves behind.
//
// A mistyped end reading poisons the next day's «القراءة السابقة»: it is
// displayed, it is wrong, and the only escape was booking a 0-litre exception
// over it. Reported on the live site 2026-10-10 by the station's supervisor.
//
// Two things were wrong with the screen:
//   1. the previous value was a static label, editable only while it was still
//      0 (the opening-baseline case), so an inherited wrong number could not be
//      corrected at all;
//   2. the correction was gated behind canCloseDay (admin/manager/finance) even
//      though all four roles hold Meter Reading write — the supervisor who
//      types the readings never saw the affordance.
//
// This suite enters readings as admin, then corrects the WRONG previous value
// as the SUPERVISOR role: the affordance must exist, the value must be a real
// text box, the reason the backend demands must be collectable inline, and the
// result must persist with the day's litres recomputed.
//
// Isolation: disposable site only (QA_BASE=...:8007). The fixture is this
// script's own gun at the acceptance station and is removed by it.
const { appendRun, uiLogin, apiGet, apiPost, qaDelete, qaStationId, shot, step, summary, launch, BASE2 } = require('./qa')

const STATION = 'QA موظف جديد'
const GUN = 'QA01C'
const SUPERVISOR = 'qa.supervisor'
const SUPERVISOR_PWD = 'QaSupervisor#2026'

const DAY1 = '2026-10-08'
const DAY2 = '2026-10-09'
const DAY3 = '2026-10-10'

// Day 2 is mistyped with an extra digit — the live case (10-07 M01A ended
// 35,445,662 for a true value near 3,545,662). Day 3 inherits it as its
// previous reading, which is the value the operator has to correct.
const END1 = 3500000
const WRONG_END = 35445662
const END3 = 35463742
// What the previous value should have been.
const FIXED_PREVIOUS = 3545662

async function openDay(page, date) {
  await page.locator('[data-testid="readings-date"]').fill(date)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2600)
}

async function closeEditor(page) {
  const cancel = page.locator('[data-testid="reading-edit-cancel"]')
  if (await cancel.count()) {
    await cancel.first().click()
    await page.waitForTimeout(900)
  }
}

async function gunCard(page, code) {
  const codes = page.locator('[data-testid="gun-code"]')
  const n = await codes.count()
  for (let i = 0; i < n; i++) {
    if ((await codes.nth(i).innerText()).trim() === code) {
      return codes.nth(i).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]')
    }
  }
  return null
}

// Readings joined with shift date and meter code (the list API carries the
// shift id, not the date).
async function readingRows(page) {
  const [readings, shifts, meters] = await Promise.all([
    apiGet(page, 'meter-readings/?limit_page_length=0'),
    apiGet(page, 'shifts/?limit_page_length=0'),
    apiGet(page, 'meters/?limit_page_length=0'),
  ])
  const shiftDate = new Map((shifts.results || []).map((s) => [s.name, { date: s.date, station: s.station }]))
  const meterCode = new Map((meters.results || []).map((m) => [m.name, m.meter_code]))
  return (readings.results || []).map((r) => {
    const sh = shiftDate.get(r.shift) || {}
    return {
      name: r.name, meter: r.meter, shift: r.shift, station: sh.station, date: sh.date,
      code: meterCode.get(r.meter), start: r.start_reading, end: r.end_reading,
      exc: r.exception_type, notes: r.notes, liters: r.liters_sold, recorded: r.recorded_at,
    }
  })
}

let _stationId = null
async function gunDays(page) {
  const all = await readingRows(page)
  return new Map(all.filter((r) => r.code === GUN && r.station === _stationId).map((r) => [r.date, r]))
}

;(async () => {
  appendRun('qa-previous-reading-correction', 'target=' + BASE2)
  const { browser, page } = await launch({ viewport: { width: 1500, height: 1000 } })
  page.on('dialog', (d) => d.accept())

  // ---- fixture -----------------------------------------------------------------
  await uiLogin(page, 'administrator', 'QaBrowserTest#2026')
  const stations = await apiGet(page, 'stations/?limit_page_length=0')
  const names = (stations.results || []).map((s) => s.station_name)
  step('target is the disposable site (customer station absent)',
    !names.includes('محطة الراحلة 23'), `${names.length} stations: ${names.slice(0, 4).join(' | ')}`)

  _stationId = await qaStationId(page, STATION)
  step('acceptance station present', !!_stationId, _stationId || 'missing')

  {
    const days = await gunDays(page)
    let removed = 0
    for (const d of [DAY1, DAY2, DAY3]) {
      const row = days.get(d)
      if (row) { await qaDelete(page, 'meter-readings', row.name); removed++ }
    }
    step('fixture reset', true, `${removed} existing row(s) removed`)
  }

  await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.locator('[data-testid="readings-station"]').selectOption({ label: STATION })
  await page.waitForTimeout(1800)

  async function enterReading(date, value) {
    await openDay(page, date)
    await closeEditor(page)
    const card = await gunCard(page, GUN)
    if (!card) throw new Error(`gun ${GUN} is not listed on ${date}`)
    await card.locator('[data-testid="gun-current-input"]').fill(String(value))
    await page.locator('[data-testid="save-readings"]').click()
    await page.waitForSelector('[data-testid="save-bar-notice"]', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2400)
  }

  await enterReading(DAY1, END1)
  await enterReading(DAY2, WRONG_END)
  await enterReading(DAY3, END3)

  let days = await gunDays(page)
  const d1 = days.get(DAY1)
  const d2 = days.get(DAY2)
  const d3 = days.get(DAY3)
  step(`${DAY1} stored 0 -> ${END1}`, !!d1 && Number(d1.start) === 0 && Number(d1.end) === END1)
  step(`${DAY2} stored with the mistyped end ${WRONG_END}`,
    !!d2 && Number(d2.end) === WRONG_END, d2 ? `${d2.start} -> ${d2.end}` : 'missing')
  step(`${DAY3} inherited that wrong value as its previous reading`,
    !!d3 && Number(d3.start) === WRONG_END && Number(d3.end) === END3,
    d3 ? `${d3.start} -> ${d3.end}` : 'missing')

  // ---- as the SUPERVISOR: the role that reported the problem --------------------
  // A fresh context, like a second browser: the role under test is the one that
  // reported the problem, and its fixes must work for that role specifically.
  const supCtx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, locale: 'ar' })
  const sup = await supCtx.newPage()
  sup.on('dialog', (d) => d.accept())
  await uiLogin(sup, SUPERVISOR, SUPERVISOR_PWD)

  await sup.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await sup.waitForTimeout(1500)

  await openDay(sup, DAY3)
  const card3 = await gunCard(sup, GUN)
  if (!card3) throw new Error(`gun ${GUN} is not listed on ${DAY3} for the supervisor`)
  step('the supervisor sees their station\'s guns', true, `${GUN} listed on ${DAY3}`)

  // The value the operator has to correct is shown as a label.
  const shownPrevious = await card3.locator('[data-testid="previous-reading-value"]').innerText()
  step('the wrong previous reading is displayed', shownPrevious.replace(/[^\d]/g, '') === String(WRONG_END),
    shownPrevious)

  // The affordance must exist for this role — it used to be hidden here.
  const fixButton = card3.locator('[data-testid="prev-fix"]')
  const fixVisible = await fixButton.isVisible()
  step('supervisor is offered the correction of the previous reading', fixVisible)

  await shot(sup, 'previous-reading-correction-offered')
  if (!fixVisible) {
    summary()
    await supCtx.close()
    await browser.close()
    process.exit(1)
  }

  await fixButton.click()
  await page.waitForSelector('[data-testid="prev-edit-input"]', { timeout: 10000 }).catch(() => {})

  // It is a real text box, pre-filled with the stored value.
  const input = card3.locator('[data-testid="prev-edit-input"]')
  const inputVisible = await input.isVisible()
  step('the previous reading becomes an editable text box', inputVisible)
  const prefilled = await input.inputValue()
  step('the text box is pre-filled with the stored value',
    prefilled === String(WRONG_END), prefilled)

  // The reason the backend demands can be given inline.
  const reasonSelect = card3.locator('[data-testid="prev-edit-exception-type"]')
  step('the correction carries the reason the backend requires',
    await reasonSelect.isVisible())
  await shot(sup, 'previous-reading-correction-open')

  // ---- correct the value --------------------------------------------------------
  await input.fill(String(FIXED_PREVIOUS))
  await card3.locator('[data-testid="prev-edit-exception-type"]').selectOption('other')
  await card3.locator('[data-testid="prev-edit-exception-notes"]').fill('تصحيح قيمة سابقة خاطئة — اختبار')
  await card3.locator('[data-testid="prev-edit-save"]').click()
  await page.waitForSelector('[data-testid="save-bar-notice"]', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2600)
  await shot(sup, 'previous-reading-correction-after')

  days = await gunDays(page)
  const fixed = days.get(DAY3)
  step('the correction persisted (previous = 3545662)',
    !!fixed && Number(fixed.start) === FIXED_PREVIOUS,
    fixed ? `${fixed.start} -> ${fixed.end}` : 'missing')
  step('the correction carries its reason',
    !!fixed && fixed.exc === 'other' && !!fixed.notes,
    fixed ? `type=${fixed.exc || 'none'} notes=${fixed.notes || 'none'}` : 'missing')
  step('the day\'s litres were recomputed against the corrected value',
    !!fixed && Number(fixed.liters) === END3 - FIXED_PREVIOUS,
    fixed ? `${fixed.end} - ${fixed.start} = ${fixed.liters}` : 'missing')

  // The wrong value must still be visible where it was typed, so the operator
  // can finish the job on that day — the correction does not travel upstream
  // by design (a day is never changed silently for another day).
  const stillWrong = days.get(DAY2)
  step('the source day keeps its value for its own correction',
    !!stillWrong && Number(stillWrong.end) === WRONG_END, stillWrong ? `end=${stillWrong.end}` : 'missing')

  // ---- and the current reading itself, through the reading editor ------------
  // Correcting the day where the value was typed is the other half of the
  // repair: with its own previous reading fixed, this one now chains on.
  await closeEditor(sup)
  const editButton = card3.locator('[data-testid="reading-edit"]')
  step('the supervisor can still open the reading editor', await editButton.isVisible())
  await editButton.click()
  await sup.waitForTimeout(1500)
  const endEditor = card3.locator('[data-testid="reading-edit-end"]')
  step('the editor opens with the saved current reading', await endEditor.isVisible())
  const endBefore = await endEditor.inputValue()
  // a real change, not a rewrite of the value already stored
  const CORRECTED_END = END3 + 500
  await endEditor.fill(String(CORRECTED_END))
  await sup.waitForTimeout(600)
  const editorImpact = await card3.locator('[data-testid="chain-impact"]').count()
  step('nothing follows this day, so no impact warning is shown', editorImpact === 0)
  // The day this reading continues from is still uncorrected, so that side of
  // the chain owes a reason — the same one the operator already used.
  await card3.locator('[data-testid="reading-edit-exception-type"]').selectOption('other')
  await card3.locator('[data-testid="reading-edit-exception-notes"]').fill('تصحيح القراءة الحالية — اختبار')
  await sup.waitForTimeout(400)
  await card3.locator('[data-testid="reading-edit-save"]').click()
  await sup.waitForTimeout(3500)
  const editorErrorAfter = await card3.locator('[data-testid="reading-edit-error"]').innerText().catch(() => '(none)')
  step('the editor save reported no error', editorErrorAfter === '(none)', editorErrorAfter.slice(0, 130))

  days = await gunDays(page)
  const correctedCurrent = days.get(DAY3)
  step('the supervisor corrected the current reading',
    !!correctedCurrent && Number(correctedCurrent.end) === CORRECTED_END,
    correctedCurrent ? `${correctedCurrent.start} -> ${correctedCurrent.end} (was ${endBefore})` : 'missing')
  step('the corrected reading recomputed its litres',
    !!correctedCurrent && Number(correctedCurrent.liters) === CORRECTED_END - FIXED_PREVIOUS,
    correctedCurrent ? `${correctedCurrent.end} - ${correctedCurrent.start} = ${correctedCurrent.liters}` : 'missing')

  // The repaired pair must now close on both sides: day 2's end is still wrong
  // (35,445,662), which is exactly the day the operator has to correct next —
  // the screen must keep offering it instead of hiding it.
  const day2Now = days.get(DAY2)
  step('the day the value came from still shows its wrong end', !!day2Now && Number(day2Now.end) === WRONG_END)

  // ---- cleanup ----------------------------------------------------------------
  // The supervisor may correct but not delete (Meter Reading delete=0 for that
  // role), so the fixture is torn down from the admin context.
  for (const d of [DAY1, DAY2, DAY3]) {
    const row = (await gunDays(page)).get(d)
    if (row) await qaDelete(page, 'meter-readings', row.name)
  }
  const left = (await gunDays(page)).size
  step('fixture removed after the run', left === 0, `${left} row(s) left`)

  const failed = summary()
  await supCtx.close()
  await browser.close()
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
