// Shared display formatting for dashboard components (prompt §15: the SPA
// formats backend values but never recomputes them).
//
// Libyan number style (client request 2026-10-01): Western digits with COMMA
// for thousands and DOT for fractions — e.g. 3,280,418.5. The old ar-LY
// locale produced Arabic separators (٫ / ٬) which the client rejected.
// Dates keep Arabic month names but force Latin digits (nu-latn).

export function fmtNum(v, digits = 0) {
  if (v === null || v === undefined || v === '') return '—'
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: digits })
}

export function fmtMoney(v) {
  if (v === null || v === undefined || v === '') return '—'
  return Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' د.ل'
}

export function fmtDateTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return String(v)
  return d.toLocaleString('ar-LY-u-nu-latn', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function fmtTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return String(v)
  return d.toLocaleTimeString('ar-LY-u-nu-latn', { hour: '2-digit', minute: '2-digit' })
}
