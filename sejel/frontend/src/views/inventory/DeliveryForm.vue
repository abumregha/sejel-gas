<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة شحنة</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
        <select v-model="form.tank" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="t in filteredTanks" :key="t.id" :value="t.id">{{ t.name }} ({{ t.fuel_type_name }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الكمية المتوقعة (لتر)</label>
        <input v-model="form.expected_quantity" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">القراءة قبل</label>
          <input v-model="form.tank_reading_before" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">القراءة بعد</label>
          <input v-model="form.tank_reading_after" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/inventory/deliveries" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const form = ref({ station: '', tank: '', expected_quantity: '', tank_reading_before: '', tank_reading_after: '' })
const stations = ref([])
const tanks = ref([])
const filteredTanks = computed(() => form.value.station ? tanks.value.filter(t => t.station == form.value.station) : tanks.value)
onMounted(async () => {
  const [sRes, tRes] = await Promise.all([api.get('/stations/'), api.get('/tanks/')])
  stations.value = sRes.data.results || sRes.data
  tanks.value = tRes.data.results || tRes.data
})
const save = async () => { await api.post('/deliveries/', form.value); router.push('/inventory/deliveries') }
</script>
