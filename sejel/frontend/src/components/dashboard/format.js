// Shared display formatting for dashboard components (prompt §15: the SPA
// formats backend values but never recomputes them).

export function fmtNum(v, digits = 0) {
  if (v === null || v === undefined || v === '') return '—'
  return Number(v).toLocaleString('ar-LY', { maximumFractionDigits: digits })
}

export function fmtMoney(v) {
  if (v === null || v === undefined || v === '') return '—'
  return Number(v).toLocaleString('ar-LY', { maximumFractionDigits: 2 }) + ' د.ل'
}

export function fmtDateTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return String(v)
  return d.toLocaleString('ar-LY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function fmtTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (isNaN(d)) return String(v)
  return d.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
}
