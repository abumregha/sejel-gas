// DAILY-ENTRY PREVIOUS READING — the field the operator fills every day.
//
// The previous reading used to be a read-only label: a value recorded wrong on
// an earlier day flowed straight into today's start, and the only escape was
// booking an exception over it. It is now an editable input, pre-filled with
// the latest reading of THAT gun, and changing it corrects the previous day's
// reading (with a reason and an audit trail) before today's reading is booked
// against the corrected value.
//
// Isolation: disposable site only (QA_BASE=...:8007). The fixture is this
// script's own gun at the acceptance station and is removed by it.
const { appendRun, uiLogin, apiGet, apiPost, qaDelete, qaStationId, shot, step, summary, launch, BASE2 } = require('./qa')

const STATION = 'QA موظف جديد'
const GUN = 'QA01C'
const OPERATOR = 'qa.supervisor'
const OPERATOR_PWD = 'QaSupervisor#2026'

const DAY1 = '2026-10-08'
const DAY2 = '2026-10-09'
const DAY3 = '2026-10-10'

const END1 = 3500000
const WRONG_END = 35445662   // the mistyped value, like the live 10-07 M01A
const END3 = 35463742
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

async function readingRows(page) {
  const [readings, shifts, meters] = await Promise.all([
    apiGet(page, 'meter-readings/?limit_page_length=0'),
    apiGet(page, 'shifts/?limit_page_length=0'),
    apiGet(page, 'meters/?limit_page_length=0'),
  ])
  const shiftDate = new Map((shifts.results || []).map((s) => [s.name, { date: s.date, station: s.station, status: s.status }]))
  const meterCode = new Map((meters.results || []).map((m) => [m.name, m.meter_code]))
  return (readings.results || []).map((r) => {
    const sh = shiftDate.get(r.shift) || {}
    return {
      name: r.name, meter: r.meter, shift: r.shift, station: sh.station, date: sh.date,
      code: meterCode.get(r.meter), start: r.start_reading, end: r.end_reading,
      exc: r.exception_type, notes: r.notes, liters: r.liters_sold, recorded: r.recorded_at,
      modified: r.modified, modified_by: r.modified_by,
    }
  })
}

let _stationId = null
async function gunDays(page) {
  const all = await readingRows(page)
  return new Map(all.filter((r) => r.code === GUN && r.station === _stationId).map((r) => [r.date, r]))
}

