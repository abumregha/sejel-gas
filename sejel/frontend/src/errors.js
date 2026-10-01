// Convert API errors into short, human-readable Arabic messages.
//
// Frappe error body shapes (why the old version always said "حدث خطأ غير
// متوقع"): on a 417 the backend returns BOTH
//   exception: "Traceback ... frappe.exceptions.ValidationError: <real msg>"
//   exc:       '["Traceback ..."]'   ← JSON-stringified array, no usable text
// and on a 403 just exc_type: "PermissionError". The old chain checked `exc`
// FIRST (matches no regex) and only then `exception`, so the real Arabic
// message was never shown. We now read `exception` / `exc_type` first.
const FIELD_LABELS = {
  fuel_type: 'نوع الوقود', station: 'المحطة', tank: 'الخزان', shift: 'المناوبة',
  meter: 'العداد', employee: 'الموظف', amount: 'المبلغ', category: 'الفئة',
  submission_date: 'تاريخ التقديم', order_date: 'تاريخ الطلب', recorded_at: 'وقت التسجيل',
  reading_level: 'مستوى القراءة', requested_quantity: 'الكمية المطلوبة',
  expected_quantity: 'الكمية المتوقعة', island: 'الجزيرة', machine: 'المضخة',
  description: 'الوصف', definition_name: 'اسم التعريف', start_time: 'وقت البدء',
  end_time: 'وقت الانتهاء', days: 'الأيام', date: 'التاريخ', count: 'العدد',
  delivery: 'الشحنة', from_tank: 'من خزان', to_tank: 'إلى خزان', quantity: 'الكمية',
  pre_reading: 'القراءة قبل', post_reading: 'القراءة بعد', reason: 'السبب',
}

// DocType names appearing in LinkExistsError messages → Arabic labels
const LINK_DOCTYPE_AR = {
  Station: 'المحطة', Island: 'الجزيرة', Machine: 'المضخة', Meter: 'العداد',
  Tank: 'الخزان', Shift: 'دورة القراءة', 'Meter Reading': 'قراءة عداد',
  Reconciliation: 'التسوية المالية', Delivery: 'الشحنة', Employee: 'الموظف',
  'Shift Definition': 'تعريف مناوبة', 'Cash Collection': 'تحصيل نقدي',
  Voucher: 'قسيمة', 'POS Record': 'سجل نقاط بيع', Expense: 'مصروف',
  'Tank Reading': 'قراءة خزان', 'Tank Transfer': 'تحويل بين خزانات',
}

const stripHtml = (s) => String(s).replace(/<[^>]+>/g, '')
const firstLine = (s) => String(s).split('\\n')[0].split('\n')[0]

const KNOWN = [
  // [Voucher Settlement, abc123]: reading_level, recorded_at
  [/MandatoryError[^:]*:\s*\[([^\]]+)\]/, (m) => {
    const fields = m[1].split(',').map(s => s.trim()).filter(Boolean)
    const labels = fields.map(f => FIELD_LABELS[f] || f).join('، ')
    return `يرجى تعبئة الحقول المطلوبة: ${labels}`
  }],
  [/LinkValidationError: Could not find ([^"\\\n]+)/, (m) => `قيمة غير صحيحة في الحقل: ${stripHtml(m[1])}`],
  [/ValidationError: Value for (\w+) cannot be a list/, () => 'قيمة حقل غير صحيحة — يرجى إعادة المحاولة'],
  [/DuplicateEntryError[^\]]*\[([^\]]+)\]/, (m) => `سجل مكرر: ${stripHtml(m[1])}`],
  [/numeric field overflow|NumericValueOutOfRange|Out of range value|DataError/i,
    () => 'القيمة المُدخلة كبيرة جداً أو غير صالحة — تأكد من القراءة المكتوبة'],
]

function fromExcType(excType, text) {
  if (excType === 'AuthenticationError') {
    return 'انتهت صلاحية الجلسة — يرجى تسجيل الدخول من جديد'
  }
  if (excType === 'PermissionError') {
    return 'ليست لديك صلاحية لتنفيذ هذا الإجراء'
  }
  if (excType === 'LinkExistsError') {
    // "… because Station <a…>qputh5too5</a> is linked with Machine <a…>qpuhc0opir</a> "
    const pairs = [...text.matchAll(/is linked with ([A-Za-z ]+?)\s*<a[^>]*>([^<]+)<\/a>/g)]
      .map((m) => `${LINK_DOCTYPE_AR[m[1].trim()] || m[1].trim()} (${m[2]})`)
    const shown = pairs.slice(0, 3).join('، ')
    const more = pairs.length > 3 ? ` و${pairs.length - 3} سجلات أخرى` : ''
    if (pairs.length) {
      return `لا يمكن الحذف: هذا السجل مرتبط بـ ${shown}${more} — احذف السجلات المرتبطة به أولاً`
    }
    return 'لا يمكن الحذف: هذا السجل مرتبط بسجلات أخرى — احذف السجلات المرتبطة به أولاً'
  }
  if (excType === 'MandatoryError') {
    const m = text.match(/MandatoryError[^:]*:\s*\[([^\]]+)\]/)
    if (m) {
      const labels = m[1].split(',').map(s => FIELD_LABELS[s.trim()] || s.trim()).join('، ')
      return `يرجى تعبئة الحقول المطلوبة: ${labels}`
    }
    return 'يرجى تعبئة الحقول المطلوبة'
  }
  if (excType === 'DuplicateEntryError') return 'سجل مكرر — هذه البيانات محفوظة مسبقاً'
  if (excType === 'ValidationError' || excType === 'FrappeValidationError') {
    // real message is after "frappe.exceptions.ValidationError: " on its own line
    const m = text.match(/frappe\.exceptions\.(?:Frappe)?ValidationError:\s*([^\r\n]+)/)
    if (m) return stripHtml(firstLine(m[1])).trim()
  }
  if (excType === 'DataError' || excType === 'NumericValueOutOfRange') {
    return 'القيمة المُدخلة كبيرة جداً أو غير صالحة — تأكد من القراءة المكتوبة'
  }
  return null
}

export function friendlyError(e) {
  const data = e?.response?.data || {}
  const excType = data.exc_type || ''
  // `exception` (traceback string) carries the real message; `exc` is a
  // JSON-stringified array of the same traceback; last resort: axios message.
  let raw = data.exception || data.exc || data.message || e?.message || ''
  if (typeof raw !== 'string') {
    try { raw = JSON.stringify(raw) } catch { raw = String(raw) }
  }

  // 1) dispatch on the typed exception name first — most reliable
  const typed = fromExcType(excType, raw)
  if (typed) return typed

  // 2) regex table for messages embedded without exc_type (client-side, older shapes)
  for (const [re, fn] of KNOWN) {
    const m = raw.match(re)
    if (m) return fn(m)
  }

  // 3) any "frappe.exceptions.XxxError: message" line
  const generic = raw.match(/frappe\.exceptions\.\w+:\s*([^\r\n]+)/)
  if (generic) return stripHtml(firstLine(generic[1])).trim().substring(0, 300)

  return 'حدث خطأ غير متوقع، يرجى إعادة المحاولة'
}

export default friendlyError
