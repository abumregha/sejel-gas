// Convert API errors into short, human-readable Arabic messages.
// Replaces the raw Python tracebacks that forms used to dump into error boxes.
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

const KNOWN = [
  // [Voucher Settlement, abc123]: reading_level, recorded_at
  [/MandatoryError[^:]*:\s*\[([^\]]+)\]/, (m) => {
    const fields = m[1].split(',').map(s => s.trim()).filter(Boolean)
    const labels = fields.map(f => FIELD_LABELS[f] || f).join('، ')
    return `يرجى تعبئة الحقول المطلوبة: ${labels}`
  }],
  [/LinkValidationError: Could not find ([^"\\\n]+)/, (m) => `قيمة غير صحيحة في الحقل: ${m[1]}`],
  [/ValidationError: Value for (\w+) cannot be a list/, () => 'قيمة حقل غير صحيحة — يرجى إعادة المحاولة'],
  [/DuplicateEntryError[^\]]*\[([^\]]+)\]/, (m) => `سجل مكرر: ${m[1]}`],
  [/PermissionError: ([^"\\\n]+)/, () => 'ليست لديك صلاحية لتنفيذ هذا الإجراء'],
  [/ValidationError: ([^"\\\n]+)/, (m) => m[1]],
  [/frappe\.exceptions\.(\w+)/, (m) => 'حدث خطأ غير متوقع، يرجى إعادة المحاولة'],
]

export function friendlyError(e) {
  const raw = e?.response?.data?.exc || e?.response?.data?.exception || e?.response?.data?.message || e?.message || ''
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw)
  for (const [re, fn] of KNOWN) {
    const m = text.match(re)
    if (m) return fn(m)
  }
  return 'حدث خطأ غير متوقع، يرجى إعادة المحاولة'
}
