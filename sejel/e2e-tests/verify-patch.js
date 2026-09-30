// Verify PATCH support: settlement mark-paid via UI button + delivery-request status workflow
const { launch, login, apiGet, nav, shot, step, summary } = require('./helpers')

;(async () => {
  const { browser, page } = await launch()
  step('UI: login', await login(page))
  const ST = 'r56gmqnon6'

  // ---------- settlement mark-paid via UI button ----------
  const settlements = (await apiGet(page, 'voucher-settlements/')).results || []
  const mySet = settlements.find(s => s.station === ST && s.status !== 'paid')
  step('DATA: unsettled settlement exists', !!mySet, mySet ? `${mySet.name} tv=${mySet.total_value} status=${mySet.status}` : 'none')
  if (mySet) {
    await nav(page, `finance/settlements/${mySet.name}`)
    await page.waitForTimeout(1000)
    const paidBtn = page.locator('button', { hasText: 'تحديد كمدفوع' })
    step('UI: mark-paid button visible', (await paidBtn.count()) > 0, '')
    await paidBtn.first().click()
    await page.waitForTimeout(1800)
    const after = await apiGet(page, `voucher-settlements/${mySet.name}/`)
    step('FIX: PATCH mark-paid works', after.status === 'paid', `status=${after.status} paid=${after.paid_amount}`)
    step('CHECK: paid_amount = total_value', Number(after.paid_amount) === Number(after.total_value), `paid=${after.paid_amount} tv=${after.total_value}`)
    const text = await page.locator('body').innerText()
    step('UI: detail shows مدفوعة badge', text.includes('مدفوعة'), '')
    await shot(page, '80-settlement-paid')
  }

  // ---------- delivery request status workflow via UI buttons ----------
  const reqs = (await apiGet(page, 'delivery-requests/')).results || []
  const myReq = reqs.find(r => r.station === ST && r.status === 'pending')
  step('DATA: pending request exists', !!myReq, myReq ? myReq.name : 'none')
  if (myReq) {
    await nav(page, `inventory/requests/${myReq.name}`)
    await page.waitForTimeout(1000)
    const approveBtn = page.locator('button', { hasText: 'موافقة' })
    step('UI: approve button visible', (await approveBtn.count()) > 0, '')
    await approveBtn.first().click()
    await page.waitForTimeout(1800)
    let after = await apiGet(page, `delivery-requests/${myReq.name}/`)
    step('FIX: PATCH approve works (pending → approved)', after.status === 'approved', 'status=' + after.status)
    // continue the workflow: dispatched → received
    await page.waitForTimeout(500)
    const dispatchBtn = page.locator('button', { hasText: 'تم الشحن' })
    if (await dispatchBtn.count()) {
      await dispatchBtn.first().click()
      await page.waitForTimeout(1500)
      after = await apiGet(page, `delivery-requests/${myReq.name}/`)
      step('UI: dispatch transition (approved → dispatched)', after.status === 'dispatched', 'status=' + after.status)
      const receiveBtn = page.locator('button', { hasText: 'تم الاستلام' })
      if (await receiveBtn.count()) {
        await receiveBtn.first().click()
        await page.waitForTimeout(1500)
        after = await apiGet(page, `delivery-requests/${myReq.name}/`)
        step('UI: receive transition (dispatched → received)', after.status === 'received', 'status=' + after.status)
      }
    }
    await shot(page, '81-request-workflow')
  }

  await browser.close()
  process.exit(summary() ? 1 : 0)
})().catch(e => { console.error('FATAL:', e.message.split('\n')[0]); process.exit(2) })
