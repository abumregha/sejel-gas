// SECTION 3 — transfer between TWO TANKS OF THE SAME FUEL (the only business
// path that had never been exercised). Everything is done through the real UI:
// sidebar → list → form → type → save. The backend is only READ afterwards, to
// prove what the screen claims actually landed.
//
// Every invalid case takes its own baseline (row count + tank levels) so a case
// that silently succeeds cannot make the next one look like a pass.
const { appendRun, capture, uiLogin, bodyText, shot, step, summary, launch, apiGet, apiPut, qaStationId, qaFillField } = require('./qa')

const BASE = 'http://localhost:8004'
const STATION = 'QA R4 أ'
const CROSS = 'QA R4 ب'
const QTY = 5000

const readTanks = async (page) => ((await apiGet(page, 'tanks/?limit_page_length=0')).results || [])
const byName = (rows) => Object.fromEntries(rows.map((t) => [t.tank_name, t]))
const transfers = async (page) => ((await apiGet(page, 'tank-transfers/?limit_page_length=0')).results || [])

async function openForm(page) {
  await page.goto(BASE + '/inventory/transfers', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  await page.locator('a', { hasText: 'إضافة تحويل' }).first().click()
  await page.waitForTimeout(700)
}

async function optionTexts(page, labelText) {
  const el = page.locator(`xpath=//label[normalize-space(.)='${labelText}']`).first()
  const ctrl = el.locator('xpath=following::input[1]|following::select[1]|following::textarea[1]').first()
  return ctrl.locator('option').allTextContents()
}

async function fillPair(page, station, srcId, dstId, qty, reason) {
  await openForm(page)
  await qaFillField(page, 'المحطة', station)
  await page.waitForTimeout(400)
  await qaFillField(page, 'من خزان', srcId)
  await page.waitForTimeout(300)
  if (dstId !== null) await qaFillField(page, 'إلى خزان', dstId)
  await qaFillField(page, 'الكمية (لتر)', String(qty))
  if (reason) await qaFillField(page, 'السبب', reason).catch(() => {})
}

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')
  const stA = await qaStationId(page, STATION)
  const stB = await qaStationId(page, CROSS)
  step('fixture stations resolved', !!stA && !!stB, `A=${stA} B=${stB}`)

  // ---------- replayable: our own fixture, restored to its opening state ----------
  // Only this station's transfer rows and only these two tanks — nothing else.
  const OPENING = { 'خزان أ بنزين 1': 20000, 'خزان أ بنزين 2': 0 }
  const ownRows = (await transfers(page)).filter((r) => r.station === stA)
  for (const r of ownRows)
    await page.evaluate(async ({ name, csrf }) => {
      const res = await fetch(`/api/tank-transfers/${name}/`, {
        method: 'DELETE', credentials: 'include', headers: { 'X-Frappe-CSRF-Token': csrf },
      })
      return res.status
    }, { name: r.name, csrf: await page.evaluate(async () =>
      (await (await fetch('/api/auth/me/', { credentials: 'include' })).json()).message.csrf_token) })
  for (const t of (await readTanks(page)).filter((x) => x.station === stA && OPENING[x.tank_name] !== undefined))
    await apiPut(page, `tanks/${t.name}/`, { current_level: OPENING[t.tank_name] })
  appendRun('Transfer — fixture reset', `${ownRows.length} own transfer row(s) removed, opening levels restored`)

  const t0 = byName(await readTanks(page))
  const srcName = 'خزان أ بنزين 1'
  const dstName = 'خزان أ بنزين 2'
  const src = t0[srcName]
  const dst = t0[dstName]
  step('the two same-fuel tanks exist', !!src && !!dst && src.fuel_type === dst.fuel_type,
    `${srcName}=${src && src.current_level}/${src && src.capacity} · ${dstName}=${dst && dst.current_level}/${dst && dst.capacity}`)
  appendRun('Transfer — opening levels', `${srcName}: ${src.current_level}/${src.capacity} · ${dstName}: ${dst.current_level}/${dst.capacity}`)

  // ---------- discoverability: sidebar, not a URL ----------
  await page.goto(BASE + '/app/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const navVisible = await page.locator('a', { hasText: 'التحويلات' }).first().isVisible().catch(() => false)
  step('«التحويلات» is reachable from the navigation', navVisible, navVisible ? 'link found' : 'not visible at this width')
  await openForm(page)
  step('transfer form opens', (await bodyText(page)).includes('إضافة تحويل بين الخزانات'))

  // ---------- A. a destination of another fuel is not even offered ----------
  await qaFillField(page, 'المحطة', stB)
  await page.waitForTimeout(500)
  const fromOpts = (await optionTexts(page, 'من خزان')).filter((t) => t.includes('خزان ب'))
  step('source lists this station’s tanks', fromOpts.length === 2, fromOpts.join(' | '))
  const gasOpt = fromOpts.find((t) => t.includes('بنزين'))
  await qaFillField(page, 'من خزان', gasOpt)
  await page.waitForTimeout(500)
  const toOpts = await optionTexts(page, 'إلى خزان')
  const dieselDest = toOpts.some((t) => t.includes('ديزل'))
  step('a destination of a DIFFERENT fuel is not offered', !dieselDest, toOpts.join(' | '))
  await shot(page, 'r4-transfer-form')

  // ---------- invalid cases, each with its own baseline ----------
  const expectRefused = async (label, qty, setup) => {
    if (setup) await setup() // the case's own arrangement — snapshot AFTER it
    const beforeRows = (await transfers(page)).length
    const beforeTanks = byName(await readTanks(page))
    await fillPair(page, stA, src.name, dst.name, qty, 'اختبار: ' + label)
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(2200)
    const url = page.url()
    const body = await bodyText(page)
    const afterRows = (await transfers(page)).length
    const afterTanks = byName(await readTanks(page))
    const levelIntact = [srcName, dstName].every((n) => Number(afterTanks[n].current_level) === Number(beforeTanks[n].current_level))
    const refused = url.includes('transfers/create') && afterRows === beforeRows && levelIntact
    const errBox = await page.locator('div.bg-red-50.border.border-red-200').first()
      .innerText().catch(() => '')
    const msg = errBox.trim().replace(/\s+/g, ' ') || (body.match(/[^\n]*(لم يُحفظ|لا يمكن|خطأ|أكبر|أقل|يجب)[^\n]*/) || ['(no message)'])[0].trim()
    step(`${label} → refused, nothing written`, refused,
      `rows ${beforeRows}→${afterRows} · ${srcName} ${beforeTanks[srcName].current_level}→${afterTanks[srcName].current_level} · ` +
      `${dstName} ${beforeTanks[dstName].current_level}→${afterTanks[dstName].current_level} · ${msg.slice(0, 90)}`)
    appendRun('Transfer — invalid case', `${label}: qty=${qty} rows ${beforeRows}→${afterRows}, levels ` +
      `${srcName} ${beforeTanks[srcName].current_level}→${afterTanks[srcName].current_level}, ` +
      `${dstName} ${beforeTanks[dstName].current_level}→${afterTanks[dstName].current_level}, msg=${msg.slice(0, 120)}, url=${url.replace(BASE, '')}`)
    return { refused, msg }
  }

  // restore our own tanks to the known opening levels between cases
  const restore = async () => {
    const now = byName(await readTanks(page))
    if (Number(now[srcName].current_level) !== Number(src.current_level))
      await apiPut(page, `tanks/${src.name}/`, { current_level: src.current_level })
    if (Number(now[dstName].current_level) !== Number(dst.current_level))
      await apiPut(page, `tanks/${dst.name}/`, { current_level: dst.current_level })
  }

  const zero = await expectRefused('الكمية = صفر', 0)
  await restore()
  const neg = await expectRefused('كمية سالبة', -5)
  await restore()
  const short = await expectRefused('المصدر لا يحتمل الكمية', Number(src.current_level) + 5000)
  await restore()
  // destination is nearly full: only the capacity rule can refuse this one
  const cap = await expectRefused('تجاوز سعة الوجهة', QTY, async () => {
    await apiPut(page, `tanks/${dst.name}/`, { current_level: Number(dst.capacity) - 1000 })
  })
  await restore()
  const zeroOk = zero.refused
  const negOk = neg.refused
  const shortOk = short.refused
  const capOk = cap.refused
  const shortMsg = short.msg
  const capMsg = cap.msg
  // "لا صمت": a refusal the operator cannot see is a silent failure
  step('a backend refusal tells the operator WHY, in Arabic',
    /[\u0600-\u06FF]/.test(shortMsg) && /[\u0600-\u06FF]/.test(capMsg) && shortMsg !== '(no message)' && capMsg !== '(no message)',
    `source: «${shortMsg.slice(0, 70)}» · capacity: «${capMsg.slice(0, 70)}»`)

  // ---------- the valid same-fuel transfer ----------
  const beforeValid = (await transfers(page)).length
  await fillPair(page, stA, src.name, dst.name, QTY, 'تحويل بين خزانين من نفس الوقود')
  await page.locator('button[type="submit"]').first().click()
  await page.waitForTimeout(2500)
  const landed = page.url().includes('/inventory/transfers') && !page.url().includes('create')
  const listText = await bodyText(page)
  step('valid transfer saved and the list is shown', landed, page.url().replace(BASE, ''))
  step('the list names BOTH tanks', listText.includes(srcName) && listText.includes(dstName),
    (listText.match(/خزان أ بنزين \d[^\n]*/) || []).join(' | '))
  step('the list shows the transferred quantity', /5,000/.test(listText), '')

  const rows = await transfers(page)
  const mine = rows.filter((r) => r.station === stA)
  const rec = mine.find((r) => Number(r.quantity) === QTY && r.from_tank === src.name)
  const after = byName(await readTanks(page))
  step('a transfer record was persisted, owned by this station',
    !!rec && rec.station === stA && rec.to_tank === dst.name && rec.status === 'completed',
    rec ? `${rec.name} · ${rec.quantity} L · ${rec.status} · ${rec.fuel_type}` : 'NOT FOUND')
  step('rows increased by exactly one', rows.length === beforeValid + 1, `${beforeValid} → ${rows.length}`)
  step('source_new = source_old − quantity',
    Number(after[srcName].current_level) === Number(src.current_level) - QTY,
    `${src.current_level} − ${QTY} = ${after[srcName].current_level}`)
  step('destination_new = destination_old + quantity',
    Number(after[dstName].current_level) === Number(dst.current_level) + QTY,
    `${dst.current_level} + ${QTY} = ${after[dstName].current_level}`)
  step('the moved fuel type is the tanks’ own', rec && rec.fuel_type === src.fuel_type,
    `${rec && rec.fuel_type} / tanks ${src.fuel_type}`)

  appendRun('Transfer — invalid cases verdict', JSON.stringify({ zeroOk, negOk, shortOk, capOk }))
  appendRun('Transfer — closing levels', `${srcName}: ${after[srcName].current_level} · ${dstName}: ${after[dstName].current_level}`)

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
