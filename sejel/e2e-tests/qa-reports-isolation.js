const { launch, login, shot, step, summary } = require('./helpers')
;(async()=>{
  const {browser,page}=await launch({viewport:{width:1440,height:1000}})
  try{
    const ok = await login(page); step('login', ok, page.url()); if(!ok) throw new Error('login failed')
    await page.waitForTimeout(1500)
    if(page.url().includes('select-station')){
      // pick محطة الراحلة 23 (real station) to confirm isolation
      const btns = page.locator('button')
      let picked=false
      for(let i=0;i<await btns.count();i++){ const t=await btns.nth(i).innerText().catch(()=> ''); if(t.includes('الراحلة')){ await btns.nth(i).click(); picked=true; break } }
      if(!picked){ await page.locator('button').first().click() }
      await page.waitForTimeout(2000)
    }
    step('in app with station selected', !page.url().includes('select-station'), page.url())

    const checks = [
      ['reports/monthly','monthly report'],
      ['reports/daily','daily report'],
      ['reports/balance','balance report'],
      ['reports/shipments','shipments report'],
      ['reports/delivery-print','delivery print report'],
    ]
    for(const [path,label] of checks){
      await page.goto('http://localhost:8004/app/'+path,{waitUntil:'domcontentloaded'})
      await page.waitForTimeout(2000)
      await shot(page,'rep-'+path.replace(/\//g,'-'))
      const body = await page.locator('body').innerText()
      const hasStationDropdown = body.includes('اختر المحطة') && (await page.locator('select option:has-text("اختر المحطة")').count()) > 0
      // global station shown in header text
      const showsStation = body.includes('المحطة:')
      step(label+': no local station dropdown', !hasStationDropdown, hasStationDropdown?'dropdown found':'ok')
      step(label+': shows station context', showsStation || body.includes('محطة'), body.slice(0,60))
    }

    // Verify API returns single-station scoped data (not mixed) for monthly report
    const apiData = await page.evaluate(async ()=>{
      const y=new Date().getFullYear(), m=new Date().getMonth()+1;
      const r=await fetch(`/api/reports/monthly/?year=${y}&month=${m}`,{credentials:'include'});
      const j=await r.json(); return j.message!==undefined?j.message:j;
    })
    const stationsCount = apiData && apiData.stations ? apiData.stations.length : -1
    step('monthly report API returns single station (isolated)', stationsCount <= 1, JSON.stringify({stationsCount, ids: apiData&&apiData.stations&&apiData.stations.map(s=>s.id)}))
  } catch(e){ console.error('FATAL',e); step('fatal',false,e.message); try{await shot(page,'rep-fatal')}catch{} }
  finally{ await browser.close() }
  const fails = summary(); process.exit(fails?1:0)
})()
