// SECTION 2 — station isolation for a station-BOUND (non-admin) user, through a
// real browser session. The scoping rules live in api/scoping.py:
//   * list  → apply_to_filters forces the user's own station
//   * by name → check_station on GET/PUT/DELETE
//   * create → ? (this is the blind spot under test)
// Two probe users are created against our OWN fixture station «QA R4 أ» and
// deleted at the end: a supervisor (can create Tank Transfers) and a finance
// user (can create Expenses). Neither role is exempt from scoping.
const { launch, uiLogin, step, summary, appendRun, apiGet, apiPost, apiPut,
  qaStationId, BASE2, shot } = require('./qa')

const STATION_A = 'QA R4 أ'   // the probe users' own station
const STATION_B = 'QA R4 ب'   // the foreign station they must not reach
const PROBE = 'QA R4 isolation probe'
const SUP = { email: 'qa-r4-sup@sejel.ly', username: 'qa-r4-sup', pwd: 'QaR4Sup2026!x', role: 'supervisor' }
const FIN = { email: 'qa-r4-fin@sejel.ly', username: 'qa-r4-fin', pwd: 'QaR4Fin2026!x', role: 'finance' }

// raw call so an Arabic rejection message survives (apiPost drops the body)
const raw = (page) => (method, url, body) => page.evaluate(async ({ m, u, b }) => {
  const me = await fetch('/api/auth/me/', { credentials: 'include' })
  const csrf = me.ok ? ((await me.json()).message || {}).csrf_token || '' : ''
  const r = await fetch('/api/' + u, {
    method: m, credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
    body: b ? JSON.stringify(b) : undefined,
  })
  const text = await r.text()
  let msg = ''
  let parsed = null
  try {
    parsed = JSON.parse(text)
    const sm = parsed._server_messages ? JSON.parse(parsed._server_messages)[0] : null
    msg = (sm && sm.message) || parsed.exception || parsed.message || ''
  } catch (e) { msg = text.slice(0, 200) }
  const data = (parsed && typeof parsed.message === 'object') ? parsed.message : null
  return { status: r.status, msg: String(msg).replace(/<[^>]*>/g, '').slice(0, 160), data }
}, { m: method, u: url, b: body })

const logout = (page) => page.evaluate(() =>
  fetch('/api/auth/logout/', { method: 'POST', credentials: 'include' }).then(() => 1))

const del = (page) => (url) => page.evaluate(async (u) => {
  const me = await fetch('/api/auth/me/', { credentials: 'include' })
  const csrf = me.ok ? ((await me.json()).message || {}).csrf_token || '' : ''
  const r = await fetch('/api/' + u, { method: 'DELETE', credentials: 'include',
    headers: { 'X-Frappe-CSRF-Token': csrf } })
  return { status: r.status }
}, url)

