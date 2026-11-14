const { launch, login, goto, shot, step, summary, apiGet, apiPost, BASE } = require('./helpers')

const stationId = '98fdcjnjv0' // محطة اختبار ربط 147982
const uniq = Date.now().toString().slice(-6)

async function bodyText(page){ return page.locator('body').innerText() }
async function clickBtn(page, text){ const b=page.locator(`button:has-text("${text}")`).first(); await b.waitFor({state:'visible',timeout:15000}); await b.click() }
async function setByLabel(page, label, value, tagHint){ 
  const loc = page.locator(`xpath=//label[contains(normalize-space(.),"${label}")]/following::*[(self::input or self::select or self::textarea)][1]`).first()
  await loc.waitFor({state:'visible',timeout:10000})
  const tag = await loc.evaluate(n=>n.tagName.toLowerCase())
  if(tag==='select') await loc.selectOption(String(value)); else { await loc.fill(''); await loc.fill(String(value)) }
  return tag
}

;(async()=>{
  const {browser,page}=await launch({viewport:{width:1440,height:1100}})
  let depositName=null, schedMoney=null, schedNeg=null, deliveryNeg=null
  try{
    const ok = await login(page); step('login', ok, page.url()); if(!ok) throw new Error('login failed')

    // --- A) Non-zero money movement proof ---
    // 1. create deposit (100000) via UI
    await goto(page,'finance/deposits/create'); await page.waitForTimeout(1200)
    await page.locator('select').first().selectOption(stationId)
    const inv = `INV-MP-${uniq}`
    // fill invoice number - first visible text input in form
    const inputs = page.locator('form input[type="text"], form input:not([type])')
    await inputs.first().fill(inv)
    await page.locator('input[type="date"]').first().fill('2026-11-14')
    await page.locator('input[type="number"]').first().fill('100000') // deposit amount
    await shot(page,'mp-01-deposit-form')
    await clickBtn(page,'حفظ'); await page.waitForTimeout(2500)
    const deps = await apiGet(page, `station-deposits/?station=${encodeURIComponent(stationId)}`)
    const dep = (deps.results||deps||[]).find(d=>d.invoice_number===inv)
    depositName = dep && dep.name
    step('deposit created (100000)', !!depositName, depositName||inv)

    // 2. create scheduled shipment: qty 10000, unit price 5 => total 50000
    await goto(page, `inventory/shipments/create?station=${stationId}`); await page.waitForTimeout(1500)
    const schedBtn = page.locator('button:has-text("شحنة مجدولة")').first(); if(await schedBtn.count()) await schedBtn.click().catch(()=>{})
    await page.waitForTimeout(400)
    await page.locator('label:has-text("الفاتورة / الإيداع")').locator('..').locator('select').first().selectOption(depositName)
    await page.waitForTimeout(1200)
    await page.locator('label:has-text("الكمية")').locator('..').locator('input').first().fill('10000')
    const date = page.locator('label:has-text("تاريخ الشحن المتوقع")').locator('..').locator('input').first()
    if(await date.count()) await date.fill('2026-11-15')
    // ensure fuel selected
    const fuelSel = page.locator('label:has-text("نوع الوقود")').locator('..').locator('select').first()
    if(await fuelSel.count()){ const v=await fuelSel.inputValue(); if(!v){ const c=await fuelSel.locator('option').count(); if(c>1) await fuelSel.selectOption({index:1}) } }
    // open advanced for unit price
    const adv = page.locator('button:has-text("خيارات متقدمة")').first(); if(await adv.count()){ await adv.click().catch(()=>{}); await page.waitForTimeout(400) }
    const priceInput = page.locator('xpath=//label[contains(normalize-space(.),"سعر الشراء")]/following::input[1]').first()
    if(await priceInput.count()) await priceInput.fill('5')
    await page.waitForTimeout(400)
    const txt = await bodyText(page)
    step('money card/commitment visible', txt.includes('بيانات الإيداع'))
    step('total shows 50000 context', txt.includes('50,000') || txt.includes('50000'))
    await shot(page,'mp-02-schedule-money')
    await clickBtn(page,'حفظ'); await page.waitForTimeout(2500)
    const scheds = await apiGet(page, `shipment-schedules/?station=${encodeURIComponent(stationId)}`)
    const srow = (scheds.results||scheds||[]).find(s=>s.deposit===depositName && Number(s.total_amount)===50000)
      || (scheds.results||scheds||[]).find(s=>s.deposit===depositName)
    schedMoney = srow && srow.name
    step('schedule created (total 50000)', !!schedMoney && Number(srow.total_amount)===50000, JSON.stringify({name:schedMoney,total:srow&&srow.total_amount}))

    // 3. confirmed arrival
    if(schedMoney){
      await goto(page, `inventory/shipments/create?type=arrival&schedule=${schedMoney}`); await page.waitForTimeout(1800)
      const tankSel = page.locator('label:has-text("الخزان")').locator('..').locator('select').first()
      if(await tankSel.count()){ const opts=await tankSel.locator('option').count(); if(opts>1) await tankSel.selectOption({index:1}) }
      const adv2 = page.locator('button:has-text("خيارات متقدمة")').first(); if(await adv2.count()){ await adv2.click().catch(()=>{}); await page.waitForTimeout(400) }
      const pre = page.locator('label:has-text("القراءة قبل")').locator('..').locator('input').first()
      const post = page.locator('label:has-text("القراءة بعد")').locator('..').locator('input').first()
      if(await pre.count()) await pre.fill('200000'); if(await post.count()) await post.fill('210000')
      // ensure confirm checked
      const cbs = page.locator('input[type="checkbox"]'); const n=await cbs.count();
      for(let i=0;i<n;i++){ const lab=await cbs.nth(i).evaluate(el=> (el.closest('label')||el.parentElement||{}).innerText||''); if(lab.includes('تأكيد')){ if(!(await cbs.nth(i).isChecked().catch(()=>true))) await cbs.nth(i).check().catch(()=>{}) } }
      await shot(page,'mp-03-arrival-confirm')
      await clickBtn(page,'حفظ'); await page.waitForTimeout(4000)
      const schedDoc = await apiGet(page, `shipment-schedules/${schedMoney}/`)
      step('schedule delivered', schedDoc && schedDoc.status==='delivered', JSON.stringify({status:schedDoc&&schedDoc.status, delivery:schedDoc&&schedDoc.delivery}))
      const seList = await apiGet(page, 'stock-entries/')
      const seRows = seList.results||seList||[]
      const se = seRows.find(x=>x.shipment_schedule===schedMoney) || seRows.find(x=>x.source=== (schedDoc&&schedDoc.delivery))
      step('stock entry exists for money schedule', !!se, se?`${se.name} amt=${se.total_amount} src=${se.source}`:'none')
      if(se){
        const seDoc = await apiGet(page, `stock-entries/${se.name}/`)
        step('stock entry amount 50000 & submitted', Number(seDoc.total_amount)===50000 && seDoc.status==='submitted' && seDoc.entry_type==='delivery', JSON.stringify({amt:seDoc.total_amount,status:seDoc.status,type:seDoc.entry_type,station:seDoc.station,source:seDoc.source}))
      }
      const depDoc = await apiGet(page, `station-deposits/${depositName}/`)
      step('deposit allocated 50000', Number(depDoc.allocated_amount)===50000, JSON.stringify({alloc:depDoc.allocated_amount,balance:depDoc.balance,deposit:depDoc.deposit_amount}))
      step('deposit balance 50000', Number(depDoc.balance)===50000, JSON.stringify({alloc:depDoc.allocated_amount,balance:depDoc.balance}))
    }

    // --- B) Negative: unconfirmed arrival should not create SE / not mark delivered ---
    // create another schedule (small) to arrive without confirm
    await goto(page, `inventory/shipments/create?station=${stationId}`); await page.waitForTimeout(1500)
    const sb = page.locator('button:has-text("شحنة مجدولة")').first(); if(await sb.count()) await sb.click().catch(()=>{})
    await page.waitForTimeout(300)
    await page.locator('label:has-text("الفاتورة / الإيداع")').locator('..').locator('select').first().selectOption(depositName)
    await page.waitForTimeout(1000)
    await page.locator('label:has-text("الكمية")').locator('..').locator('input').first().fill('1000')
    const d2 = page.locator('label:has-text("تاريخ الشحن المتوقع")').locator('..').locator('input').first(); if(await d2.count()) await d2.fill('2026-11-16')
    const fs2 = page.locator('label:has-text("نوع الوقود")').locator('..').locator('select').first(); if(await fs2.count()){ const v=await fs2.inputValue(); if(!v){ const c=await fs2.locator('option').count(); if(c>1) await fs2.selectOption({index:1}) } }
    await clickBtn(page,'حفظ'); await page.waitForTimeout(2500)
    const s2 = await apiGet(page, `shipment-schedules/?station=${encodeURIComponent(stationId)}`)
    schedNeg = ((s2.results||s2||[]).find(x=>x.deposit===depositName && x.status==='scheduled' && x.name!==schedMoney && x.name!=='ac1797t69l')||{}).name
    step('negative-case schedule created', !!schedNeg, schedNeg||'none')

    if(schedNeg){
      await goto(page, `inventory/shipments/create?type=arrival&schedule=${schedNeg}`); await page.waitForTimeout(1800)
      const t2 = page.locator('label:has-text("الخزان")').locator('..').locator('select').first(); if(await t2.count()){ const opts=await t2.locator('option').count(); if(opts>1) await t2.selectOption({index:1}) }
      // uncheck confirm
      const cbs = page.locator('input[type="checkbox"]'); const n=await cbs.count();
      for(let i=0;i<n;i++){ const lab=await cbs.nth(i).evaluate(el=> (el.closest('label')||el.parentElement||{}).innerText||''); if(lab.includes('تأكيد')){ if(await cbs.nth(i).isChecked().catch(()=>false)) await cbs.nth(i).uncheck().catch(()=>{}); else await cbs.nth(i).click().catch(()=>{}); await page.waitForTimeout(200); if(await cbs.nth(i).isChecked().catch(()=>false)) await cbs.nth(i).click().catch(()=>{}) } }
      await shot(page,'mp-04-unconfirmed')
      await clickBtn(page,'حفظ'); await page.waitForTimeout(3500)
      const sd = await apiGet(page, `shipment-schedules/${schedNeg}/`)
      const seAll = await apiGet(page, 'stock-entries/'); const seRows=(seAll.results||seAll||[])
      const seNeg = seRows.find(x=>x.shipment_schedule===schedNeg)
      step('unconfirmed arrival: schedule not delivered', sd && sd.status!=='delivered', JSON.stringify({status:sd&&sd.status,delivery:sd&&sd.delivery}))
      step('unconfirmed arrival: no stock entry', !seNeg, seNeg?seNeg.name:'none')
    }

    // --- C) Negative: unscheduled-only delivery should not create Stock Entry ---
    await goto(page, 'inventory/shipments/create?type=delivery'); await page.waitForTimeout(1500)
    // pick station, tank, fuel implied by tank, quantity, dates
    const stSel = page.locator('label:has-text("المحطة")').locator('..').locator('select').first()
    if(await stSel.count()) await stSel.selectOption(stationId).catch(()=>{})
    await page.waitForTimeout(600)
    const tk = page.locator('label:has-text("الخزان")').locator('..').locator('select').first()
    if(await tk.count()){ const opts=await tk.locator('option').count(); if(opts>1) await tk.selectOption({index:1}) }
    const qtyU = page.locator('label:has-text("الكمية")').locator('..').locator('input').first(); if(await qtyU.count()) await qtyU.fill('5000')
    const now = new Date(); const pad=n=>String(n).padStart(2,'0'); const dt=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T10:00`
    const arr = page.locator('label:has-text("تاريخ الاستلام الفعلي")').locator('..').locator('input').first(); if(await arr.count()) await arr.fill(dt)
    // mark unscheduled if checkbox exists (in advanced/template) - try to find checkbox labeled غير مجدول/غير مجدولة
    const adv3 = page.locator('button:has-text("خيارات متقدمة")').first(); if(await adv3.count()){ await adv3.click().catch(()=>{}); await page.waitForTimeout(300) }
    const labels = page.locator('label'); const lc = await labels.count();
    for(let i=0;i<lc;i++){ const t=await labels.nth(i).innerText().catch(()=> ''); if(t.includes('غير مجدول')){ const cb=labels.nth(i).locator('input[type="checkbox"]').first(); if(await cb.count() && !(await cb.isChecked().catch(()=>false))) await cb.check().catch(()=>{}) } }
    await shot(page,'mp-05-unscheduled')
    // count SEs before
    const before = (await apiGet(page,'stock-entries/')); const bRows=(before.results||before||[]); const bCount=bRows.length
    await clickBtn(page,'حفظ'); await page.waitForTimeout(3000)
    const after = (await apiGet(page,'stock-entries/')); const aRows=(after.results||after||[]); const aCount=aRows.length
    // find created delivery for this station today-ish with no schedule
    const dels = await apiGet(page, `deliveries/?station=${encodeURIComponent(stationId)}`)
    const drows = (dels.results||dels||[]).filter(d=>!d.shipment_schedule)
    const latestUnscheduled = drows[0]
    deliveryNeg = latestUnscheduled && latestUnscheduled.name
    step('unscheduled delivery saved', !!deliveryNeg, deliveryNeg||'none')
    const seForDel = aRows.find(x=>x.source===deliveryNeg)
    step('unscheduled-only delivery: no stock entry created', !seForDel && aCount===bCount, JSON.stringify({delivery:deliveryNeg,bCount,aCount,linkedSE: seForDel?seForDel.name:null}))

    console.log('\n--- context ---')
    console.log(JSON.stringify({stationId,depositName,inv,schedMoney,schedNeg,deliveryNeg},null,2))
  } catch(e){
    console.error('FATAL', e); step('fatal', false, e && e.message); try{ await shot(page,'mp-fatal') }catch{}
  } finally { await browser.close() }
  const fails = summary(); process.exit(fails?1:0)
})()