;(async () => {
  appendRun('qa-daily-entry-previous', 'target=' + BASE2)
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
    await page.waitForTimeout(2400)
  }

  await enterReading(DAY1, END1)
  await enterReading(DAY2, WRONG_END)
  let days = await gunDays(page)
  step(`${DAY1} stored 0 -> ${END1}`, (days.get(DAY1) || {}).end === END1)
  step(`${DAY2} stored with the mistyped end ${WRONG_END}`,
    (days.get(DAY2) || {}).end === WRONG_END, days.get(DAY2) ? `${days.get(DAY2).start} -> ${days.get(DAY2).end}` : 'missing')

  // ---- the operator (supervisor) opens the daily entry for DAY3 ---------------
  const opCtx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, locale: 'ar' })
  const op = await opCtx.newPage()
  op.on('dialog', (d) => d.accept())
  await uiLogin(op, OPERATOR, OPERATOR_PWD)
  await op.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await op.waitForTimeout(1500)

  await openDay(op, DAY3)
  const card = await gunCard(op, GUN)
  if (!card) throw new Error(`gun ${GUN} is not listed on ${DAY3}`)

  // 1. the previous reading is an editable input, pre-filled with the gun's own
  //    latest reading — not a label, and not another gun's value.
  const prevInput = card.locator('[data-testid="prev-reading-input"]')
  step('the previous reading is an input, not a label', await prevInput.isVisible())
  const prefilled = await prevInput.inputValue()
  step('pre-filled with this gun\'s latest reading (35,445,662)',
    prefilled === String(WRONG_END), prefilled)
  step('the current reading input is still there',
    await card.locator('[data-testid="gun-current-input"]').isVisible())

  // 2. change ONLY the previous reading
  await prevInput.fill(String(FIXED_PREVIOUS))
  await op.waitForTimeout(1200)
  const adjustedBadge = card.locator('[data-testid="previous-adjusted"]')
  step('the card marks the previous value as adjusted', await adjustedBadge.isVisible())
  await shot(op, 'daily-entry-previous-adjusted')

  // the warning names the day that will be corrected
  const warning = await card.locator('[data-testid="gun-previous"]').innerText()
  step('the warning names the affected day', warning.includes(DAY2), warning.replace(/\s+/g, ' ').slice(0, 120))
  step('the warning shows old -> new', warning.includes('35,445,662') && warning.includes('3,545,662'))

  // 3. the reason the backend demands is collected inline
  const reasonType = card.locator('[data-testid="prev-correction-type"]')
  step('the correction reason type is offered', await reasonType.isVisible())
  const typeValue = await reasonType.inputValue()
  step('the type defaults to a correction (not a reset)', typeValue === 'correction', typeValue)
  await card.locator('[data-testid="prev-correction-notes"]').fill('تصحيح قراءة سابقة خاطئة — اختبار الانحدار')

  // 4. enter the current reading and save
  await card.locator('[data-testid="gun-current-input"]').fill(String(END3))
  await op.waitForTimeout(600)
  const litresPreview = await card.locator('text=لتر مباعة').first().isVisible().catch(() => false)
  step('the litres preview reacts to the corrected previous', litresPreview)
  await shot(op, 'daily-entry-previous-ready')
  await page.locator('[data-testid="save-readings"]').count() // no-op, keep admin page warm
  await op.locator('[data-testid="save-readings"]').click()
  await op.waitForTimeout(3500)

  // 5. persisted: the previous day's reading was corrected, today's chains on
  days = await gunDays(page)
  const d2 = days.get(DAY2)
  const d3 = days.get(DAY3)
  step('the previous day\'s reading was corrected (end = 3545662)',
    !!d2 && Number(d2.end) === FIXED_PREVIOUS, d2 ? `${d2.start} -> ${d2.end}` : 'missing')
  step('the correction carries its reason',
    !!d2 && d2.exc === 'correction' && !!d2.notes,
    d2 ? `type=${d2.exc || 'none'} notes=${d2.notes || 'none'}` : 'missing')
  const d2detail = d2 ? await apiGet(page, `meter-readings/${d2.name}/`) : null
  step('the correction is audited (who and when)',
    !!d2detail && !!d2detail.modified_by && !!d2detail.modified,
    d2detail ? `by=${d2detail.modified_by} at=${String(d2detail.modified).slice(0, 19)}` : 'missing')
  step('today\'s reading was booked against the corrected value',
    !!d3 && Number(d3.start) === FIXED_PREVIOUS && Number(d3.end) === END3,
    d3 ? `${d3.start} -> ${d3.end}` : 'missing')
  step('today\'s litres follow the corrected previous',
    !!d3 && Number(d3.liters) === END3 - FIXED_PREVIOUS,
    d3 ? `${d3.end} - ${d3.start} = ${d3.liters}` : 'missing')

  // 6. the chain closes: no unexplained break across the three days
  const all = await readingRows(page)
  const byMeter = new Map()
  for (const r of all) {
    if (!byMeter.has(r.meter)) byMeter.set(r.meter, [])
    byMeter.get(r.meter).push(r)
  }
  const breaks = []
  for (const list of byMeter.values()) {
    list.sort((a, b) => String(a.date).localeCompare(String(b.date))
      || String(a.recorded).localeCompare(String(b.recorded)))
    for (let i = 1; i < list.length; i++) {
      if (Number(list[i].start) !== Number(list[i - 1].end)) {
        breaks.push({ documented: !!(list[i - 1].exc || list[i].exc), at: list[i].date, code: list[i].code })
      }
    }
  }
  step('the chain has no unexplained breaks', breaks.every((b) => b.documented),
    `${all.length} readings · ${breaks.length} break(s): ` +
    (breaks.length ? breaks.map((b) => `${b.code}@${b.at}${b.documented ? ' (documented)' : ' (UNEXPLAINED)'}`).join(', ') : 'none'))

  // 7. the meter counter ends at today's reading, not the corrected previous
  const meters = await apiGet(page, 'meters/?limit_page_length=0')
  const gunMeter = (meters.results || []).find((m) => m.meter_code === GUN)
  step('the meter counter follows the latest day',
    !!gunMeter && Number(gunMeter.current_reading) === END3,
    gunMeter ? `counter=${gunMeter.current_reading}` : 'meter missing')

  // 8. the next day opens against today's end (the daily cycle continues)
  await openDay(op, '2026-10-11')
  const cardNext = await gunCard(op, GUN)
  if (cardNext) {
    const nextPrev = await cardNext.locator('[data-testid="prev-reading-input"]').inputValue()
    step('the next day pre-fills with today\'s end', nextPrev === String(END3), nextPrev)
  } else {
    step('the next day pre-fills with today\'s end', false, 'gun not listed on 2026-10-11')
  }
  await shot(op, 'daily-entry-previous-next-day')

  // 9. a reset/replacement is still its own workflow — the daily-entry
  //    correction never offers it, and the reading editor still does.
  //    (Back to the day whose reading is saved: the editor lives there.)
  await openDay(op, DAY3)
  const cardSaved = await gunCard(op, GUN)
  if (!cardSaved) throw new Error(`gun ${GUN} is not listed on ${DAY3}`)
  await closeEditor(op)
  await cardSaved.locator('[data-testid="reading-edit"]').click()
  await op.waitForTimeout(1500)
  const editorSelect = cardSaved.locator('[data-testid="reading-edit-exception-type"]')
  step('the reading editor still offers reset/replacement',
    await editorSelect.isVisible().catch(() => false))
  const editorOptions = await editorSelect.locator('option').allTextContents().catch(() => [])
  step('reset and replacement remain distinct options',
    editorOptions.some((o) => o.includes('تصفير')) && editorOptions.some((o) => o.includes('استبدال')),
    editorOptions.join(' | '))
  // the daily-entry correction select never offers a reset
  await openDay(op, '2026-10-11')
  const cardNext2 = await gunCard(op, GUN)
  const prevOptions = await cardNext2
    .locator('[data-testid="prev-correction-type"] option').allTextContents().catch(() => [])
  step('the daily-entry correction never offers a reset',
    !prevOptions.some((o) => o.includes('تصفير') || o.includes('استبدال')),
    prevOptions.join(' | '))

  // ---- cleanup ----------------------------------------------------------------
  for (const d of [DAY1, DAY2, DAY3]) {
    const row = (await gunDays(page)).get(d)
    if (row) await qaDelete(page, 'meter-readings', row.name)
  }
  const left = (await gunDays(page)).size
  step('fixture removed after the run', left === 0, `${left} row(s) left`)

  const failed = summary()
  await opCtx.close()
  await browser.close()
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
