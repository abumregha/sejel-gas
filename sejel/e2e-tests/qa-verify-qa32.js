// VERIFY QA-32 fix end-to-end in the browser, as the station owner.
//
// Two consecutive days on the QA Edge station (11:00→11:00):
//   Day 1 (2026-10-04): every gun has no counter yet → each entry is the
//                       opening baseline → 0 L booked, not the whole counter.
//   Day 2 (2026-10-05): +1,000 L on every gun → 9 guns = 9,000 L →
//                       reconciliation must report exactly 9,000 L / 1,350 د.ل.
const { appendRun, capture, uiLogin, bodyText, shot, step, summary, launch, apiGet } = require('./qa')

const BASE = 'http://localhost:8004'
const EDGE = process.env.QA_STATION || 'QA Cycle Station'
const PRICE = 0.15
const PER_GUN = 1000
const DAY1 = process.env.QA_DAY1 || '2026-10-07'
const DAY2 = process.env.QA_DAY2 || '2026-10-08'

async function openDay(page, date) {
  await page.goto(BASE + '/readings', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  await page.locator('[data-testid="readings-station"]').selectOption({ label: EDGE }).catch(async () => {
    await page.locator('select').first().evaluate((el, want) => {
      const o = Array.from(el.options).find((x) => x.textContent.trim() === want)
      if (o) { el.value = o.value; el.dispatchEvent(new Event('change', { bubbles: true })) }
    }, EDGE)
  })
  await page.waitForTimeout(1200)
  await page.locator('[data-testid="readings-date"]').fill(date)
  await page.locator('[data-testid="readings-date"]').dispatchEvent('change')
  await page.waitForTimeout(2200)
}

async function fillDay(page, date, { baseline }) {
  await openDay(page, date)
  const inputs = page.locator('[data-testid="gun-current-input"]')
  const guns = await inputs.count()
  const badges = await page.locator('[data-testid="opening-badge"]').count()
  const entered = []
  for (let i = 0; i < guns; i++) {
    const val = baseline ? 250000 + i * 100 : 250000 + i * 100 + PER_GUN
    await inputs.nth(i).fill(String(val))
    entered.push(val)
    await page.waitForTimeout(120)
  }
  const body = (await bodyText(page)).replace(/\s+/g, ' ')
  await shot(page, `qa-verify-day-${date}`)
  await page.locator('[data-testid="save-readings"]').click()
  await page.waitForTimeout(4000)
  const after = (await bodyText(page)).replace(/\s+/g, ' ')
  const saved = /تم حفظ (\d+) قراءة بنجاح/.exec(after)
  return { guns, badges, entered, saved: saved ? saved[1] : null, tail: after.slice(-260), body }
}

async function closeDay(page, date) {
  await openDay(page, date)
  await page.locator('[data-testid="close-day"]').click()
  await page.waitForTimeout(4000)
  return (await bodyText(page)).replace(/\s+/g, ' ')
}

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await uiLogin(page, 'owner@sejel.ly', 'owner123')

  // ---------- Day 1: baselines ----------
  const d1 = await fillDay(page, DAY1, { baseline: true })
  step('day 1: every gun shows the opening badge', d1.badges === d1.guns,
    `${d1.badges}/${d1.guns} badges`)
  step('day 1: all readings saved', d1.saved === String(d1.guns), `saved ${d1.saved}`)
  step('day 1: no liters preview before saving', !/= [\d,]+ لتر مباعة/.test(d1.body),
    'preview suppressed')
  appendRun('## QA-32 verification — day 1 (' + DAY1 + ', baseline day)',
    `\n- guns: ${d1.guns}, opening badges shown: ${d1.badges}` +
    `\n- readings saved: ${d1.saved}` +
    `\n- page tail: ${JSON.stringify(d1.tail)}`)

  const c1 = await closeDay(page, DAY1)
  step('day 1: closed with the success message', /تم إقفال اليوم/.test(c1), c1.slice(-160))
  appendRun('## QA-32 verification — day 1 close',
    '\n- text: ' + JSON.stringify(c1.slice(-240)))

  let recs = await apiGet(page, 'reconciliations/')
  const st = (await apiGet(page, 'stations/')).results.find((s) => s.station_name === EDGE)
  const edgeRecs = (recs.results || []).filter((r) => r.station === st.name)
  step('day 1: reconciliation books 0 litres (baseline, not sales)',
    edgeRecs.every((r) => r.total_liters === 0),
    JSON.stringify(edgeRecs.map((r) => ({ liters: r.total_liters, sales: r.expected_sales }))))
  appendRun('## QA-32 verification — day 1 reconciliation',
    '\n```\n' + JSON.stringify(edgeRecs, null, 1).slice(0, 800) + '\n```')

  // ---------- Day 2: a real sales day ----------
  const d2 = await fillDay(page, DAY2, { baseline: false })
  step('day 2: no opening badges (counters exist)', d2.badges === 0, `${d2.badges} badges`)
  step('day 2: all readings saved', d2.saved === String(d2.guns), `saved ${d2.saved}`)
  appendRun('## QA-32 verification — day 2 (' + DAY2 + ', sales day)',
    `\n- guns: ${d2.guns}, opening badges: ${d2.badges}` +
    `\n- entered: ${JSON.stringify(d2.entered)}` +
    `\n- readings saved: ${d2.saved}` +
    `\n- page tail: ${JSON.stringify(d2.tail)}`)

  const c2 = await closeDay(page, DAY2)
  step('day 2: closed with the success message', /تم إقفال اليوم/.test(c2), c2.slice(-200))
  appendRun('## QA-32 verification — day 2 close',
    '\n- text: ' + JSON.stringify(c2.slice(-260)))
  await shot(page, 'qa-verify-day2-closed')

  recs = await apiGet(page, 'reconciliations/')
  const all = recs.results || []
  const expected = d2.guns * PER_GUN
  const sales = expected * PRICE
  appendRun('## QA-32 verification — all reconciliations for the QA station',
    '\n```\n' + JSON.stringify(all.filter((r) => r.station === st.name), null, 1).slice(0, 1400) + '\n```')

  const day2 = all.filter((r) => r.station === st.name && r.total_liters > 0)
  step('day 2: reconciliation reports exactly the entered litres',
    day2.some((r) => Math.abs(r.total_liters - expected) < 0.01),
    `expected ${expected}, got ${JSON.stringify(day2.map((r) => r.total_liters))}`)
  step('day 2: expected sales are correct',
    day2.some((r) => Math.abs(r.expected_sales - sales) < 0.01),
    `expected ${sales.toFixed(2)}, got ${JSON.stringify(day2.map((r) => r.expected_sales))}`)
  step('day 2: no 100x inflation anywhere',
    all.length > 0 && all.every((r) => r.total_liters < expected * 2),
    `max ${Math.max(...all.map((r) => r.total_liters))}`)

  appendRun('## Phase 8 re-verification result',
    `\n- day 1 (baselines): ${d1.guns} guns, ${d1.badges} opening badges, reconciliation 0 L` +
    `\n- day 2 (sales): ${expected} L entered → reconciliation ${JSON.stringify(day2.map((r) => ({ liters: r.total_liters, sales: r.expected_sales })))}`)

  appendRun('## QA-32 verification — network ≥400',
    (page.netFails || []).slice(0, 30).map((x) => '- ' + x).join('\n') || '(none)')

  summary('qa-verify-qa32')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })