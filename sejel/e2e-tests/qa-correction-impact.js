// CORRECTION IMPACT — the day a correction is really about.
//
// A correction of an old reading does not stay local: it silently detaches the
// NEXT day's start value the moment it is saved, and the reconciliation built
// on it stops matching. The operator is therefore told BEFORE saving which day
// and which numbers a pending edit will disturb (browser acceptance test
// 2026-10-09).
//
// This suite proves that with the real numbers, not with the presence of a
// test id: it builds one gun's three consecutive days, edits the MIDDLE day,
// and asserts the warning names the next affected day and the discontinuity.
// A day with no successor must stay silent — a warning that always rendered
// would prove nothing.
//
// Isolation: run against the disposable site (QA_BASE=...:8007). The fixture is
// this script's own gun on the acceptance station and is removed by it.
const { appendRun, uiLogin, apiGet, apiPost, apiPut, qaDelete, qaStationId, shot, step, summary, launch, BASE2 } = require('./qa')

const STATION = 'QA موظف جديد'
const GUN = 'QA01C'

// Three consecutive days for one gun. Day 2 is the day that gets corrected, so
// Day 3 must exist: without a successor there is no impact to warn about.
const DAY1 = '2026-10-08' // opening: baseline, 0 L booked
const DAY2 = '2026-10-09' // the day that gets corrected
const DAY3 = '2026-10-10' // the day the correction disturbs

const END1 = 300000
const END2 = 301000
const END3 = 302000
// The correction must sit ABOVE the day's own start (300,000) so it is not a
// backwards counter, yet no longer equal the next day's start (301,000): the
// only thing it breaks is the chain, which is the case under test.
const CORRECTED_END = 300500

// Readings joined with their shift date and meter code. The readings list
// carries the shift id, not the date, so the join happens here — a bare
// ?shift_date= filter silently returns nothing.
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
      exc: r.exception_type, notes: r.notes, recorded: r.recorded_at,
    }
  })
}

// The gun's own rows at the acceptance station, by day.
async function gunDays(page) {
  const all = await readingRows(page)
  return new Map(all.filter((r) => r.code === GUN && r.station === _stationId).map((r) => [r.date, r]))
}

// The gun's card, found by its own code. Gun cards are repeated per date, so
// every control below is scoped to the card that owns the gun — clicking the
// first "تعديل" on the page has edited the wrong gun before.
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

async function openDay(page, date) {
  await page.locator('[data-testid="readings-date"]').fill(date)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2600) // the view reloads its payload for the date
  await closeEditor(page)
}

// The editor survives a date change and, while open, replaces its own
// "تعديل" button on the gun's card — close it before looking for that button.
async function closeEditor(page) {
  const cancel = page.locator('[data-testid="reading-edit-cancel"]')
  if (await cancel.count()) {
    await cancel.first().click()
    await page.waitForTimeout(900)
  }
}

// The station's id, resolved once: readings carry their shift, not the station,
// so this fixture is identified by the shift's station.
let _stationId = null

