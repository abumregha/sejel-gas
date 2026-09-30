<template>
  <div class="max-w-3xl mx-auto">
    <router-link :to="`/shifts/${id}`" class="text-sm text-primary hover:underline mb-2 block">← المناوبة</router-link>
    <h2 class="text-xl font-bold mb-6">إضافة قراءات العدادات</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">تم الحفظ بنجاح</div>
    <form @submit.prevent="save" class="space-y-4">
      <div v-for="(r, idx) in readings" :key="idx"
        class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">العداد</label>
            <select v-model="r.meter" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option value="">اختر العداد</option>
              <option v-for="m in meters" :key="m.name" :value="m.name">{{ m.meter_code }} ({{ fuelMap[m.fuel_type] || '—' }})</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">قراءة الافتتاح</label>
            <input v-model.number="r.start_reading" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">قراءة الاختتام</label>
            <input v-model.number="r.end_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="تُملأ عند الإقفال" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">نوع الاستثناء (مطلوب عند فجوة القراءة)</label>
            <select v-model="r.exception_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option value="">لا يوجد</option>
              <option value="reset">تصفير العداد</option>
              <option value="replacement">استبدال العداد</option>
              <option value="other">سبب آخر</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات {{ r.exception_type ? '(السبب — مطلوب)' : '' }}</label>
            <input v-model="r.notes" :required="!!r.exception_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
          </div>
        </div>
        <p v-if="lastEndOf(r.meter) != null && r.start_reading !== '' && Number(r.start_reading) !== Number(lastEndOf(r.meter))" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
          ⚠️ قراءة الافتتاح لا تطابق آخر اختتام ({{ Number(lastEndOf(r.meter)).toLocaleString() }}) — اختر نوع الاستثناء واكتب السبب
        </p>
      </div>
      <div class="flex gap-2">
        <button type="button" @click="addRow" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">+ عداد آخر</button>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ القراءات' }}
        </button>
        <router-link :to="`/shifts/${id}`" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
const route = useRoute(), router = useRouter()
const id = route.params.id
const saving = ref(false)
const error = ref('')
const success = ref(false)
const meters = ref([])
const metersFull = ref([])
const fuelMap = ref({})
const readings = ref([{ meter: '', start_reading: '', end_reading: '', exception_type: '', notes: '' }])
const addRow = () => readings.value.push({ meter: '', start_reading: '', end_reading: '', exception_type: '', notes: '' })

// last end reading per meter (Meter.current_reading) — drives the gap warning
// and the continuity prefill at save time
const lastEndOf = (meterName) => {
  const m = metersFull.value.find(x => x.name === meterName)
  return m?.current_reading ?? null
}

onMounted(async () => {
  const { data: shift } = await api.get(`/shifts/${id}/`)
  const station = shift.station
  // Meter has no station field — resolve it via machine → island → station
  const [mRes, fRes, iRes, machRes] = await Promise.all([
    api.get('/meters/'), api.get('/fuel-types/'), api.get('/islands/'), api.get('/machines/')
  ])
  const islands = iRes.data.results || iRes.data
  const machines = machRes.data.results || machRes.data
  const islandOf = Object.fromEntries(machines.map(m => [m.name, m.island]))
  const stationOfMachine = Object.fromEntries(machines.map(m => {
    const isl = islands.find(i => i.name === m.island)
    return [m.name, isl ? isl.station : null]
  }))
  metersFull.value = (mRes.data.results || mRes.data)
  meters.value = metersFull.value.filter(m => stationOfMachine[m.machine] === station)
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name || f.fuel_type_name]))
})

const save = async () => {
  saving.value = true
  error.value = ''
  try {
    for (const r of readings.value) {
      // continuity: prefill start from the meter's last end reading
      const prev = lastEndOf(r.meter)
      const start = (r.start_reading === '' || r.start_reading == null) && prev != null ? prev : r.start_reading
      await api.post('/meter-readings/', {
        shift: id,
        meter: r.meter,
        start_reading: start,
        end_reading: r.end_reading || null,
        exception_type: r.exception_type || null,
        notes: r.notes
      })
    }
    router.push(`/shifts/${id}`)
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.exc || 'خطأ في حفظ القراءات'
    error.value = typeof msg === 'string' ? msg.replace(/<[^>]+>/g, '') : 'خطأ في حفظ القراءات'
  } finally { saving.value = false }
}
</script>