const csrfOf = (page) => page.evaluate(async () =>
  (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token)

const today = () => new Date().toISOString().slice(0, 10)

;(async () => {
  const { browser, page } = await launch()
  const call = raw(page)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  const stA = await qaStationId(page, STATION_A)
  const stB = await qaStationId(page, STATION_B)
  step('fixture stations resolved', !!stA && !!stB, `own=${stA} foreign=${stB}`)

  const tanks = (await apiGet(page, 'tanks/?limit_page_length=0')).results || []
  const ownTanks = tanks.filter((t) => t.station === stA)
  const foreignTank = tanks.find((t) => t.station === stB)
  step('both stations have tanks to probe with',
    ownTanks.length >= 2 && !!foreignTank,
    `own=${ownTanks.map((t) => t.tank_name).join(', ')} · foreign=${foreignTank && foreignTank.tank_name}`)

  // ---------- fixture users, bound to OUR station ----------
  const ensureUser = async (u) => {
    const rows = (await apiGet(page, 'users/?limit_page_length=0')).results || []
    const hit = rows.find((r) => (r.name || '').toLowerCase() === u.email)
    const payload = {
      email: u.email, username: u.username, first_name: 'QA R4', password: u.pwd,
      role: u.role, station: stA,
    }
    if (hit) {
      // `enabled: 1` matters: the cleanup at the end of this suite DISABLES a
      // probe user Frappe refuses to delete, and a re-run has to wake it up
      // before it can be used to attempt a write.
      const r = await apiPut(page, `users/${hit.name}/`, { password: u.pwd, role: u.role, station: stA, enabled: 1 })
      return { name: hit.name, ok: !r.__status }
    }
    const r = await apiPost(page, 'users/', payload)
    return { name: r.name, ok: !r.__status && !!r.name }
  }
  const sup = await ensureUser(SUP)
  const fin = await ensureUser(FIN)
  step('probe users exist, both bound to the OWN station', sup.ok && fin.ok,
    `${sup.name} (${SUP.role}) · ${fin.name} (${FIN.role})`)
  appendRun('Isolation — fixture users', `${sup.name}=${SUP.role}@${stA}, ${fin.name}=${FIN.role}@${stA}`)

  const cat = ((await apiGet(page, 'expense-categories/?limit_page_length=0')).results || [])[0]
  step('an expense category exists for the write probe', !!cat, cat && cat.name)

  // ================= SUPERVISOR (bound to A) =================
  await logout(page)
  await uiLogin(page, SUP.email, SUP.pwd)
  step('supervisor session opened', !page.url().includes('login'), page.url().replace(BASE2, ''))

  const listed = (await apiGet(page, 'tanks/?limit_page_length=0')).results || []
  step('read scoping: only the bound station’s tanks are listed',
    listed.length > 0 && listed.every((t) => t.station === stA),
    `${listed.length} row(s), stations=${[...new Set(listed.map((t) => t.station))].join(',')}`)

  const widened = (await apiGet(page, `tanks/?station=${stB}&limit_page_length=0`)).results || []
  step('a ?station= of another station cannot widen the view',
    widened.every((t) => t.station === stA),
    `${widened.length} row(s), stations=${[...new Set(widened.map((t) => t.station))].join(',')}`)

  const readForeign = await call('GET', `tanks/${foreignTank.name}/`)
  step('read of a foreign tank by name is refused', readForeign.status >= 400,
    `HTTP ${readForeign.status} ${readForeign.msg}`)

  const levelBefore = foreignTank.current_level
  const writeForeign = await call('PUT', `tanks/${foreignTank.name}/`, { current_level: 19999 })
  const stillHidden = !((await apiGet(page, 'tanks/?limit_page_length=0')).results || [])
    .some((t) => t.name === foreignTank.name)
  step('write to a foreign tank is refused (and it stays invisible)', writeForeign.status >= 400 && stillHidden,
    `HTTP ${writeForeign.status} ${writeForeign.msg || ''} · not in my list: ${stillHidden}`)

  // the CREATE path: no check_station runs here (views.py crud_list → create_doc)
  const badTransfer = await call('POST', 'tank-transfers/', {
    station: stB, from_tank: ownTanks[0].name, to_tank: ownTanks[1].name,
    quantity: 10, reason: PROBE, fuel_type: ownTanks[0].fuel_type, status: 'completed',
  })
  const transferLanded = badTransfer.status < 400
  step('create of a TRANSFER filed under ANOTHER station is refused', !transferLanded,
    `HTTP ${badTransfer.status} ${badTransfer.msg || JSON.stringify(badTransfer).slice(0, 80)}`)

  // UI: the station picker must not even offer the foreign station
  await page.goto(BASE2 + '/inventory/transfers', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  let uiOffender = '(form not opened)'
  if (await page.locator('a', { hasText: 'إضافة تحويل' }).first().isVisible().catch(() => false)) {
    await page.locator('a', { hasText: 'إضافة تحويل' }).first().click()
    await page.waitForTimeout(800)
    const el = page.locator("xpath=//label[normalize-space(.)='المحطة']").first()
    const ctrl = el.locator('xpath=following::input[1]|following::select[1]').first()
    const opts = await ctrl.locator('option').allTextContents().catch(() => [])
    if (opts.length) uiOffender = opts.filter((o) => o.includes(STATION_B)).join(',') || '(none)'
    else {
      // combobox: open it and read the rendered rows
      await ctrl.click().catch(() => {})
      await page.waitForTimeout(600)
      const rows = await page.locator('[role="option"], li').allTextContents().catch(() => [])
      uiOffender = rows.filter((t) => t.includes(STATION_B)).join(',') || '(none)'
      await shot(page, 'r4-isolation-picker')
    }
  }
  step('the station picker does not offer the foreign station', uiOffender === '(none)', uiOffender)
  appendRun('Isolation — supervisor', JSON.stringify({
    listOnlyOwn: listed.every((t) => t.station === stA),
    widen: widened.every((t) => t.station === stA),
    readForeign: readForeign.status, writeForeign: writeForeign.status,
    createTransfer: badTransfer.status, picker: uiOffender,
  }))

  // ================= FINANCE (bound to A) =================
  await logout(page)
  await uiLogin(page, FIN.email, FIN.pwd)
  step('finance session opened', !page.url().includes('login'), page.url().replace(BASE2, ''))

  const badExpense = await call('POST', 'expenses/', {
    station: stB, category: cat.name, amount: 1, description: PROBE,
    payment_method: 'cash', status: 'pending',
  })
  const expenseLanded = badExpense.status < 400
  step('create of an EXPENSE booked on ANOTHER station is refused', !expenseLanded,
    `HTTP ${badExpense.status} ${badExpense.msg || ''}`)

  // control: the same call on the user's OWN station must work
  const ownExpense = await call('POST', 'expenses/', {
    station: stA, category: cat.name, amount: 1, description: PROBE + ' (own)',
    payment_method: 'cash', status: 'pending',
  })
  step('control: the same create on the OWN station succeeds', ownExpense.status < 400,
    `HTTP ${ownExpense.status} ${ownExpense.msg || ''}`)
  appendRun('Isolation — finance', JSON.stringify({
    createForeignExpense: badExpense.status, createOwnExpense: ownExpense.status,
  }))

  // ================= REPORTS: money must stop at the station line =========
  // A marker booked on the FOREIGN station by admin (the create path is
  // already blocked for bound users). If the reports were unscoped the bound
  // supervisor would inherit it.
  const MARKER = 777777
  const MARKER_DESC = PROBE + ' (report-book)'
  await logout(page)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  const marker = await call('POST', 'expenses/', {
    station: stB, category: cat.name, amount: MARKER, description: MARKER_DESC,
    payment_method: 'cash', status: 'pending',
  })
  step('admin books the marker expense on the FOREIGN station', marker.status < 400,
    `HTTP ${marker.status} · ${MARKER} LYD`)
  const adminSales = await call('GET', `reports/daily-sales/?date=${today()}`)
  const adminExp = Number((adminSales.data || {}).total_expenses || 0)
  step('admin sees the marker in daily sales', adminExp >= MARKER, `total_expenses=${adminExp}`)

  await logout(page)
  await uiLogin(page, SUP.email, SUP.pwd)
  const supSales = await call('GET', `reports/daily-sales/?date=${today()}`)
  const supExp = Number((supSales.data || {}).total_expenses || 0)
  step('the bound supervisor does NOT inherit the foreign station’s money',
    supSales.status < 400 && supExp < MARKER && adminExp - supExp >= MARKER,
    `HTTP ${supSales.status} · supervisor=${supExp} admin=${adminExp}`)

  const supDaily = await call('GET', `reports/daily/?date=${today()}`)
  const dailyStations = ((supDaily.data || {}).stations || []).map((x) => x.id)
  step('the daily report returns only the bound station',
    supDaily.status < 400 && dailyStations.every((id) => id === stA),
    `HTTP ${supDaily.status} · stations=${dailyStations.join(',') || '(none)'}`)

  const expForeign = await call('GET', `export/?view=station&name=${stB}`)
  const expOwn = await call('GET', `export/?view=station&name=${stA}`)
  step('Excel export of a FOREIGN station is refused, own station is not',
    expForeign.status >= 400 && expOwn.status === 200,
    `foreign HTTP ${expForeign.status} · own HTTP ${expOwn.status}`)

  // a browser context with no session at all
  const guestCtx = await browser.newContext()
  const guestPage = await guestCtx.newPage()
  await guestPage.goto(BASE2 + '/login/', { waitUntil: 'domcontentloaded' })
  const gget = (u) => guestPage.evaluate(async (x) => {
    const r = await fetch(x, { credentials: 'omit' })
    return { status: r.status, len: (await r.text()).length }
  }, BASE2 + u)
  const g1 = await gget(`/api/reports/daily-sales/?date=${today()}`)
  const g2 = await gget(`/api/export/?view=station&name=${stA}`)
  const g3 = await gget(`/api/reports/daily/?date=${today()}`)
  const g4 = await gget('/api/tanks/?limit_page_length=0')
  step('a visitor with NO session gets nothing',
    g1.status >= 400 && g2.status >= 400 && g3.status >= 400 && g4.status >= 400,
    `daily-sales ${g1.status} · export ${g2.status} · daily ${g3.status} · tanks ${g4.status}`)
  await guestCtx.close()
  appendRun('Isolation — reports', JSON.stringify({
    adminExpenses: adminExp, supervisorExpenses: supExp, dailyStations,
    exportForeign: expForeign.status, exportOwn: expOwn.status,
    guest: [g1.status, g2.status, g3.status, g4.status],
  }))

  // ================= ADMIN: ground truth + cleanup of our own probes =========
  await logout(page)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  const allTransfers = (await apiGet(page, 'tank-transfers/?limit_page_length=0')).results || []
  const landedTransfer = allTransfers.find((r) => r.reason === PROBE)
  step('ground truth: no transfer with our probe reason survives',
    !landedTransfer, landedTransfer ? `${landedTransfer.name} station=${landedTransfer.station}` : 'none')
  if (landedTransfer) await del(page)(`tank-transfers/${landedTransfer.name}/`)

  const allExpenses = (await apiGet(page, 'expenses/?limit_page_length=0')).results || []
  const probes = allExpenses.filter((e) => String(e.description || '').startsWith(PROBE))
  // the '(report-book)' marker is booked by ADMIN on purpose — that is the
  // control the report test measures against. Only the BOUND users' attempts
  // must have produced nothing on the foreign station.
  const foreignByBoundUser = probes.filter((e) => e.station === stB && !String(e.description).includes('(report-book)'))
  step('ground truth: neither bound user booked anything on the foreign station',
    foreignByBoundUser.length === 0, `${foreignByBoundUser.length} foreign / ${probes.length} probe row(s)`)
  for (const e of probes) await del(page)(`expenses/${e.name}/`)

  const foreignAfter = ((await apiGet(page, 'tanks/?limit_page_length=0')).results || [])
    .find((t) => t.name === foreignTank.name)
  step('ground truth: the foreign tank level was never altered',
    Number(foreignAfter.current_level) === Number(levelBefore),
    `${levelBefore} → ${foreignAfter.current_level}`)

  // Our own probe users must not survive the run — but Frappe refuses to
  // DELETE a User that owns linked rows (HTTP 417 «You can disable this User
  // instead of deleting it»), so the cleanup it prescribes is: disable the
  // user and drop the station binding. The step reads the list back; the
  // earlier draft asserted `!r.__status` against a helper that returns
  // `{ status }`, so it reported «HTTP 200» while both users were still
  // enabled and still bound to the fixture station.
  for (const u of [sup, fin]) {
    if (!u.name) continue
    const r = await del(page)(`users/${u.name}/`)
    let action = `DELETE ${r.status}`
    if (r.status === 417 || r.status === 403) {
      const d = await call('PUT', `users/${u.name}/`, { enabled: 0, station: null })
      action += ` → disable+unbind ${d.status}`
    }
    const rows = (await apiGet(page, 'users/?limit_page_length=0')).results || []
    const after = rows.find((x) => x.name === u.name)
    step(`probe user ${u.name} is inert (gone or disabled+unbound)`,
      !after || (Number(after.enabled) === 0 && !after.sejel_station),
      action + (after ? ` · enabled=${after.enabled}, bound=${after.sejel_station || 'none'}` : ' · gone'))
  }

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
