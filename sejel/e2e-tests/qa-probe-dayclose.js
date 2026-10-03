// QA probe: reproduce the day-close failure through the real UI.
// Purpose: QA-14 was recorded from a curl 500 (close_shift() missing 'name').
// Retest via curl found the endpoint working, so confirm what the UI actually does.
const Q = require('./qa')
const H = require('./helpers')

;(async () => {
  const { browser, page } = await Q.launch()
  Q.capture(page)

  const reqs = []
  page.on('response', async (r) => {
    const u = r.url()
    if (/\/api\/(shifts|reconciliations|fuel-summaries)/.test(u) && r.status() >= 400) {
      let body = ''
      try { body = (await r.text()).slice(0, 220) } catch (e) {}
      reqs.push(`${r.status()} ${r.request().method()} ${u.replace(Q.BASE2, '')}\n      ${body}`)
    }
  })

  await Q.uiLogin(page, 'owner@sejel.ly', 'owner123')

  // ---- 1. readings screen day-close (ReadingsView.closeDay) ----
  await Q.goto(page, '/readings')
  await page.waitForTimeout(1500)
  await Q.step('readings screen loaded', (await Q.bodyText(page)).includes('قراءات المضخات'))

  // pick the edge station (its day-close shift lnncpgf8lg is still open)
  const stationSelect = page.locator('[data-testid="readings-station"], select').first()
  if (await stationSelect.count()) {
    const opts = await stationSelect.locator('option').allTextContents()
    Q.step('stations offered: ' + JSON.stringify(opts), opts.length > 0)
    const idx = opts.findIndex((t) => t.includes('QA Edge'))
    if (idx >= 0) { await stationSelect.selectOption({ index: idx }); await page.waitForTimeout(1200) }
  }

  const closeBtn = page.locator('[data-testid="close-day"]')
  Q.step('close-day button present', (await closeBtn.count()) > 0)
  if (await closeBtn.count()) {
    await closeBtn.click()
    await page.waitForTimeout(4000)
    const t = await Q.bodyText(page)
    Q.step('outcome text: ' + JSON.stringify(
      ['تم إقفال اليوم وإنشاء التسوية المالية بنجاح', 'لم يتم بدء دورة إقفال']
        .map((s) => (t.includes(s) ? s : null)).filter(Boolean)[0] || t.slice(-260)),
      true)
    await Q.shot(page, 'qa-dayclose-ui')
  }

  // ---- 2. shifts list day-close (ShiftList.closeShift) ----
  await Q.goto(page, '/shifts')
  await page.waitForTimeout(1500)
  const shiftText = await Q.bodyText(page)
  Q.step('shifts screen lists a closed shift now: ' + shiftText.includes('مغلقة'), true)
  await Q.shot(page, 'qa-shifts-after-close')

  Q.appendRun('## Phase 4b probe — day close through the UI (retest of QA-14)',
    '\n### Network ≥400\n- ' + (reqs.length ? reqs.join('\n- ') : '(none)') + '\n')
  Q.appendRun('## Phase 4b console errors', (page.consoleErrors || []).slice(0, 12).join('\n') || '(none)')
  Q.appendRun('## Phase 4b network ≥400 (all)', (page.netFails || []).slice(0, 25).join('\n') || '(none)')

  Q.summary('qa-probe-dayclose')
  await browser.close()
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })