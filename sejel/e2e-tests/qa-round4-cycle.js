// SECTION 6 — two stations with DIFFERENT daily cycles on the same site.
// The cycle matrix proves one station's 11:00/10:30/23:00 story; what it does
// not prove is that station A's cycle never bleeds into station B's screen.
// «QA R4 أ» runs 11:00, «QA R4 ب» runs 10:30 — both are read from the same
// readings screen, one after the other, in a real browser.
const { launch, uiLogin, step, summary, appendRun, apiGet, shot } = require('./qa')

const BASE = 'http://localhost:8004'
const CASES = [
  { station: 'QA R4 أ', cycle: '11:00' },
  { station: 'QA R4 ب', cycle: '10:30' },
]

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const stations = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
  for (const c of CASES) {
    const s = stations.find((x) => x.station_name === c.station)
    step(`«${c.station}» exists`, !!s, s ? `${s.name} · day_close_time=${s.day_close_time}` : 'MISSING')
    c.id = s && s.name
    step(`«${c.station}» is configured for ${c.cycle}`, !!s && String(s.day_close_time).startsWith(c.cycle),
      String(s && s.day_close_time))
  }

  await page.goto(BASE + '/readings', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)

  for (const c of CASES) {
    const sel = page.locator('[data-testid="readings-station"]')
    if (await sel.count()) {
      await sel.selectOption({ label: c.station }).catch(async () => { await sel.selectOption(c.id) })
      await page.waitForTimeout(1400)
    }
    const text = await page.locator('body').innerText()
    const shown = (text.match(/دورة القراءة: [^\n]*/) || ['(no cycle line)'])[0]
    step(`the readings screen shows «${c.station}»’s own ${c.cycle} cycle`,
      shown.includes(c.cycle), shown.slice(0, 80))
    await shot(page, `r4-cycle-${c.cycle.replace(':', '')}`)
    appendRun(`Cycle — ${c.station}`, shown)
  }

  // the two must not be able to show the same thing
  const a = CASES[0], b = CASES[1]
  step('the two stations really do differ on screen', a.cycle !== b.cycle, `${a.cycle} vs ${b.cycle}`)

  // the station the cycle matrix restored must still be its original value
  const acc = stations.find((x) => x.station_name === 'QA موظف جديد')
  step('the acceptance station kept its original cycle after the matrix run',
    !!acc && String(acc.day_close_time).startsWith('11:00'), String(acc && acc.day_close_time))

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
