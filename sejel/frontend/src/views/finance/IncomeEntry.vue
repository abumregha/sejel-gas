<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إدخال إيرادات المناوبة</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">تم الحفظ بنجاح</div>

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
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_5 * 5).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">6 د.ل</label>
            <input v-model.number="form.coupon_6" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_6 * 6).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">7 د.ل</label>
            <input v-model.number="form.coupon_7" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_7 * 7).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">8 د.ل</label>
            <input v-model.number="form.coupon_8" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
            <div class="text-xs text-gray-400 mt-1">{{ (form.coupon_8 * 8).toLocaleString() }} د.ل</div>
          </div>
        </div>
        <div class="mt-3 text-sm font-bold text-primary">إجمالي الكوبونات: {{ couponTotal.toLocaleString() }} د.ل</div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold mb-4">المبيعات الإلكترونية</h3>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ل)</label>
          <input v-model.number="form.epayment_amount" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="0.00" />
        </div>
      </div>

      <div class="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div class="flex justify-between items-center">
          <span class="text-lg font-bold">إجمالي الإيرادات</span>
          <span class="text-2xl font-bold text-primary">{{ grandTotal.toLocaleString() }} د.ل</span>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          نقد: {{ form.cash_amount.toLocaleString() }} | كوبونات: {{ couponTotal.toLocaleString() }} | إلكتروني: {{ form.epayment_amount.toLocaleString() }}
        </div>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="saving || !form.shift" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
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
const success = ref(false)
const saving = ref(false)
const form = ref({
  station: '', shift: '',
  cash_amount: 0,
  coupon_5: 0, coupon_6: 0, coupon_7: 0, coupon_8: 0,
  epayment_amount: 0,
})
const stations = ref([])
const openShifts = ref([])
const voucherCategories = ref([])
const couponTotal = computed(() => form.value.coupon_5 * 5 + form.value.coupon_6 * 6 + form.value.coupon_7 * 7 + form.value.coupon_8 * 8)
const grandTotal = computed(() => form.value.cash_amount + couponTotal.value + form.value.epayment_amount)

onMounted(async () => {
  try {
    const [sRes, shRes, vcRes] = await Promise.all([api.get('/stations/'), api.get('/shifts/'), api.get('/voucher-categories/')])
    stations.value = sRes.data.results || sRes.data
    const allShifts = shRes.data.results || shRes.data
    openShifts.value = allShifts.filter(s => s.status === 'open' || s.status === 'in_progress')
    voucherCategories.value = vcRes.data.results || vcRes.data
  } catch (e) { error.value = 'خطأ في تحميل البيانات' }
})

const save = async () => {
  error.value = ''
  success.value = false
  if (!form.value.shift) { error.value = 'اختر المناوبة أولاً'; return }
  saving.value = true
  try {
    const now = new Date().toISOString()
    const entries = []
    if (form.value.cash_amount > 0) {
      entries.push(api.post('/cash-collections/', {
        shift: form.value.shift,
        amount: form.value.cash_amount,
        time: now,
        // received_by is set server-side to the logged-in user
      }))
    }
    const couponMap = [
      { count: form.value.coupon_5, value: 5 },
      { count: form.value.coupon_6, value: 6 },
      { count: form.value.coupon_7, value: 7 },
      { count: form.value.coupon_8, value: 8 },
    ]
    for (const cat of couponMap) {
      if (cat.count > 0) {
        const voucherCat = voucherCategories.value.find(vc => vc.value === cat.value)
        if (voucherCat) {
          entries.push(api.post('/vouchers/', {
            shift: form.value.shift,
            category: voucherCat.name,
            count: cat.count,
            total_value: cat.count * cat.value,
          }))
        }
      }
    }
    if (form.value.epayment_amount > 0) {
      entries.push(api.post('/pos-records/', {
        shift: form.value.shift,
        total_amount: form.value.epayment_amount,
        transaction_count: 1,
      }))
    }
    if (entries.length === 0) { error.value = 'أدخل مبلغاً واحداً على الأقل'; saving.value = false; return }
    await Promise.all(entries)
    success.value = true
    form.value.cash_amount = 0
    form.value.coupon_5 = 0; form.value.coupon_6 = 0; form.value.coupon_7 = 0; form.value.coupon_8 = 0
    form.value.epayment_amount = 0
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
