<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة شحنة</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
        <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر الخزان</option>
          <option v-for="t in filteredTanks" :key="t.name" :value="t.name">{{ t.tank_name || t.name }} ({{ fuelTypeName(t.fuel_type) }})</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
          <input :value="fuelTypeName(form.fuel_type)" readonly class="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-600" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">رقم الفاتورة</label>
          <input v-model="form.invoice_number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="130167073" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الطلب</label>
          <input v-model="form.order_date" type="datetime-local" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الاستلام</label>
          <input v-model="form.arrival_date" type="datetime-local" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية المتوقعة (لتر)</label>
        <div class="flex gap-2 mb-2">
          <button type="button" @click="form.expected_quantity = 40000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.expected_quantity == 40000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">40,000</button>
          <button type="button" @click="form.expected_quantity = 20000" :class="['px-3 py-1.5 rounded-lg text-sm border transition', form.expected_quantity == 20000 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200']">20,000</button>
        </div>
        <input v-model.number="form.expected_quantity" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية المطلوبة (لتر)</label>
        <input v-model.number="form.requested_quantity" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">القراءة قبل</label>
          <input v-model.number="form.pre_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">القراءة بعد</label>
          <input v-model.number="form.post_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div v-if="receivedQty !== null" class="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
        <div class="flex justify-between"><span>الكمية المستلمة:</span><strong>{{ receivedQty.toLocaleString() }} لتر</strong></div>
        <div class="flex justify-between" :class="shortage > 0 ? 'text-red-600' : ''"><span>النقص:</span><strong>{{ shortage.toLocaleString() }} لتر</strong></div>
        <div v-if="shortage > 0" class="text-xs text-red-500 mt-1">يمكن إنشاء مطالبة نقص بعد الحفظ</div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/inventory/deliveries" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter()
const error = ref('')
const saving = ref(false)
const nowLocal = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
const form = ref({
  station: '', tank: '', fuel_type: '',
  requested_quantity: 40000, expected_quantity: 40000,
  invoice_number: '',
  order_date: nowLocal(), arrival_date: '',
  pre_reading: '', post_reading: '',
})
const stations = ref([])
const tanks = ref([])
const fuelTypes = ref([])
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
const fuelTypeName = (name) => (fuelTypes.value.find(f => f.name === name) || {}).fuel_name || name || '—'
// Auto-derive fuel_type from the selected tank (backend has no other source on this form)
watch(() => form.value.tank, () => {
  const t = tanks.value.find(x => x.name === form.value.tank)
  form.value.fuel_type = t ? t.fuel_type : ''
})
const receivedQty = computed(() => {
  if (form.value.pre_reading === '' || form.value.post_reading === '') return null
  const p = Number(form.value.pre_reading), q = Number(form.value.post_reading)
  return q >= p ? q - p : null
})
const shortage = computed(() => receivedQty.value === null ? 0 : Math.max(0, Number(form.value.expected_quantity || 0) - receivedQty.value))

onMounted(async () => {
  try {
    const [sRes, tRes, fRes] = await Promise.all([api.get('/stations/'), api.get('/tanks/'), api.get('/fuel-types/')])
    stations.value = sRes.data.results || sRes.data
    tanks.value = tRes.data.results || tRes.data
    fuelTypes.value = fRes.data.results || fRes.data
  } catch (e) { error.value = 'خطأ في تحميل البيانات' }
})
const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const toISO = (v) => v ? new Date(v).toISOString() : undefined
    const payload = {
      station: form.value.station,
      tank: form.value.tank,
      fuel_type: form.value.fuel_type,
      requested_quantity: Number(form.value.requested_quantity),
      expected_quantity: Number(form.value.expected_quantity),
      invoice_number: form.value.invoice_number || undefined,
      order_date: toISO(form.value.order_date),
      arrival_date: toISO(form.value.arrival_date),
      pre_reading: form.value.pre_reading === '' ? undefined : Number(form.value.pre_reading),
      post_reading: form.value.post_reading === '' ? undefined : Number(form.value.post_reading),
      // backend calculate_shortage() is not wired to validate(); compute per documented formula
      received_quantity: receivedQty.value === null ? undefined : receivedQty.value,
      shortage: receivedQty.value === null ? undefined : shortage.value,
    }
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k])
    await api.post('/deliveries/', payload)
    router.push('/inventory/deliveries')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
