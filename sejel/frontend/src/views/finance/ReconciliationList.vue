<template>
  <div>
    <h2 class="text-xl font-bold mb-6">التسويات المالية</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>المحطة</th><th>المبيعات المتوقعة</th><th>التحصيل</th><th>الفرق</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.name" class="cursor-pointer" @click="$router.push(`/finance/reconciliations/${r.name}`)">
            <td class="font-medium">{{ shiftMap[r.shift] || r.shift }}</td>
            <td>{{ stationMap[r.station] || r.station || '—' }}</td>
            <td class="font-mono">{{ Number(r.expected_sales || 0).toLocaleString() }}</td>
            <td class="font-mono">{{ Number(r.total_collection || 0).toLocaleString() }}</td>
            <td class="font-mono font-bold" :class="Number(r.difference) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ Number(r.difference || 0).toLocaleString() }}
            </td>
            <td>
              <span :class="r.status === 'confirmed' ? 'badge-green' : 'badge-yellow'" class="badge">
                {{ statusLabel(r.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تسويات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
const shiftMap = ref({})
const statusLabel = (s) => ({ confirmed: 'موثقة', draft: 'مسودة' }[s] || s || '—')

onMounted(async () => {
  const [rRes, sRes, shRes] = await Promise.all([api.get('/reconciliations/'), api.get('/stations/'), api.get('/shifts/')])
  items.value = rRes.data.results || rRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  shiftMap.value = Object.fromEntries((shRes.data.results || shRes.data).map(s => [s.name, s.shift_name]))
})
</script>
