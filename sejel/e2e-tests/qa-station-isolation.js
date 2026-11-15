const { launch, login, goto, shot, step, summary, BASE } = require('./helpers')

;(async()=>{
  const {browser,page}=await launch({viewport:{width:1440,height:1000}})
  try{
    const ok = await login(page)
    step('login', ok, page.url())
    if(!ok) throw new Error('login failed')
    await page.waitForTimeout(1500)
    const url1 = page.url()
    step('redirected to station selection or app', url1.includes('select-station') || !url1.includes('login'), url1)
    await shot(page,'iso-01-after-login')

    // if on select station, pick first non-test real-ish station? pick محطة الراحلة 23 if present else first
    if(url1.includes('select-station')){
      await page.waitForTimeout(1000)
      const buttons = page.locator('button:has-text("محطة")')
      const count = await buttons.count()
      let picked = false
      for(let i=0;i<count;i++){
        const txt = await buttons.nth(i).innerText()
        if(txt.includes('الراحلة')){ await buttons.nth(i).click(); picked=true; break }
      }
      if(!picked && count>0) await buttons.first().click()
      await page.waitForTimeout(2000)
      step('station selected', !page.url().includes('select-station'), page.url())
      await shot(page,'iso-02-after-select')
    }

    // sidebar should have station selector
    const sidebarText = await page.locator('aside').innerText().catch(()=> '')
    step('sidebar shows current station context', sidebarText.includes('المحطة الحالية') || sidebarText.includes('المحطة:'), sidebarText.slice(0,120))
    await shot(page,'iso-03-dashboard')

    // dashboard should be single-station (no "جميع المحطات" aggregate option in header)
    const body = await page.locator('body').innerText()
    step('no aggregate all-stations selector in dashboard', !body.includes('جميع المحطات'), 'checked')

    // navigate to shipments list - should be scoped
    await goto(page,'inventory/shipment-schedules')
    await page.waitForTimeout(1500)
    await shot(page,'iso-04-shipments')
    step('shipments page loaded', page.url().includes('shipment-schedules'), page.url())

    // navigate to readings
    await goto(page,'readings')
    await page.waitForTimeout(1500)
    await shot(page,'iso-05-readings')
    const readingsText = await page.locator('body').innerText()
    step('readings has no local station picker prompt', !readingsText.includes('اختر محطة لعرض مسدساتها'), 'ok-if-station-selected')

    console.log('URL:', page.url())
  } catch(e){
    console.error('FATAL', e); step('fatal', false, e.message); try{await shot(page,'iso-fatal')}catch{}
  } finally { await browser.close() }
  const fails = summary(); process.exit(fails?1:0)
})()
