<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة طلب توريد</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
        <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="t in filteredTanks" :key="t.name" :value="t.name">{{ t.tank_name }} ({{ t.fuel_type_name }} — {{ t.level_percent }}%)</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية المطلوبة (لتر)</label>
        <input v-model="form.requested_quantity" type="number" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
        <select v-model="form.priority" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="normal">عادي</option>
          <option value="urgent">عاجل</option>
          <option value="critical">حرج</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">السبب</label>
        <input v-model="form.reason" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="مثال: احتواء الخزان على 20%" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/inventory/requests" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const form = ref({ station: '', tank: '', requested_quantity: '', priority: 'normal', reason: '' })
const stations = ref([])
const tanks = ref([])
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
onMounted(async () => {
  const [sRes, tRes] = await Promise.all([api.get('/stations/'), api.get('/tanks/')])
  stations.value = sRes.data.results || sRes.data
  tanks.value = tRes.data.results || tRes.data
})
const save = async () => {
  // backend has no tank field: fuel_type is derived from the selected tank
  const tank = tanks.value.find(t => t.name === form.value.tank)
  const payload = {
    station: form.value.station,
    fuel_type: tank ? tank.fuel_type : '',
    requested_quantity: form.value.requested_quantity,
    priority: form.value.priority,
    reason: form.value.reason,
    current_level: tank ? Number(tank.current_level || 0) : undefined,
  }
  await api.post('/delivery-requests/', payload)
  router.push('/inventory/requests')
}
</script>
