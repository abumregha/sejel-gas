<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إدخال إيرادات المناوبة</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="legs.length" data-testid="income-legs" class="rounded-xl p-4 mb-4 text-sm border"
      :class="legsFailed ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-800'">
      <div class="font-bold mb-2">
        {{ legsFailed
          ? `تم حفظ ${legs.length - legsFailed} من ${legs.length} — الباقي لم يُحفظ`
          : 'تم الحفظ بنجاح' }}
      </div>
      <ul class="space-y-1">
        <li v-for="(l, i) in legs" :key="i" class="flex items-start gap-2">
          <span>{{ l.ok ? '✓' : '⚠' }}</span>
          <span>
            <strong>{{ l.label }}:</strong>
            {{ l.ok ? l.detail : l.detail }}
            <span v-if="!l.ok" class="block text-xs opacity-80">لم يُحفظ — أعّد إدخال المبلغ ثم أعد الحفظ</span>
          </span>
        </li>
      </ul>
    </div>

    <form @submit.prevent="save" class="space-y-4">
      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold mb-4">المناوبة</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
            <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option value="">اختر المحطة</option>
              <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">المناوبة</label>
            <select v-model="form.shift" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option value="">اختر المناوبة</option>
              <option v-for="s in openShifts" :key="s.name" :value="s.name">{{ s.shift_name }} ({{ s.date }})</option>
            </select>
            <!-- An operator who picks a station with no open shift used to see a
                 dropdown listing OTHER stations' shifts, and could book this
                 station's cash against a different station's shift. -->
            <p v-if="form.station && !openShifts.length" data-testid="no-open-shift" class="text-xs text-amber-600 mt-1">
              لا توجد مناوبة مفتوحة لهذه المحطة — افتح مناوبة من شاشة «يوم المحطة»
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold mb-4">المبيعات النقدية</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ل)</label>
          <input v-model.number="form.cash_amount" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="0.00" />
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold mb-4">مبيعات الكوبونات</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">5 د.ل</label>
            <input v-model.number="form.coupon_5" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_5 * 5).toLocaleString('en-US') }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">6 د.ل</label>
            <input v-model.number="form.coupon_6" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_6 * 6).toLocaleString('en-US') }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">7 د.ل</label>
            <input v-model.number="form.coupon_7" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_7 * 7).toLocaleString('en-US') }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">8 د.ل</label>
            <input v-model.number="form.coupon_8" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_8 * 8).toLocaleString('en-US') }} د.ل</div>
          </div>
        </div>
        <div class="mt-3 text-sm font-bold text-primary">إجمالي الكوبونات: {{ couponTotal.toLocaleString('en-US') }} د.ل</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold mb-4">المبيعات الإلكترونية</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ل)</label>
          <input v-model.number="form.epayment_amount" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="0.00" />
        </div>
        <!-- QA-12: this used to be hardcoded to 1, so every POS record in the
             site claimed exactly one card transaction and electronic-sales
             volumes (how many sales, average ticket) were unreportable. -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">عدد المعاملات الالكترونية</label>
          <input v-model.number="form.epayment_count" data-testid="epayment-count" type="number" step="1" min="1"
            class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="1" />
          <p class="text-xs text-gray-400 mt-1">اترك عدد المعاملات الإلكترونية في هذا اليوم — اترك عددها إذا مع المبلغ</p>
        </div>
      </div>

      <div class="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold">إجمالي الإيرادات</span>
          <span class="text-2xl font-bold text-primary">{{ grandTotal.toLocaleString('en-US') }} د.ل</span>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          نقد: {{ form.cash_amount.toLocaleString('en-US') }} | كوبونات: {{ couponTotal.toLocaleString('en-US') }} | إلكتروني: {{ form.epayment_amount.toLocaleString('en-US') }}
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" data-testid="save-income" :disabled="saving || !form.shift" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ الإيرادات' }}
        </button>
        <router-link to="/finance" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter()
const error = ref('')
const legs = ref([])
const legsFailed = computed(() => legs.value.filter((l) => !l.ok).length)
const saving = ref(false)
const form = ref({
  station: '', shift: '',
  cash_amount: 0,
  coupon_5: 0, coupon_6: 0, coupon_7: 0, coupon_8: 0,
  epayment_amount: 0,
  epayment_count: 1,
})
const stations = ref([])
const allShifts = ref([])
const voucherCategories = ref([])
// Only shifts belonging to the station chosen above. This list used to be
// every open shift in the site, so an operator picking one station could
// record its cash against a DIFFERENT station's shift — the postings would
// then land on that other station's day close.
const openShifts = computed(() => allShifts.value.filter(
  (s) => (!form.value.station || s.station === form.value.station)
    && (s.status === 'open' || s.status === 'in_progress'),
))
const couponTotal = computed(() => form.value.coupon_5 * 5 + form.value.coupon_6 * 6 + form.value.coupon_7 * 7 + form.value.coupon_8 * 8)
const grandTotal = computed(() => form.value.cash_amount + couponTotal.value + form.value.epayment_amount)

