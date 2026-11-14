// Browser QA for deposit↔shipment wiring: create station via wizard, then deposit->schedule->confirmed arrival.
// Run: cd /root/projects/Sejel/sejel/e2e-tests && node qa-deposit-wiring-browser.js
const { launch, login, goto, nav, shot, step, summary, apiGet, BASE } = require('./helpers')
const fs = require('fs')

const uniq = Date.now().toString().slice(-6)
const stationName = `محطة اختبار ربط ${uniq}`
let stationId = null
let depositName = null
let scheduleName = null
let deliveryName = null

async function waitIdle(page, ms = 700) { await page.waitForTimeout(ms) }

async function clickButton(page, text) {
  const btn = page.locator(`button:has-text("${text}")`).first()
  await btn.waitFor({ state: 'visible', timeout: 15000 })
  await btn.click()
}

async function fillLabeled(page, label, value) {
  const el = page.locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::*[(self::input or self::select or self::textarea)][1]`).first()
  await el.waitFor({ state: 'visible', timeout: 10000 })
  const tag = await el.evaluate(n => n.tagName.toLowerCase())
  if (tag === 'select') await el.selectOption(String(value))
  else await el.fill(String(value))
}

;(async () => {
  const { browser, page } = await launch({ viewport: { width: 1440, height: 1100 } })
  try {
    const ok = await login(page)
    step('login as admin', ok, page.url())
    if (!ok) throw new Error('login failed')

    // --- 1) Create station via setup wizard ---
    await goto(page, 'stations/setup-wizard')
    await waitIdle(page, 1200)
    step('wizard opened', page.url().includes('setup-wizard'), page.url())
    await shot(page, 'dw-01-wizard')

    // step 1: station info
    await page.locator('input').first().fill(stationName) // station name
    await waitIdle(page, 300)
    await clickButton(page, 'التالي')
    await waitIdle(page, 700)
    await shot(page, 'dw-02-wizard-step2')

    // step 2: islands/machines - keep defaults, proceed
    await clickButton(page, 'التالي')
    await waitIdle(page, 700)
    await shot(page, 'dw-03-wizard-step3')

    // step 3: tanks - ensure fuel type/capacity filled (defaults usually set)
    // fill first tank capacity if empty
    const capInputs = page.locator('input[type="number"]')
    const capCount = await capInputs.count()
    for (let i = 0; i < capCount; i++) {
      const inp = capInputs.nth(i)
      const val = await inp.inputValue().catch(()=>'')
      const placeholder = await inp.getAttribute('placeholder').catch(()=>'')
      if (placeholder === '0') continue // opening level optional
      if (!val) await inp.fill('30000').catch(()=>{})
    }
    // ensure fuel type selected on first tank select in step 3
    const tankSelects = page.locator('div:has-text("نوع الوقود") select')
    if (await tankSelects.count()) {
      const sel = tankSelects.first()
      const opts = await sel.locator('option').allTextContents()
      if (opts.length > 1) {
        const cur = await sel.inputValue()
        if (!cur) await sel.selectOption({ index: 1 }).catch(()=>{})
      }
    }
    await clickButton(page, 'التالي')
    await waitIdle(page, 900)
    await shot(page, 'dw-04-wizard-review')

    // step 4: create
    await clickButton(page, 'إنشاء المحطة')
    await page.waitForTimeout(5000)
    await shot(page, 'dw-05-wizard-done')
    const doneText = await page.locator('body').innerText()
    const created = doneText.includes('تم إنشاء المحطة بنجاح') || doneText.includes('✅')
    step('station created via wizard', created, stationName)

    // find station id by name via API in page context
    const stations = await apiGet(page, 'stations/')
    const list = stations.results || stations || []
    const st = list.find(s => (s.station_name || '') === stationName)
    stationId = st ? st.name : null
    step('test station found', !!stationId, stationId || 'not found')
    if (!stationId) throw new Error('station not found after wizard')

    // --- 2) Create deposit for station (UI) ---
    await goto(page, 'finance/deposits/create')
    await waitIdle(page, 1200)
    // select station
    const stationSel = page.locator('select').first()
    await stationSel.selectOption(stationId)
    const inv = `INV-DW-${uniq}`
    await page.locator('input').nth(0).fill(inv) // invoice number (first text input after selects? safer by order in form)
    // fill date
    const dateInputs = page.locator('input[type="date"]')
    if (await dateInputs.count()) await dateInputs.first().fill('2026-11-14')
    // fill amount
    const numInputs = page.locator('input[type="number"]')
    if (await numInputs.count()) await numInputs.first().fill('500000')
    await shot(page, 'dw-06-deposit-form')
    await clickButton(page, 'حفظ')
    await page.waitForTimeout(2500)
    await shot(page, 'dw-07-after-deposit-save')
    const depList = await apiGet(page, `station-deposits/?station=${encodeURIComponent(stationId)}`)
    const deps = depList.results || depList || []
    const dep = deps.find(d => (d.invoice_number || '') === inv)
    depositName = dep ? dep.name : null
    step('deposit created (UI)', !!depositName, depositName || JSON.stringify(deps).slice(0,120))

    // --- 3) Create scheduled shipment against deposit (UI) ---
    await goto(page, `inventory/shipments/create?station=${stationId}`)
    await waitIdle(page, 1500)
    await shot(page, 'dw-08-shipment-form')
    // ensure schedule type
    const schedBtn = page.locator('button:has-text("شحنة مجدولة")').first()
    if (await schedBtn.count()) await schedBtn.click().catch(()=>{})
    await waitIdle(page, 500)
    // select deposit
    const depSelect = page.locator('label:has-text("الفاتورة / الإيداع")').locator('..').locator('select').first()
    if (await depSelect.count()) {
      await depSelect.selectOption(depositName)
      await waitIdle(page, 1200)
    }
    // quantity & unit price
    const qty = page.locator('label:has-text("الكمية")').locator('..').locator('input').first()
    if (await qty.count()) await qty.fill('10000')
    const price = page.locator('label:has-text("سعر الوحدة")').locator('..').locator('input').first()
    if (await price.count()) await price.fill('10')
    await waitIdle(page, 600)
    const bodyText = await page.locator('body').innerText()
    const hasMoneyCard = bodyText.includes('بيانات الإيداع') || bodyText.includes('المحجوز')
    step('money card visible on schedule form', hasMoneyCard)
    await shot(page, 'dw-09-schedule-filled')
    await clickButton(page, 'حفظ')
    await page.waitForTimeout(2500)
    const scheds = await apiGet(page, `shipment-schedules/?station=${encodeURIComponent(stationId)}`)
    const srows = scheds.results || scheds || []
    const sched = srows.find(s => s.deposit === depositName || s.invoice_number === inv)
    scheduleName = sched ? sched.name : (srows[0] && srows[0].name)
    step('scheduled shipment created', !!scheduleName, scheduleName || 'none')

    // --- 4) Record arrival and confirm (UI) ---
    if (scheduleName) {
      await goto(page, `inventory/shipments/create?type=arrival&schedule=${scheduleName}`)
      await waitIdle(page, 1800)
      await shot(page, 'dw-10-arrival-form')
      // select tank
      const tankSel = page.locator('label:has-text("الخزان")').locator('..').locator('select').first()
      if (await tankSel.count()) {
        const opts = await tankSel.locator('option').count()
        if (opts > 1) await tankSel.selectOption({ index: 1 })
      }
      // open advanced for readings if button exists
      const adv = page.locator('button:has-text("خيارات متقدمة")').first()
      if (await adv.count()) { await adv.click().catch(()=>{}); await waitIdle(page, 400); }
      // fill readings
      const pre = page.locator('label:has-text("القراءة قبل")').locator('..').locator('input').first()
      const post = page.locator('label:has-text("القراءة بعد")').locator('..').locator('input').first()
      if (await pre.count()) await pre.fill('100000')
      if (await post.count()) await post.fill('110000')
      // ensure confirm checked
      const confirmCb = page.locator('input[type="checkbox"]').last()
      if (await confirmCb.count()) {
        const checked = await confirmCb.isChecked().catch(()=>true)
        if (!checked) await confirmCb.check().catch(()=>{})
      }
      await shot(page, 'dw-11-arrival-filled')
      await clickButton(page, 'حفظ')
      await page.waitForTimeout(3500)
      await shot(page, 'dw-12-after-arrival-save')

      // verify schedule delivered + stock entry
      const schedAfter = await apiGet(page, `shipment-schedules/${scheduleName}/`)
      step('schedule delivered after confirmed arrival', schedAfter && schedAfter.status === 'delivered', JSON.stringify({status: schedAfter && schedAfter.status, delivery: schedAfter && schedAfter.delivery}))
      deliveryName = schedAfter && schedAfter.delivery
      const ses = await apiGet(page, `stock-entries/?shipment_schedule=${encodeURIComponent(scheduleName)}`)
      const seRows = ses.results || ses || []
      const se = seRows[0]
      step('stock entry created for arrival', !!se, se ? `${se.name} type=${se.entry_type} amt=${se.total_amount}` : 'none')
      if (se && se.name) {
        const seDoc = await apiGet(page, `stock-entries/${se.name}/`)
        step('stock entry submitted with correct source', seDoc && seDoc.status === 'submitted' && seDoc.source === deliveryName, JSON.stringify({status: seDoc && seDoc.status, source: seDoc && seDoc.source, delivery: deliveryName}))
      }
      const depAfter = await apiGet(page, `station-deposits/${depositName}/`)
      const alloc = depAfter && (depAfter.allocated_amount || depAfter.balance !== undefined)
      step('deposit reflects allocation/balance fields', !!alloc, depAfter ? `allocated=${depAfter.allocated_amount} balance=${depAfter.balance}` : 'no doc')
    }

    console.log('\n--- context ---')
    console.log(JSON.stringify({ stationName, stationId, depositName, scheduleName, deliveryName }, null, 2))
  } catch (e) {
    console.error('FATAL', e)
    step('fatal', false, e.message)
    try { await shot(page, 'dw-fatal') } catch {}
  } finally {
    await browser.close()
  }
  const fails = summary()
  process.exit(fails ? 1 : 0)
})()
