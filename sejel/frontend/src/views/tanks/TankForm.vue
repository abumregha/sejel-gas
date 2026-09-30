<template>
  <div class="max-w-2xl mx-auto">
    <Toast ref="toast" />
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل الخزان' : 'إضافة خزان' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم الخزان</label>
        <input v-model="form.tank_name" required placeholder="مثال: خزان 1 (بنزين)" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
        <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">السعة (لتر)</label>
        <input v-model="form.capacity" type="number" min="1" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المستوى الحالي (لتر)</label>
        <input v-model="form.current_level" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link :to="backTo" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
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
const backTo = computed(() => (form.value.station ? `/stations/${form.value.station}` : '/tanks'))
const form = ref({ tank_name: '', station: '', fuel_type: '', capacity: '', current_level: '' })
const stations = ref([])
const fuelTypes = ref([])

onMounted(async () => {
  const [fRes, sRes] = await Promise.all([api.get('/fuel-types/'), api.get('/stations/')])
  fuelTypes.value = fRes.data.results || fRes.data
  stations.value = sRes.data.results || sRes.data
  if (route.query.station) form.value.station = route.query.station
  else if (!isOwner.value && auth.stationId) form.value.station = auth.stationId
  if (isEdit.value) {
    const { data: d } = await api.get(`/tanks/${route.params.id}/`)
    form.value = { tank_name: d.tank_name, station: d.station, fuel_type: d.fuel_type, capacity: d.capacity, current_level: d.current_level }
  }
})

const save = async () => {
  saving.value = true
  try {
    const payload = { ...form.value, current_level: Number(form.value.current_level) || 0 }
    if (isEdit.value) await api.put(`/tanks/${route.params.id}/`, payload)
    else await api.post('/tanks/', payload)
    toast.value.show('تم الحفظ بنجاح')
    setTimeout(() => router.push(backTo.value), 800)
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.exc || 'خطأ في الحفظ'
    toast.value.show(typeof msg === 'string' ? msg.replace(/<[^>]+>/g, '').split('\n')[0].substring(0, 200) : 'خطأ في الحفظ', 'error')
  } finally { saving.value = false }
}
</script>
