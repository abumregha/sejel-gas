// Verify NaN-view fixes: ReconciliationList/Detail, Dashboard, StationDetail (+ ShiftDetail recon block)
const { launch, login, apiGet, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))
  const ST = 'r56gmqnon6'
  const SH = 'r123ms6i2k' // closed shift with reconciliation r463353kk0 (expected 480 / collected 2500)

  // ---------- Reconciliation list ----------
  await nav(page, 'finance/reconciliations')
  await page.waitForTimeout(1000)
  let text = await page.locator('body').innerText()
  step('VIEW recon list: no NaN', !text.includes('NaN'), 'NaN×' + (text.match(/NaN/g) || []).length)
  step('VIEW recon list: shows values', text.includes('480') && text.includes('2,500'), '')
  await shot(page, '70-recon-list-fixed')

  // ---------- Reconciliation detail ----------
  const recons = (await apiGet(page, 'reconciliations/')).results || []
  const recon = recons.find(r => String(r.shift) === SH)
  if (recon) {
    await nav(page, `finance/reconciliations/${recon.name}`)
    await page.waitForTimeout(1000)
    text = await page.locator('body').innerText()
    step('VIEW recon detail: no NaN', !text.includes('NaN'), 'NaN×' + (text.match(/NaN/g) || []).length)
    step('VIEW recon detail: totals shown', text.includes('2,500') && text.includes('480'), '')
    step('VIEW recon detail: surplus label (فائض)', text.includes('فائض'), '')
    await shot(page, '71-recon-detail-fixed')
  }

  // ---------- Dashboard ----------
  await nav(page, '/')
  await page.waitForTimeout(1200)
  text = await page.locator('body').innerText()
  step('VIEW dashboard: no NaN', !text.includes('NaN'), '')
  const dash = await apiGet(page, 'dashboard/')
  step('CHECK: dashboard API stations count appears in UI', text.includes(String(dash.total_stations)), `api total_stations=${dash.total_stations}`)
  step('VIEW dashboard: recent shifts table has rows', text.includes('آخر المناوبات') && text.includes('2026-09-09'), '')
  step('VIEW dashboard: station summary cards', text.includes('محطة الاختبار'), '')
  await shot(page, '72-dashboard-fixed')

  // ---------- Station detail ----------
  await nav(page, `stations/${ST}`)
  await page.waitForTimeout(1000)
  text = await page.locator('body').innerText()
  step('VIEW station detail: islands listed', text.includes('جزيرة اختبار 1'), '')
  step('VIEW station detail: tanks listed with capacity', text.includes('خزان اختبار بنزين') && text.includes('50,000'), '')
  step('VIEW station detail: tank level percent shown', text.includes('87%'), '')
  await shot(page, '73-station-detail-fixed')

  // ---------- ShiftDetail recon block ----------
  await nav(page, `shifts/${SH}`)
  await page.waitForTimeout(1000)
  text = await page.locator('body').innerText()
  step('VIEW shift detail: recon block shows expected/collected', text.includes('التسوية المالية') && /(2[.,]500)/.test(text), '')
  await shot(page, '74-shift-detail-recon')

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
