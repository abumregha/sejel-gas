// Round 3 / PART 9 — the exception matrix.
//
// Every way a meter reading can go wrong, driven against the running app
// with the station employee's own session. For each case the script states
// what SHOULD happen and then checks what the server actually did, so a
// regression is a red line with the real server message next to it.
//
//   usage: node qa-exceptions-matrix.js
//
// The readings are written to the isolated acceptance station only; every
// request names a meter that belongs to that station.
const { launch, uiLogin, step, summary, apiGet, qaResetStationDay, qaSeedCounters } = require('./qa')

const STATION = 'QA موظف جديد'
const iso = (d) => d.toISOString().slice(0, 10)
const yesterday = iso(new Date(Date.now() - 86400000))
const today = iso(new Date())

async function api(page, fn, arg) {
  return page.evaluate(fn, arg)
}

// One request helper that always speaks through the page session.
async function post(page, resource, body) {
  return page.evaluate(async ({ resource, body }) => {
    const me = await (await fetch('/api/auth/me/', { credentials: 'include' })).json()
    const csrf = (me.message || me).csrf_token
    const res = await fetch(`/api/${resource}/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Frappe-CSRF-Token': csrf },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    let j = {}
    try { j = JSON.parse(text) } catch { return { status: res.status, text: text.slice(0, 300) } }
    const msg = (j._server_messages && JSON.parse(j._server_messages)[0]) || null
    return {
      status: res.status,
      exception: j.exception || (msg && JSON.parse(msg).message) || '',
      doc: j.message || null,
    }
  }, { resource, body })
}

;(async () => {
  const { browser, page } = await launch()

  // ── a clean starting state ────────────────────────────────────────────────
  // The matrix writes real rows: yesterday's baseline, today's eight cases,
  // tomorrow's case 8b. A second run used to trip over its own history — every
  // baseline came back 417 «قراءة الافتتاح لا تطابق آخر قراءة اختتام», gun C
  // was no longer counter-less (so case 8 had nothing to test) and case 5 booked
  // 0 L because its counter had already been reset to 50 by the previous run.
  // Round 3's "re-runnable" claim never covered this suite; the bare `true`
  // baseline assertion (round 4) is what had been hiding it.
  //
  // Scope: qaResetStationDay's own dashboard-tree guard (station → island →
  // pump → meter) is what decides which readings are deleted, and this runs as
  // ADMIN because deleting a Reconciliation needs Administrator. Counters go
  // back to the fixture's own values so case 1 ("lower than previous") and
  // case 8 (counter-less gun) are both reachable again.
  const aCtx = await browser.newContext()
  const aPage = await aCtx.newPage()
  await uiLogin(aPage, 'admin@sejel.ly', 'admin123')
  const stationList = await apiGet(aPage, 'stations/')
  const mine = (stationList.results || []).find((s) => s.station_name === STATION)
  if (!mine) {
    console.log(`\n!! station «${STATION}» is missing — run qa-create-acceptance-station.js first`)
    await browser.close()
    return
  }
  const dayAfter = iso(new Date(Date.now() + 86400000))
  const resetLog = []
  let resetOk = true
  for (const d of [yesterday, today, dayAfter]) {
    const r = await qaResetStationDay(aPage, STATION, d)
    resetLog.push(`${d.slice(5)}: ${r.removed} reading(s), ${r.clearedShifts} shift(s)`)
    if (!r.ok) { resetOk = false; resetLog.push(...(r.problems || []).map((x) => '  ! ' + x)) }
  }
  const tree = await apiGet(aPage, `dashboard-station/?station=${encodeURIComponent(mine.name)}`)
  const ownGuns = []
  for (const isl of tree.islands || []) for (const mach of isl.machines || []) ownGuns.push(...(mach.meters || []))
  const FIXTURE = { A: 500000, B: 300000, C: 0 }
  const counters = {}
  for (const g of ownGuns) if (FIXTURE[g.gun_letter] !== undefined) counters[g.meter_code] = FIXTURE[g.gun_letter]
  const seed = await qaSeedCounters(aPage, STATION, counters)
  step('clean starting state restored (own records only)',
    resetOk && ownGuns.length === 3 && (seed.done || []).every((x) => x.includes('HTTP 200')),
    resetLog.join(' · ') + ' · ' + (seed.done || []).join(', '))
  await aCtx.close()

  await uiLogin(page, 'emp@sejel.ly', 'Sejel-QA-2026')

  // Resolve the acceptance station's own meters through the dashboard tree —
  // the only chain that cannot point at somebody else's hardware.
  const info = await page.evaluate(async ({ STATION, today }) => {
    const list = await (await fetch('/api/stations/', { credentials: 'include' })).json()
    const st = ((list.message || list).results || []).find((s) => (s.station_name || '').trim() === STATION)
    if (!st) return { error: `station «${STATION}» not found` }
    const d = await (await fetch(`/api/dashboard-station/?station=${st.name}&date=${today}`, { credentials: 'include' })).json()
    const j = d.message || d
    const meters = []
    for (const isl of j.islands || []) for (const mach of isl.machines || []) for (const m of mach.meters || []) {
      meters.push({ id: m.id, code: m.meter_code, current: m.current_reading })
    }
    return { station: st.name, meters }
  }, { STATION, today })

  if (info.error) throw new Error(info.error)
  step('resolved the acceptance station', info.meters.length === 3, `${info.meters.length} meters: ${info.meters.map((m) => m.code).join(', ')}`)
  const [gunA, gunB] = info.meters

  // A fresh day-close Shift for today, created through the app's own endpoint.
  const shift = await post(page, 'ensure-day-close', { station: info.station, date: today })
  if (shift.doc && shift.doc.closed) {
    console.log('\n!! today is already closed at the acceptance station — run qa-acceptance-reset.js first')
    await browser.close()
    return
  }
  const shiftName = shift.doc.name
  step('day-close container ready', !!shiftName, shiftName)

  // Baseline for yesterday so that "lower than previous" is meaningful.
  const yesterdayShift = await post(page, 'ensure-day-close', { station: info.station, date: yesterday })
  if (yesterdayShift.doc && !yesterdayShift.doc.closed) {
    // Only the guns that already have a counter get a baseline — the third gun
    // must stay untouched so case 8 has a genuine first reading to make.
    const posted = []
    for (const m of info.meters.filter((x) => Number(x.current))) {
      const base = m.code === gunA.code ? 500000 : 600000
      const r = await post(page, 'meter-readings', {
        shift: yesterdayShift.doc.name, meter: m.id, start_reading: 0, end_reading: base, source: 'manual',
      })
      posted.push(`${m.code}=${r.status}${r.exception ? ' ' + String(r.exception).slice(0, 40) : ''}`)
    }
    // was a bare `true` (round 4 audit) — a rejected POST passed this step
    step('baseline recorded for yesterday',
      posted.length > 0 && posted.every((x) => x.endsWith('200')), posted.join(' · ') + ' · target 500,000 / 600,000')
  }

  // The continuity check compares start_reading with the LAST END READING, so
  // the counter has to be re-read before every case — sending a value captured
  // once at page load produced a false failure in the first draft of this file.
  const counterOf = (meterId) => page.evaluate(async (id) => {
    const j = await (await fetch(`/api/meters/?limit_page_length=0`, { credentials: 'include' })).json()
    const all = (j.message || j).results || []
    return (all.find((m) => m.name === id) || {}).current_reading
  }, meterId)

  const read = async (gun, end, extra = {}) =>
    post(page, 'meter-readings', {
      shift: shiftName,
      meter: gun.id,
      start_reading: (await counterOf(gun.id)) ?? 0,
      end_reading: end,
      source: 'manual',
      ...extra,
    })

  console.log('\n──────── the matrix ────────')

  // 1 ─ lower than previous, nothing declared: must be refused WITH a way out.
  let r = await read(gunA, 1)
  step('1. reading below the previous one, no reason given', r.status >= 400,
    r.status >= 400 ? `refused: ${r.exception.split('\n')[0].slice(-70)}` : 'ACCEPTED — silent data corruption')

  // 2 ─ lower, an exception type, but no written reason.
  r = await read(gunA, 1, { exception_type: 'reset' })
  step('2. exception type given, reason left empty', r.status >= 400,
    r.status >= 400 ? `refused: ${r.exception.split('\n')[0].slice(-70)}` : 'ACCEPTED without a reason')

  // 3 ─ lower, a reason written, but no exception type.
  r = await read(gunA, 1, { notes: 'العدّاد انكسر' })
  step('3. reason written, exception type left empty', r.status >= 400,
    r.status >= 400 ? `refused: ${r.exception.split('\n')[0].slice(-70)}` : 'ACCEPTED without a type')

  // 4 ─ the correct way out: type AND reason.
  r = await read(gunA, 1, { exception_type: 'other', notes: 'العدّاد انكسر وتم تغييره' })
  step('4. lower reading declared as an exception with a reason', r.status < 400,
    r.status < 400 ? `saved ${r.doc.name}` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)

  // 5 ─ the same reading entered as a plain meter reset: litres are the value
  //      on the dial, because that is all that is knowable after a reset.
  r = await read(gunB, 50, { exception_type: 'reset', notes: 'تصفير العداد من شركة الصيانة' })
  const litres5 = r.doc && r.doc.liters_sold
  step('5. meter reset (تصفير) records the dial value as litres', r.status < 400 && Number(litres5) === 50,
    r.status < 400 ? `${litres5} L` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)

  // 6 ─ equal to the previous reading: a real day with no sales.
  const sameAsBefore = (await counterOf(gunB.id)) ?? 0
  r = await read(gunB, sameAsBefore)
  step('6. reading identical to the previous one is allowed (0 L day)', r.status < 400 && Number(r.doc && r.doc.liters_sold) === 0,
    r.status < 400 ? `saved, ${r.doc.liters_sold} L` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)

  // 7 ─ a decimal reading, the normal case on a real pump.
  r = await read(gunA, 501234.567, { exception_type: 'other', notes: 'تصحيح بعد مراجعة' })
  step('7. decimal meter reading keeps its precision', r.status < 400,
    r.status < 400 ? `saved ${r.doc.end_reading}` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)

  // 8 ─ a brand new gun with no history at all: the first reading must be a
  //      baseline that books nothing (QA-32). The acceptance station carries a
  //      third gun precisely for this — created once by the fixture, because
  //      Meter is deliberately not deletable through the API.
  const fresh = info.meters.find((m) => !Number(m.current))
  if (fresh) {
    r = await post(page, 'meter-readings', { shift: shiftName, meter: fresh.id, start_reading: 0, end_reading: 250000, source: 'manual' })
    step('8. first reading of a counter-less gun is a baseline, not a sale',
      r.status < 400 && Number(r.doc && r.doc.liters_sold) === 0 && (r.doc && r.doc.is_opening) === 1,
      r.status < 400 ? `${fresh.code}: is_opening=${r.doc.is_opening}, ${r.doc.liters_sold} L` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)

    // 8b ─ and the NEXT reading against that baseline books real litres, which
    //       is the whole point of the baseline.
    const later = await post(page, 'ensure-day-close', { station: info.station, date: iso(new Date(Date.now() + 86400000)) })
    if (later.doc && later.doc.name && !later.doc.closed) {
      r = await post(page, 'meter-readings', { shift: later.doc.name, meter: fresh.id, start_reading: 250000, end_reading: 262500, source: 'manual' })
      step('8b. the next reading against that baseline books real litres',
        r.status < 400 && Number(r.doc && r.doc.liters_sold) === 12500,
        r.status < 400 ? `${r.doc.liters_sold} L, is_opening=${r.doc.is_opening}` : `refused: ${r.exception.split('\n')[0].slice(-70)}`)
    } else {
      step('8b. the next reading against that baseline books real litres', false, 'could not open tomorrow’s cycle')
    }
  } else {
    step('8. first reading of a counter-less gun is a baseline, not a sale', false,
      'every gun at this station already has a counter — run qa-create-acceptance-station.js')
  }

  summary('qa-exceptions-matrix')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })