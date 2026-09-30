<template>
  <div class="max-w-2xl mx-auto">
    <Toast ref="toast" />
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل العداد' : 'إضافة عداد' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المضخة</label>
        <select v-model="form.machine" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="m in machines" :key="m.name" :value="m.name">{{ m.machine_name }} ({{ stationMap[m.station] || m.station }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">كود العداد</label>
        <input v-model="form.meter_code" required placeholder="مثال: M01A" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
        <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
        <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="" disabled>اختر الخزان</option>
          <option v-for="t in tanks" :key="t.name" :value="t.name">{{ t.tank_name }} ({{ t.fuel_type_name || fuelMap[t.fuel_type] || t.fuel_type }})</option>
        </select>
        <p v-if="form.machine && tanks.length" class="text-xs text-gray-400 mt-1">يُفضل اختيار خزان بنفس نوع وقود العداد</p>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/stations" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
import Toast from '../../components/Toast.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter(), route = useRoute()
const auth = useAuthStore()
const isOwner = computed(() => auth.isOwner)
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const toast = ref(null)
const form = ref({ meter_code: '', machine: '', fuel_type: '', tank: '' })
const machines = ref([])
const fuelTypes = ref([])
const tanks = ref([])
const stationMap = ref({})
const fuelMap = ref({})

// Auto-suggest the tank matching the meter's fuel type
watch(() => form.value.fuel_type, (ft) => {
  if (!form.value.tank && ft) {
    const match = tanks.value.find(t => t.fuel_type === ft)
    if (match) form.value.tank = match.name
  }
})

onMounted(async () => {
  const params = route.query.station ? { station: route.query.station }
    : isOwner.value ? {} : { station: auth.stationId }
  const [mRes, fRes, tRes, sRes] = await Promise.all([
    api.get('/machines/', { params }),
    api.get('/fuel-types/'),
    api.get('/tanks/', { params }),
    api.get('/stations/'),
  ])
  machines.value = mRes.data.results || mRes.data
  fuelTypes.value = fRes.data.results || fRes.data
  tanks.value = tRes.data.results || tRes.data
  const stations = sRes.data.results || sRes.data
  stationMap.value = Object.fromEntries(stations.map(s => [s.name, s.station_name]))
  fuelMap.value = Object.fromEntries(fuelTypes.value.map(f => [f.name, f.fuel_name]))
  if (isEdit.value) {
    const { data: d } = await api.get(`/meters/${route.params.id}/`)
    form.value = { meter_code: d.meter_code, machine: d.machine, fuel_type: d.fuel_type, tank: d.tank || '' }
  }
})

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (isEdit.value) await api.put(`/meters/${route.params.id}/`, payload)
    else await api.post('/meters/', payload)
    toast.value.show('تم الحفظ بنجاح')
    const mach = machines.value.find(m => m.name === payload.machine)
    setTimeout(() => router.push(mach?.station ? `/stations/${mach.station}` : '/meters'), 800)
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.exc || 'خطأ في الحفظ'
    toast.value.show(typeof msg === 'string' ? msg.replace(/<[^>]+>/g, '').split('\n')[0].substring(0, 200) : 'خطأ في الحفظ', 'error')
  } finally { saving.value = false }
}
</script>
