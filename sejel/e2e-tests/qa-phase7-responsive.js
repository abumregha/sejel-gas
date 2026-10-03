// PHASE 7 — Responsive / layout sweep (QA prompt §19).
//
// The station employee is on a phone at the pump, and the supervisor on a laptop.
// Checked at three real widths:
//   390×844  iPhone-class phone (the pump)
//   1366×768 small laptop (supervisor)
//   1920×1080 desktop (owner/accountant)
//
// Automated checks per screen:
//   - horizontal overflow of the document (the classic mobile killer)
//   - any element wider than the viewport
//   - interactive controls below the 40px tap-target floor on mobile
//   - RTL sanity: Arabic content must not be clipped
const { appendRun, capture, uiLogin, shot, step, summary, launch } = require('./qa')

const BASE = 'http://localhost:8004'
const VIEWPORTS = [
  ['390x844', { width: 390, height: 844 }, 'phone'],
  ['1366x768', { width: 1366, height: 768 }, 'laptop'],
  ['1920x1080', { width: 1920, height: 1080 }, 'desktop'],
]
const SCREENS = [
  '/', '/readings', '/stations', '/shifts', '/shifts/day',
  '/finance/income', '/finance/reconciliations', '/reports/daily',
  '/inventory/deliveries', '/inventory/shortages', '/settings/users',
]

const measure = (page) => page.evaluate(() => {
  const vw = document.documentElement.clientWidth
  const doc = document.documentElement
  const scrollable = (el) => {
    // Walk up: content wider than the phone is acceptable ONLY if some
    // ancestor scrolls it (a bounded table scroller). Otherwise it is clipped
    // and unreachable — that is the real defect.
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX
      if (ox === 'auto' || ox === 'scroll') return true
    }
    return false
  }
  const overflowing = []
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > vw + 2 && r.height > 0 && getComputedStyle(el).overflowX !== 'auto'
        && getComputedStyle(el).overflowX !== 'scroll') {
      if (!scrollable(el)) {
        overflowing.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ').slice(0, 2).join('.')} w=${Math.round(r.width)}`)
      }
    }
  })
  const small = []
  document.querySelectorAll('button, a, input, select').forEach((el) => {
    if (el.type === 'checkbox' || el.type === 'radio') return
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.height > 0 && r.height < 40) {
      small.push(`${el.tagName.toLowerCase()} «${(el.innerText || el.value || '').trim().slice(0, 18)}» ${Math.round(r.width)}×${Math.round(r.height)}`)
    }
  })
  return {
    vw,
    scrollWidth: doc.scrollWidth,
    horizontalOverflow: doc.scrollWidth > vw + 2,
    overflowing: overflowing.slice(0, 6),
    smallTargets: small.slice(0, 8),
    smallCount: small.length,
  }
})

;(async () => {
  for (const [label, viewport, kind] of VIEWPORTS) {
    const { browser, page } = await launch({ viewport })
    capture(page)
    await uiLogin(page, 'owner@sejel.ly', 'owner123')
    appendRun('## Phase 7 — viewport ' + label + ' (' + kind + ')', '')

    for (const s of SCREENS) {
      await page.goto(BASE + s, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1500)
      const m = await measure(page)
      const ok = !m.horizontalOverflow && m.overflowing.length === 0
        && (kind !== 'phone' || m.smallCount === 0)
      step(`${label} ${s}`, ok,
        `overflow=${m.horizontalOverflow ? m.scrollWidth + '>' + m.vw : 'no'}` +
        (m.overflowing.length ? `, ${m.overflowing.length} clipped blocks` : '') +
        (kind === 'phone' && m.smallCount ? `, ${m.smallCount} small targets` : ''))
      appendRun('### ' + label + ' ' + s,
        `- document scrollWidth ${m.scrollWidth} vs viewport ${m.vw} → ` +
        (m.horizontalOverflow ? '**HORIZONTAL OVERFLOW**' : 'fits') +
        `\n- unreachable (clipped) blocks: ` + (m.overflowing.length ? m.overflowing.join(' | ') : '(none)') +
        `\n- controls under 40px tall: ${m.smallCount}` +
        (m.smallTargets.length ? `\n  - ` + m.smallTargets.join('\n  - ') : ''))
      await shot(page, `qa-phase7-${label}-${s === '/' ? 'home' : s.replace(/\//g, '-').replace(/^-/, '')}`)
    }
    await browser.close()
  }

  summary('qa-phase7-responsive')
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })