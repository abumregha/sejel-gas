// Reset ONLY the Round-4 fixture station «QA R4 أ»: its tank transfers and its
// two tanks' opening levels. Both are looked up under that station's id, so
// nothing of another station is reachable — no list-wide delete, no name guess.
const { launch, uiLogin, step, summary, apiGet, apiPut, qaStationId } = require('./qa')

const STATION = 'QA R4 أ'
const LEVELS = { 'خزان أ بنزين 1': 20000, 'خزان أ بنزين 2': 0 }

;(async () => {
  const { browser, page } = await launch()
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  const st = await qaStationId(page, STATION)
  if (!st) { console.error(`station «${STATION}» not found — nothing touched`); await browser.close(); process.exit(1) }

  const csrf = await page.evaluate(async () =>
    (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token)

  const rows = ((await apiGet(page, 'tank-transfers/?limit_page_length=0')).results || [])
    .filter((r) => r.station === st)
  const otherBefore = ((await apiGet(page, 'tank-transfers/?limit_page_length=0')).results || [])
    .filter((r) => r.station !== st).map((r) => r.name)
  let removed = 0
  for (const r of rows) {
    const status = await page.evaluate(async ({ name, csrf }) => {
      const res = await fetch(`/api/tank-transfers/${name}/`, {
        method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
      })
      return res.status
    }, { name: r.name, csrf })
    step(`delete transfer ${r.name} (${r.quantity} L)`, status < 400 || status === 404, `HTTP ${status}`)
    if (status < 400) removed++
  }

  const tanks = ((await apiGet(page, `tanks/?station=${st}&limit_page_length=0`)).results || [])
    .filter((t) => t.station === st)
  for (const [name, level] of Object.entries(LEVELS)) {
    const t = tanks.find((x) => x.tank_name === name)
    if (!t) { step(`tank «${name}»`, false, 'MISSING'); continue }
    const r = await apiPut(page, `tanks/${t.name}/`, { current_level: level })
    step(`«${name}» level restored to ${level}`, !r.__status && Number(r.current_level) === level,
      r.__status ? `HTTP ${r.__status}` : String(r.current_level))
  }

  // prove nothing outside this station moved
  const otherAfter = ((await apiGet(page, 'tank-transfers/?limit_page_length=0')).results || [])
    .filter((r) => r.station !== st).map((r) => r.name)
  const missing = otherBefore.filter((n) => !otherAfter.includes(n))
  step('no transfer of another station was removed', missing.length === 0,
    `${otherBefore.length} before → ${otherAfter.length} after` + (missing.length ? ` MISSING ${missing}` : ''))

  console.log(`\nreset «${STATION}»: ${removed} transfer(s) removed`)
  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
