<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">قراءات الخزانات</h2>
      <button @click="showAdd = !showAdd" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة قراءة</button>
    </div>
    <form v-if="showAdd" @submit.prevent="saveReading" class="bg-white rounded-xl shadow-sm border p-4 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
      <select v-model="newReading.tank" required class="border border-gray-300 rounded-lg px-3 py-2">
        <option v-for="t in tanks" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
      <input v-model="newReading.reading" type="number" step="0.001" placeholder="القراءة" required class="border border-gray-300 rounded-lg px-3 py-2" />
      <select v-model="newReading.reading_type" class="border border-gray-300 rounded-lg px-3 py-2">
        <option value="daily">يومية</option>
        <option value="opening">افتتاحية</option>
        <option value="pre_delivery">قبل التوريد</option>
        <option value="post_delivery">بعد التوريد</option>
      </select>
      <button type="submit" class="bg-primary text-white rounded-lg px-4 py-2">حفظ</button>
    </form>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>الخزان</th><th>القراءة</th><th>النوع</th><th>المسجل</th></tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.id">
            <td>{{ r.created_at }}</td>
            <td>{{ r.tank_name }}</td>
            <td class="font-mono">{{ Number(r.reading).toLocaleString() }}</td>
            <td>{{ r.reading_type }}</td>
            <td>{{ r.recorded_by_name || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد قراءات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const tanks = ref([])
const showAdd = ref(false)
const newReading = ref({ tank: '', reading: '', reading_type: 'daily' })
onMounted(async () => {
  const [rRes, tRes] = await Promise.all([api.get('/tank-readings/'), api.get('/tanks/')])
  items.value = rRes.data.results || rRes.data
  tanks.value = tRes.data.results || tRes.data
})
const saveReading = async () => {
  await api.post('/tank-readings/', newReading.value)
  showAdd.value = false
  const { data } = await api.get('/tank-readings/')
  items.value = data.results || data
  newReading.value = { tank: '', reading: '', reading_type: 'daily' }
}
</script>