onMounted(async () => {
  try {
    // limit_page_length=0 is required: with the default page size the most
    // recent shifts fell off page 1, so today's open shift was simply absent
    // from the dropdown even when it existed.
    const [sRes, shRes, vcRes] = await Promise.all([
      api.get('/stations/'), api.get('/shifts/?limit_page_length=0'), api.get('/voucher-categories/'),
    ])
    stations.value = sRes.data.results || sRes.data
    allShifts.value = shRes.data.results || shRes.data
    voucherCategories.value = vcRes.data.results || vcRes.data
  } catch (e) { error.value = 'خطأ في تحميل البيانات' }
})

const money = (n) => `${Number(n || 0).toLocaleString('en-US')} د.ل`

// One save posts up to six rows across three legs (cash / coupons / electronic).
// Promise.all reported a single generic error if ANY leg failed, while the legs
// that had already succeeded were committed — so the operator was told
// "خطأ" with no way to tell which half of the day's money was recorded, and
// often re-entered the lot, double-posting the legs that had worked (QA-13).
//
// Each leg is now settled individually and reported by name. Only the legs that
// actually saved are cleared from the form, so a retry re-sends exactly the
// amounts that are still missing.
const save = async () => {
  error.value = ''
  legs.value = []
  if (!form.value.shift) { error.value = 'اختر المناوبة أولاً'; return }
  saving.value = true
  try {
    const now = new Date().toISOString()
    const posted = []
    if (form.value.cash_amount > 0) {
      posted.push({
        leg: 'cash', label: 'المبيعات النقدية',
        run: () => api.post('/cash-collections/', {
          shift: form.value.shift, amount: form.value.cash_amount, time: now,
        }),
        detail: money(form.value.cash_amount),
      })
    }
    const couponMap = [
      { key: 'coupon_5', value: 5 }, { key: 'coupon_6', value: 6 },
      { key: 'coupon_7', value: 7 }, { key: 'coupon_8', value: 8 },
    ]
    for (const cat of couponMap) {
      const count = Number(form.value[cat.key] || 0)
      if (count <= 0) continue
      const voucherCat = voucherCategories.value.find((vc) => Number(vc.value) === cat.value)
      if (!voucherCat) {
        // A missing category used to be skipped in silence: the operator counted
        // coupons that simply vanished.
        legs.value.push({
          ok: false, label: `كوبونات ${cat.value} د.ل`,
          detail: `لا يوجد فئة الكوبونات لهذا الفئة`,
        })
        continue
      }
      posted.push({
        leg: cat.key, label: `كوبونات ${cat.value} د.ل`,
        run: () => api.post('/vouchers/', {
          shift: form.value.shift, category: voucherCat.name,
          count, total_value: count * cat.value,
        }),
        detail: `${count} × ${cat.value} = ${money(count * cat.value)}`,
      })
    }
    if (form.value.epayment_amount > 0) {
      posted.push({
        leg: 'epayment', label: 'المبيعات الإلكترونية',
        run: () => api.post('/pos-records/', {
          shift: form.value.shift, total_amount: form.value.epayment_amount,
          transaction_count: Number(form.value.epayment_count) || 1,
        }),
        detail: `${money(form.value.epayment_amount)} (${Number(form.value.epayment_count) || 1} معاملة)`,
      })
    }
    if (!posted.length && !legs.value.length) {
      error.value = 'أدخل مبلغاً واحدًعلى أقلّ'
      saving.value = false
      return
    }

    const settled = await Promise.allSettled(posted.map((p) => p.run()))
    settled.forEach((r, i) => {
      legs.value.push({
        ok: r.status === 'fulfilled',
        label: posted[i].label,
        detail: posted[i].detail,
        error: r.status === 'rejected' ? friendlyError(r.reason) : '',
      })
    })

    // Clear only what landed. A leg that failed keeps its amount so a retry
    // does not double-post the ones that succeeded.
    const okLegs = new Set(legs.value.filter((l) => l.ok).map((l) => l.label))
    if (okLegs.has('المبيعات النقدية')) form.value.cash_amount = 0
    for (const cat of couponMap) {
      if (okLegs.has(`كوبونات ${cat.value} د.ل`)) form.value[cat.key] = 0
    }
    if (okLegs.has('المبيعات الإلكترونية')) form.value.epayment_amount = 0

    const failed = legs.value.filter((l) => !l.ok)
    if (failed.length) {
      error.value = `تعذّر حفظ ${failed.length} من البنود. تم حفظ الباقي — اضغط حفظ مرة أخرى لإكمال ما لم يُحفظ.`
    }
  } finally { saving.value = false }
}
</script>
