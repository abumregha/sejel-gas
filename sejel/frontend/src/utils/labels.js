// Arabic display labels for raw enum values stored in the DB (Q9).
// Raw English values must never reach the UI — always map through here.

export const STATION_STATUS = { active: 'نشطة', inactive: 'غير نشطة', maintenance: 'صيانة' }
export const RELATIONSHIP = { owned: 'ملكية', rented: 'إيجار', agency: 'وكالة', franchise: 'تنازل' }
export const CASH_MODE = { during_shift: 'أثناء المناوبة', end_of_shift: 'عند نهاية المناوبة' }
export const ISLAND_STATUS = { active: 'نشطة', inactive: 'غير نشطة' }
export const METER_STATUS = { active: 'نشطة', inactive: 'غير نشطة', maintenance: 'صيانة' }
export const EMPLOYEE_STATUS = { active: 'نشط', inactive: 'غير نشط' }

// Q6: the UI presents 4 primary shift states; internal secondary states
// (in_progress, under_review) map into them for display.
export const SHIFT_STATUS = {
  open: 'مفتوحة', in_progress: 'قيد التنفيذ', submitted: 'مقدمة',
  under_review: 'تحت المراجعة', closed: 'مغلقة', reconciled: 'موسّاة', cancelled: 'ملغاة',
}
export const SHIFT_STATUS_PRIMARY = {
  open: 'مفتوحة', in_progress: 'مفتوحة', submitted: 'مقدمة',
  under_review: 'مقدمة', closed: 'مغلقة', reconciled: 'موسّاة', cancelled: 'ملغاة',
}
export const SHIFT_BADGE = {
  open: 'badge-yellow', in_progress: 'badge-blue', submitted: 'badge-yellow',
  under_review: 'badge-blue', closed: 'badge-green', reconciled: 'badge-blue', cancelled: 'badge-gray',
}

export const PAYMENT_STATUS = { unpaid: 'غير مدفوعة', partial: 'مدفوعة جزئياً', paid: 'مدفوعة' }
export const DELIVERY_STATUS = { ordered: 'طلبية', received: 'مستلمة', claimed: 'مطالبة مقدمة', settled: 'تمت التسوية', closed: 'مغلقة' }
export const REQUEST_STATUS = { pending: 'معلقة', approved: 'معتمدة', dispatched: 'قيد التوريد', received: 'مستلمة', cancelled: 'ملغاة' }
export const CLAIM_STATUS = { not_claimed: 'غير مطالبة', claimed: 'مطالبة مقدمة', settled: 'تمت التسوية', closed: 'مغلقة' }
export const EXPENSE_STATUS = { pending: 'معلق', approved: 'معتمد', rejected: 'مرفوض', cancelled: 'ملغى' }
export const EXPENSE_METHOD = { cash: 'نقداً', voucher: 'قسائم', other: 'أخرى' }
export const SETTLEMENT_STATUS = { submitted: 'مقدمة', paid: 'مدفوعة', partial: 'جزئية', disputed: 'متنازع عليها', cancelled: 'ملغاة' }
export const RECON_STATUS = { draft: 'مسودة', confirmed: 'مؤكدة' }
export const DIFF_TYPE = { matched: 'مطابق', surplus: 'فائض', shortage: 'عجز' }
export const TRANSFER_STATUS = { pending: 'قيد الانتظار', completed: 'مكتملة', cancelled: 'ملغاة' }
export const READING_TYPE = { opening: 'افتتاحية', pre_delivery: 'قبل الشحنة', post_delivery: 'بعد الشحنة', daily: 'يومية', other: 'أخرى' }
export const PRIORITY = { normal: 'عادية', urgent: 'عاجلة' }

export function label(map, value) {
  if (value === null || value === undefined || value === '') return '—'
  return map[value] || value
}

// Arabic has three plural forms and templates cannot express them:
//   1 → singular, 2 → dual, 3–10 → «N plural», 11+ → «N singular» (the number
// is read as eleven/twelve/…). Rendering «تبقي 1 قراءات اليوم» is the kind of
// thing that makes an employee stop trusting the screen, so every counted
// phrase goes through here instead of an inline template.
//
//   arabicCount(2, { singular: 'قراءة واحدة', dual: 'قراءتان',
//                   plural: 'قراءات', accusative: 'قراءة' })
//     → 'قراءتان'
//   arabicCount(11, same) → '11 قراءة'
//
// `accusative` is the counted form used with numbers ≥ 11; when the singular is
// already a complete phrase («قراءة واحدة») it doubles as the 11+ form.
export function arabicCount(n, { singular, dual, plural, accusative }) {
  const v = Number(n) || 0
  if (v === 1) return singular
  if (v === 2) return dual
  if (v >= 3 && v <= 10) return `${v} ${plural}`
  return `${v} ${accusative || singular}`
}

// The most common counted noun in the app.
export const countReadings = (n) =>
  arabicCount(n, { singular: 'قراءة واحدة', dual: 'قراءتان', plural: 'قراءات', accusative: 'قراءة' })

export const countExceptions = (n) =>
  arabicCount(n, { singular: 'استثناء واحد', dual: 'استثناءان', plural: 'استثناءات', accusative: 'استثناء' })