;(async () => {
  appendRun('qa-correction-impact', 'target=' + BASE2)
  const { browser, page } = await launch({ viewport: { width: 1500, height: 1000 } })
  page.on('dialog', (d) => d.accept())

  // ---- isolation, before anything else --------------------------------------
  const ok = await uiLogin(page, 'administrator', 'QaBrowserTest#2026')
  step('signed in on the disposable site', ok && BASE2.includes(':8007'), BASE2)
  const stations = await apiGet(page, 'stations/?limit_page_length=0')
  const names = (stations.results || []).map((s) => s.station_name)
  step('target is the disposable site (customer station absent)',
    !names.includes('محطة الراحلة 23'), `${names.length} stations: ${names.slice(0, 4).join(' | ')}`)

  _stationId = await qaStationId(page, STATION)
  step('acceptance station present', !!_stationId, _stationId || 'missing')

  // ---- fixture: remove any row of this gun on the three days ---------------
  {
    const days = await gunDays(page)
    let removed = 0
    for (const d of [DAY1, DAY2, DAY3]) {
      const row = days.get(d)
      if (row) { await qaDelete(page, 'meter-readings', row.name); removed++ }
    }
    step('fixture reset — this gun has no reading on the three days', true, `${removed} existing row(s) removed`)
  }

  // ---- build the chain through the UI, verifying each day ------------------
  await page.goto(BASE2 + '/app/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.locator('[data-testid="readings-station"]').selectOption({ label: STATION })
  await page.waitForTimeout(1800)

  async function enterReading(date, value) {
    await openDay(page, date)
    const card = await gunCard(page, GUN)
    if (!card) throw new Error(`gun ${GUN} is not listed on ${date}`)
    await card.locator('[data-testid="gun-current-input"]').fill(String(value))
    await page.locator('[data-testid="save-readings"]').click()
    // the sticky bar reports the outcome next to the button that was pressed
    await page.waitForSelector('[data-testid="save-bar-notice"]', { timeout: 15000 }).catch(() => {})
    await page.waitForTimeout(2400)
  }

  await enterReading(DAY1, END1)
  let days = await gunDays(page)
  const d1 = days.get(DAY1)
  step(`${DAY1}: ${END1} entered through the UI and stored`,
    !!d1 && Number(d1.end) === END1,
    d1 ? `${d1.start} -> ${d1.end} (opening: 0 L)` : 'not stored')

  await enterReading(DAY2, END2)
  days = await gunDays(page)
  const d2 = days.get(DAY2)
  step(`${DAY2}: ${END2} stored, starting from Day 1's end`,
    !!d2 && Number(d2.start) === END1 && Number(d2.end) === END2,
    d2 ? `${d2.start} -> ${d2.end}` : 'not stored')

  await enterReading(DAY3, END3)
  days = await gunDays(page)
  const d3 = days.get(DAY3)
  step(`${DAY3}: ${END3} stored, starting from Day 2's end`,
    !!d3 && Number(d3.start) === END2 && Number(d3.end) === END3,
    d3 ? `${d3.start} -> ${d3.end}` : 'not stored')

  // ---- reproduce: correct the middle day, do NOT save yet ------------------
  await openDay(page, DAY2)
  const card2 = await gunCard(page, GUN)
  if (!card2) throw new Error(`gun ${GUN} is not listed on ${DAY2}`)
  await card2.locator('[data-testid="reading-edit"]').click()
  await page.waitForTimeout(1200)

  const editor = card2.locator('[data-testid="reading-editor"]')
  step('correction editor is open on the middle day', await editor.isVisible())

  const endField = card2.locator('[data-testid="reading-edit-end"]')
  const loadedEnd = await endField.inputValue()
  step('editor loaded the saved end 301000', loadedEnd === String(END2), `loaded: ${loadedEnd}`)

  await endField.fill(String(CORRECTED_END))
  await page.waitForTimeout(800)

  // THE assertion: the warning is on screen before anything is saved.
  const impact = card2.locator('[data-testid="chain-impact"]')
  const impactVisible = await impact.isVisible()
  const impactText = impactVisible ? (await impact.innerText()).trim() : ''
  step('impact warning is visible BEFORE saving', impactVisible, impactText.slice(0, 150))
  await shot(page, 'correction-impact-before')

  step('warning names the day being corrected', /هذه القراءة/.test(impactText), impactText.slice(0, 60))
  step(`warning names the next affected day ${DAY3}`, impactText.includes(DAY3))
  step('warning names the discontinuity (next start no longer matches)', /غير مطابقة/.test(impactText))
  step('warning tells the operator a reason will be required', /يُطلب سبب/.test(impactText))

  // ---- a day with no successor must stay silent ----------------------------
  await openDay(page, DAY3)
  const card3 = await gunCard(page, GUN)
  await card3.locator('[data-testid="reading-edit"]').click()
  await page.waitForTimeout(1200)
  const end3Field = card3.locator('[data-testid="reading-edit-end"]')
  const end3Before = await end3Field.inputValue()
  await end3Field.fill(String(Number(end3Before) + 1234))
  await page.waitForTimeout(800)
  const latestWarning = await card3.locator('[data-testid="chain-impact"]').count()
  step('the latest day shows no warning (nothing follows it)', latestWarning === 0,
    `${latestWarning} warning(s) rendered`)
  await card3.locator('[data-testid="reading-edit-cancel"]').click()
  await page.waitForTimeout(700)

  // ---- saving without a reason must be refused -----------------------------
  await openDay(page, DAY2)
  const card2b = await gunCard(page, GUN)
  await card2b.locator('[data-testid="reading-edit"]').click()
  await page.waitForTimeout(1200)
  const end2b = card2b.locator('[data-testid="reading-edit-end"]')
  if ((await end2b.inputValue()) !== String(CORRECTED_END)) {
    await end2b.fill(String(CORRECTED_END))
    await page.waitForTimeout(600)
  }
  await card2b.locator('[data-testid="reading-edit-save"]').click()
  await page.waitForTimeout(2600)
  const refusal = await card2b.locator('[data-testid="reading-edit-error"]').innerText().catch(() => '')
  step('correction without a reason is refused by the chain guard',
    /لا تطابق بداية القراءة التالية/.test(refusal) && /أدخل سبب/.test(refusal),
    refusal.slice(0, 130))
  await shot(page, 'correction-impact-refused')

  // ---- complete the correction with an explicit reason ---------------------
  await card2b.locator('[data-testid="reading-edit-exception-type"]').selectOption('other')
  await card2b.locator('[data-testid="reading-edit-exception-notes"]').fill('تصحيح بأثر رجعي — اختبار الانحدار')
  await card2b.locator('[data-testid="reading-edit-save"]').click()
  await page.waitForSelector('[data-testid="save-bar-notice"]', { timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(2600)
  await shot(page, 'correction-impact-after')

  // ---- persisted result, verified from the backend ------------------------
  days = await gunDays(page)
  const saved = days.get(DAY2)
  step(`the correction persisted (end = ${CORRECTED_END})`,
    !!saved && Number(saved.end) === CORRECTED_END,
    saved ? `${saved.start} -> ${saved.end}` : 'not stored')
  step('the reason of the correction persisted',
    !!saved && saved.exc === 'other' && !!saved.notes,
    saved ? `type=${saved.exc || 'none'} notes=${saved.notes || 'none'}` : 'not stored')

  const next = days.get(DAY3)
  step('the next day was NOT changed silently (start still 301000)',
    !!next && Number(next.start) === END2, next ? `start=${next.start}` : 'next day missing')

  const all = await readingRows(page)
  // Grouped by METER, not by reading name: a reading name is unique, so
  // grouping by it would find no links to break and pass vacuously.
  const byMeter = new Map()
  for (const r of all) {
    if (!byMeter.has(r.meter)) byMeter.set(r.meter, [])
    byMeter.get(r.meter).push(r)
  }
  const breaks = []
  for (const list of byMeter.values()) {
    // Chronological: day first, then the moment the reading was typed. Two rows
    // can share a day (a gun typed twice), and a date-only sort would compare
    // them in arbitrary order and invent a break that is not there.
    list.sort((a, b) => String(a.date).localeCompare(String(b.date))
      || String(a.recorded).localeCompare(String(b.recorded)))
    for (let i = 1; i < list.length; i++) {
      if (Number(list[i].start) !== Number(list[i - 1].end)) {
        breaks.push({ documented: !!(list[i - 1].exc || list[i].exc), at: list[i].date, code: list[i].code })
      }
    }
  }
  step('chain has no unexplained breaks', breaks.every((b) => b.documented),
    `${all.length} readings · ${breaks.length} break(s): ` +
    (breaks.length ? breaks.map((b) => `${b.code}@${b.at}${b.documented ? ' (documented)' : ' (UNEXPLAINED)'}`).join(', ') : 'none'))

  // ---- cleanup: this fixture is this script's own --------------------------
  for (const d of [DAY1, DAY2, DAY3]) {
    const row = (await gunDays(page)).get(d)
    if (row) await qaDelete(page, 'meter-readings', row.name)
  }
  const left = (await gunDays(page)).size
  step('fixture removed after the run', left === 0, `${left} row(s) left`)

  const failed = summary()
  await browser.close()
  process.exit(failed ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
