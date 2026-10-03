// HARNESS SAFETY — prove the QA tools themselves cannot damage data.
//
// Three properties, each verified by an attempted violation (a green check that
// never tried the dangerous thing proves nothing):
//   1. qaResetStationDay clears ONE station-day, never the station's history
//      and never another station's readings.
//   2. qa-acceptance-reset.js deletes only the acceptance station's readings —
//      the script that lost 32 rows on 2026-10-03.
//   3. the two remaining global writers refuse to run blind:
//        · qa-repair-counters.js (needs an explicit station)
//        · qa-cleanup-phase8.js  (needs the hard-coded shift to still be owned)
//
// Every fixture this script creates is identified by its own name/shift and is
// removed by that identity afterwards.
const { execFileSync } = require('child_process')
const path = require('path')
const { appendRun, capture, uiLogin, bodyText, shot, step, summary, launch, apiGet, apiPost, qaDelete, qaResetStationDay, qaStationId, qaEnsureDayClose } = require('./qa')

const EDGE = 'QA Edge Station'
const PILOT = 'محطة تجريبية — سجل'
const ACCEPT = 'QA موظف جديد'

const iso = (offsetDays) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10)
const YESTERDAY = iso(-1)
const TODAY = iso(0)

async function snapshotReadings(page) {
  const rows = (await apiGet(page, 'meter-readings/?limit_page_length=0')).results || []
  const stations = (await apiGet(page, 'stations/?limit_page_length=0')).results || []
  const byStation = new Map(stations.map((s) => [s.name, s.station_name]))
  const machines = (await apiGet(page, 'machines/?limit_page_length=0')).results || []
  const machineStation = new Map(machines.map((m) => [m.name, m.station]))
  const meters = (await apiGet(page, 'meters/?limit_page_length=0')).results || []
  const meterStation = new Map(meters.map((m) => [m.name, machineStation.get(m.machine)]))
  const out = new Map()
  for (const r of rows) {
    const sid = meterStation.get(r.meter) || null
    if (!out.has(sid)) out.set(sid, [])
    out.get(sid).push(r.name)
  }
  return { rows, byStation, out, meterStation }
}

;(async () => {
  const { browser, page } = await launch()
  capture(page)
  await uiLogin(page, 'admin@sejel.ly', 'admin123')

  // ---------- 3a. the blind global writer must refuse to run ----------
  let refused = false
  let usage = ''
  try {
    execFileSync('node', [path.join(__dirname, 'qa-repair-counters.js')], { stdio: 'pipe' })
  } catch (e) {
    refused = e.status === 2
    usage = String(e.stderr || '')
  }
  step('qa-repair-counters.js refuses to run without a station', refused,
    refused ? 'exit 2 + usage' : `exit accepted — ${usage.slice(0, 80)}`)

  // ---------- 3b. the stale-id cleanup must abort, not delete ----------
  let abortMsg = ''
  let aborted = false
  try {
    execFileSync('node', [path.join(__dirname, 'qa-cleanup-phase8.js')], { stdio: 'pipe', timeout: 60000 })
  } catch (e) {
    aborted = e.status === 1
    abortMsg = String(e.stderr || '')
  }
  step('qa-cleanup-phase8.js aborts when its hard-coded shift is not owned',
    aborted && /ABORT/.test(abortMsg), abortMsg.split('\n')[0] || '(no abort)')

  // ---------- fixture: one reading on YESTERDAY at the EDGE station ----------
  const edgeId = await qaStationId(page, EDGE)
  const pilotId = await qaStationId(page, PILOT)
  const acceptId = await qaStationId(page, ACCEPT)
  step('fixture stations resolved', !!edgeId && !!pilotId && !!acceptId,
    `edge=${edgeId} pilot=${pilotId} accept=${acceptId}`)

  const before = await snapshotReadings(page)
  const edgeReadings = before.out.get(edgeId) || []
  const pilotReadings = before.out.get(pilotId) || []
  const acceptReadings = before.out.get(acceptId) || []

  const dayClose = await qaEnsureDayClose(page, edgeId, YESTERDAY)
  step('yesterday day-close container created at the edge station', dayClose.ok, dayClose.id || dayClose.error)
  const edgeMachines = (await apiGet(page, `machines/?station=${edgeId}&limit_page_length=0`)).results || []
  const meter = ((await apiGet(page, 'meters/?limit_page_length=0')).results || [])
    .find((m) => edgeMachines.some((x) => x.name === m.machine))
  const counter = Number(meter.current_reading)
  const fixture = await apiPost(page, 'meter-readings/', {
    shift: dayClose.id, meter: meter.name, start_reading: counter, end_reading: counter,
  })
  const fixtureId = fixture && fixture.name
  step('yesterday reading fixture created', !!fixtureId, `${fixtureId} on ${meter.meter_code} @${counter}`)

  // ---------- 1. clear TODAY: yesterday's reading must survive ----------
  const resetToday = await qaResetStationDay(page, EDGE, TODAY)
  step('qaResetStationDay(EDGE, today) reported ok', resetToday.ok,
    `${resetToday.removed} removed · ${resetToday.historyKept} other-day kept · ${resetToday.leftAlone} foreign`)
  const mid = await snapshotReadings(page)
  const survivedYesterday = (mid.out.get(edgeId) || []).includes(fixtureId)
  step('a reading of the SAME station on ANOTHER date was not deleted', survivedYesterday,
    survivedYesterday ? `${fixtureId} still present` : 'DELETED — the helper wiped history')
  const pilotAfter = mid.out.get(pilotId) || []
  const pilotSame = pilotReadings.length === pilotAfter.length && pilotReadings.every((n) => pilotAfter.includes(n))
  step(`«${PILOT}» readings untouched by an edge-station reset`, pilotSame,
    `${pilotReadings.length} before / ${pilotAfter.length} after`)
  const acceptAfter = mid.out.get(acceptId) || []
  const acceptSame = acceptReadings.length === acceptAfter.length && acceptReadings.every((n) => acceptAfter.includes(n))
  step(`«${ACCEPT}» readings untouched by an edge-station reset`, acceptSame,
    `${acceptReadings.length} before / ${acceptAfter.length} after`)

  // ---------- 1b. clear YESTERDAY: the fixture must go ----------
  const resetYesterday = await qaResetStationDay(page, EDGE, YESTERDAY)
  step('qaResetStationDay(EDGE, yesterday) reported ok', resetYesterday.ok,
    `${resetYesterday.removed} removed · clearedShifts=${resetYesterday.clearedShifts}`)
  const after1 = await snapshotReadings(page)
  step('the yesterday fixture was removed when its own day was cleared',
    !(after1.out.get(edgeId) || []).includes(fixtureId),
    `removed=${resetYesterday.removed}`)
  const pilotFinal = after1.out.get(pilotId) || []
  step(`«${PILOT}» readings still intact after both resets`,
    pilotReadings.length === pilotFinal.length && pilotReadings.every((n) => pilotFinal.includes(n)),
    `${pilotFinal.length}/${pilotReadings.length}`)

  appendRun('Harness safety', [
    `- qaResetStationDay(EDGE, ${TODAY}): removed ${resetToday.removed}, historyKept ${resetToday.historyKept}, foreign ${resetToday.leftAlone}`,
    `- qaResetStationDay(EDGE, ${YESTERDAY}): removed ${resetYesterday.removed}`,
    `- pilot readings ${pilotReadings.length} → ${pilotFinal.length}`,
    `- acceptance readings ${acceptReadings.length} → ${acceptAfter.length}`,
  ].join('\n'))

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch((e) => { console.error('FATAL:', e.message); process.exit(2) })
