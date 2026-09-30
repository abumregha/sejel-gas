<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">تعريفات المناوبات</h2>
      <router-link to="/shifts/definitions/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تعريف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>المحطة</th><th>الجزيرة</th><th>من</th><th>إلى</th><th>الأيام</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="d in items" :key="d.name">
            <td class="font-medium">{{ d.definition_name }}</td>
            <td>{{ stationMap[d.station] || d.station }}</td>
            <td>{{ islandMap[d.island] || '—' }}</td>
            <td class="font-mono">{{ d.start_time }}</td>
            <td class="font-mono">{{ d.end_time }}</td>
            <td>{{ formatDays(d.days) }}</td>
            <td class="flex gap-2">
              <router-link :to="`/shifts/definitions/${d.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(d)" class="text-red-500 text-sm">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تعريفات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
const islandMap = ref({})
const dayLabels = { sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' }
const formatDays = (days) => {
  // API returns a comma-separated string
  const list = Array.isArray(days) ? days : String(days || '').split(',').filter(Boolean)
  return list.map(d => dayLabels[d] || d).join('، ') || '—'
}

onMounted(async () => {
  const [defRes, sRes, iRes] = await Promise.all([api.get('/shift-definitions/'), api.get('/stations/'), api.get('/islands/')])
  items.value = defRes.data.results || defRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  islandMap.value = Object.fromEntries((iRes.data.results || iRes.data).map(i => [i.name, i.island_name]))
})

const remove = async (d) => {
  if (!confirm('حذف التعريف؟')) return
  await api.delete(`/shift-definitions/${d.name}/`)
  items.value = items.value.filter(x => x.name !== d.name)
}
</script>
