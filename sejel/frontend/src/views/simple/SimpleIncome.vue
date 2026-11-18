<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">الإيرادات</h2>

    <div v-if="shiftNote" data-testid="simple-income-shift-note" class="text-xs text-gray-500 bg-white border border-gray-200 rounded-xl p-3">
      المناوبة: <b>{{ shiftNote }}</b> — تُحدد تلقائياً
    </div>

    <!-- Section 1: cash -->
    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <h3 class="font-bold text-gray-800 mb-3">نقداً</h3>
      <label class="block">
        <span class="text-xs text-gray-500">المبلغ (د.ل)</span>
        <input v-model.number="form.cash_amount" data-testid="simple-cash" type="number" min="0" step="0.01" inputmode="decimal"
          class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
      </label>
    </section>

    <!-- Section 2: coupons by denomination -->
    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <h3 class="font-bold text-gray-800 mb-3">كوبونات</h3>
      <div class="grid grid-cols-2 gap-3">
        <label v-for="d in [5, 6, 7, 8]" :key="d" class="block">
          <span class="text-xs text-gray-500">كوبون {{ d }} د.ل — العدد</span>
          <input v-model.number="form['coupon_' + d]" :data-testid="'simple-coupon-' + d" type="number" min="0" step="1" inputmode="numeric"
            class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
        </label>
      </div>
      <div v-if="couponTotal > 0" class="text-xs text-gray-500 mt-2 tabular-nums">إجمالي الكوبونات: {{ fmtMoney(couponTotal) }}</div>
    </section>

    <!-- Section 3: POS -->
    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <h3 class="font-bold text-gray-800 mb-3">دفع إلكتروني</h3>
      <div class="grid grid-cols-2 gap-3">
        <label class="block">
          <span class="text-xs text-gray-500">المبلغ (د.ل)</span>
          <input v-model.number="form.epayment_amount" data-testid="simple-pos-amount" type="number" min="0" step="0.01" inputmode="decimal"
            class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
        </label>
        <label class="block">
          <span class="text-xs text-gray-500">عدد المعاملات</span>
          <input v-model.number="form.epayment_count" data-testid="simple-pos-count" type="number" min="1" step="1" inputmode="numeric"
            class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
        </label>
      </div>
    </section>

    <div v-if="grandTotal > 0" class="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center text-sm font-semibold text-blue-900 tabular-nums">
      الإجمالي: {{ fmtMoney(grandTotal) }}
    </div>

    <button data-testid="simple-save-income" @click="save" :disabled="saving"
      class="w-full min-h-[60px] rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-50">
      {{ saving ? 'جاري الحفظ…' : 'حفظ الإيرادات' }}
    </button>
  </div>
</template>

<script setup>
// Simple Mode income — the shift is resolved automatically (the day-close
// container the readings screen already created); the operator only types
// amounts. The idempotent request_id retry logic is preserved exactly.
import { computed, reactive, ref, onMounted } from 'vue'
import api from '../../api'
import friendlyError from '../../errors'
import { useStationStore } from '../../stores/station'
import { useToast } from '../../composables/useToast'
import { fmtMoney } from '../../components/dashboard/format'

const stationStore = useStationStore()
const { show } = useToast()

const saving = ref(false)
const shiftName = ref('')
const shiftNote = ref('')

const form = reactive({
  cash_amount: '',
  coupon_5: '', coupon_6: '', coupon_7: '', coupon_8: '',
  epayment_amount: '',
  epayment_count: 1,
})

// request_id: same idempotency contract as IncomeEntry — kept across a partial
// failure so a retry can never double-post, regenerated on full success and
// whenever the shift changes. NOTE: use the same fallback generator as
// IncomeEntry; `crypto.randomUUID()` only exists in secure contexts, and the
// live site is served over plain HTTP (non-localhost), where it is undefined
// and would crash this whole screen on load.
const newRequestId = () =>
  `income-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
let requestId = newRequestId()
let shiftWatched = ''

const couponTotal = computed(() =>
  [5, 6, 7, 8].reduce((s, d) => s + (Number(form['coupon_' + d]) || 0) * d, 0))
const grandTotal = computed(() =>
  (Number(form.cash_amount) || 0) + couponTotal.value + (Number(form.epayment_amount) || 0))

async function resolveShift() {
  // Verified on the QA site (Phase 0 follow-up): POST /ensure-day-close/
  // creates the day's container with status "open" and returns it directly,
  // so no shift picker is needed. A closed day cannot take income.
  const { data: sh } = await api.post('/ensure-day-close/', {
    station: stationStore.currentStation,
    date: new Date().toISOString().slice(0, 10),
  })
  if (sh.closed || sh.status === 'closed') {
    shiftName.value = ''
    shiftNote.value = ''
    show('تم إقفال هذا اليوم — لا يمكن إضافة إيرادات إليه', 'error')
    return null
  }
  shiftName.value = sh.name
  shiftNote.value = sh.shift_name || sh.name
  return sh.name
}

async function save() {
  if (saving.value) return
  const total = grandTotal.value
  if (total <= 0) { show('أدخل مبلغاً واحداً على الأقل', 'error'); return }
  saving.value = true
  try {
    if (!shiftName.value || shiftWatched !== shiftName.value) {
      const name = await resolveShift()
      if (!name) return
      shiftWatched = name
      requestId = newRequestId()
    }
    const coupon_legs = [5, 6, 7, 8]
      .filter((d) => (Number(form['coupon_' + d]) || 0) > 0)
      .map((d) => ({ denomination: d, count: Number(form['coupon_' + d]) }))
    await api.post('/income/', {
      shift: shiftName.value,
      cash_amount: Number(form.cash_amount) || 0,
      coupon_legs,
      epayment_amount: Number(form.epayment_amount) || 0,
      epayment_count: Number(form.epayment_count) || 1,
      request_id: requestId,
    })
    show('تم حفظ الإيرادات بنجاح')
    form.cash_amount = ''
    form.coupon_5 = form.coupon_6 = form.coupon_7 = form.coupon_8 = ''
    form.epayment_amount = ''
    form.epayment_count = 1
    requestId = newRequestId()
  } catch (e) {
    // Keep the same request_id — retrying after a partial failure is safe.
    show(friendlyError(e) + ' — أعد المحاولة، لن يتم التسجيل مرتين', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Resolve the shift up front so the operator sees what they are posting to,
  // and so a missing/edge-case shift surfaces before they type.
  try { await resolveShift() } catch (e) { show(friendlyError(e), 'error') }
})
</script>
