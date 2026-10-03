<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة تحويل بين الخزانات</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">من خزان</label>
        <select v-model="form.from_tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر الخزان</option>
          <option v-for="t in filteredTanks" :key="t.name" :value="t.name">{{ t.tank_name }} ({{ fuelTypeName(t.fuel_type) }} — {{ levelPct(t) }}%)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">إلى خزان</label>
        <select v-model="form.to_tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر الخزان</option>
          <option v-for="t in destinationTanks" :key="t.name" :value="t.name">{{ t.tank_name }} ({{ fuelTypeName(t.fuel_type) }})</option>
        </select>
        <!-- Fuel can only move between tanks holding the SAME fuel. This list
             used to offer every tank at the station, so an operator picked two
             incompatible tanks and only found out from a server rejection after
             filling in the whole form. -->
        <p v-if="fromTank && !destinationTanks.length" data-testid="no-compatible-tank" class="text-xs text-amber-600 mt-1">
          لا يوجد خزان آخر من فرع الوقود في هذه المحطة — أضف خزانًا ثانيًا من نوع الوقود نفسه
        </p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية (لتر)</label>
        <input v-model.number="form.quantity" type="number" step="0.001" min="1" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        <div v-if="fromTank" class="text-xs text-gray-500 mt-1">المتاح في الخزان: {{ Number(fromTank.current_level).toLocaleString('en-US') }} لتر</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">السبب</label>
        <input v-model="form.reason" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">{{ saving ? 'جاري الحفظ...' : 'حفظ' }}</button>
        <router-link to="/inventory/transfers" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter()
const error = ref('')
const saving = ref(false)
const form = ref({ station: '', from_tank: '', to_tank: '', quantity: '', reason: '' })
const stations = ref([])
const tanks = ref([])
const fuelTypes = ref([])
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
const fromTank = computed(() => tanks.value.find(t => t.name === form.value.from_tank))
// Only same-station, same-fuel tanks can receive the transfer (and never the
// source tank itself). Clearing the destination when the source changes keeps a
// now-invalid selection from being submitted.
const destinationTanks = computed(() => filteredTanks.value.filter(
  (t) => t.name !== form.value.from_tank && (!fromTank.value || t.fuel_type === fromTank.value.fuel_type),
))
watch(() => form.value.from_tank, () => {
  if (form.value.to_tank && !destinationTanks.value.some((t) => t.name === form.value.to_tank)) {
    form.value.to_tank = ''
  }
})
const fuelTypeName = (n) => (fuelTypes.value.find(f => f.name === n) || {}).fuel_name || n || '—'
const levelPct = (t) => Math.round((Number(t.current_level || 0) / Math.max(1, Number(t.capacity || 1))) * 100)

onMounted(async () => {
  const [sRes, tRes, fRes] = await Promise.all([api.get('/stations/'), api.get('/tanks/'), api.get('/fuel-types/')])
  stations.value = sRes.data.results || sRes.data
  tanks.value = tRes.data.results || tRes.data
  fuelTypes.value = fRes.data.results || fRes.data
})
const save = async () => {
  error.value = ''
  if (form.value.from_tank === form.value.to_tank) { error.value = 'لا يمكن التحويل لنفس الخزان'; return }
  saving.value = true
  try {
    const payload = {
      station: form.value.station,
      from_tank: form.value.from_tank,
      to_tank: form.value.to_tank,
      fuel_type: (fromTank.value || {}).fuel_type,
      quantity: Number(form.value.quantity),
      reason: form.value.reason || undefined,
      status: 'completed',
    }
    if (payload.reason === undefined) delete payload.reason
    await api.post('/tank-transfers/', payload)
    router.push('/inventory/transfers')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
