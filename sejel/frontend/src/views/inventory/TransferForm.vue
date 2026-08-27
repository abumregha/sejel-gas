<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة تحويل بين الخزانات</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">من خزان</label>
        <select v-model="form.from_tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="t in filteredTanks" :key="t.id" :value="t.id">{{ t.name }} ({{ t.fuel_type_name }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">إلى خزان</label>
        <select v-model="form.to_tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="t in filteredTanks" :key="t.id" :value="t.id">{{ t.name }} ({{ t.fuel_type_name }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية (لتر)</label>
        <input v-model="form.quantity" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">السبب</label>
        <input v-model="form.reason" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/inventory/transfers" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const form = ref({ station: '', from_tank: '', to_tank: '', quantity: '', reason: '' })
const stations = ref([])
const tanks = ref([])
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
onMounted(async () => {
  const [sRes, tRes] = await Promise.all([api.get('/stations/'), api.get('/tanks/')])
  stations.value = sRes.data.results || sRes.data
  tanks.value = tRes.data.results || tRes.data
})
const save = async () => {
  if (form.value.from_tank === form.value.to_tank) { alert('لا يمكن التحويل لنفس الخزان'); return }
  const payload = { ...form.value, fuel_type: tanks.value.find(t => t.id == form.value.from_tank)?.fuel_type }
  await api.post('/tank-transfers/', payload)
  router.push('/inventory/transfers')
}
</script>
