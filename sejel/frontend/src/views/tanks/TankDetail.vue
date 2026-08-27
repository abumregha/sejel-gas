<template>
  <div>
    <router-link to="/tanks" class="text-sm text-primary hover:underline mb-2 block">← الخزانات</router-link>
    <h2 class="text-xl font-bold mb-6">{{ tank?.name }}</h2>
    <div v-if="tank" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المحطة:</span> {{ tank.station_name }}</div>
          <div><span class="text-gray-500">النوع:</span> {{ tank.fuel_type_name }}</div>
          <div><span class="text-gray-500">السعة:</span> {{ Number(tank.capacity).toLocaleString() }} لتر</div>
          <div><span class="text-gray-500">الحالي:</span> {{ Number(tank.current_level || 0).toLocaleString() }} لتر</div>
        </div>
        <div class="mt-4">
          <div class="tank-bar h-6">
            <div class="tank-bar-fill" :style="{ width: tank.level_percent + '%', background: barColor(tank.level_percent) }"></div>
          </div>
          <div class="text-center text-lg font-bold mt-2" :class="levelColor(tank.level_percent)">{{ tank.level_percent }}%</div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">آخر القراءات</h3>
        <table class="data-table">
          <thead><tr><th>التاريخ</th><th>القراءة</th><th>النوع</th><th>المسجل</th></tr></thead>
          <tbody>
            <tr v-for="r in readings" :key="r.id">
              <td>{{ r.created_at }}</td>
              <td class="font-mono">{{ Number(r.reading).toLocaleString() }}</td>
              <td>{{ r.reading_type }}</td>
              <td>{{ r.recorded_by_name }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!readings.length" class="text-gray-400 text-sm text-center py-4">لا توجد قراءات</div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute()
const tank = ref(null)
const readings = ref([])
const barColor = (pct) => pct <= 15 ? '#ef4444' : pct <= 30 ? '#f59e0b' : '#22c55e'
const levelColor = (pct) => pct <= 15 ? 'text-red-600' : pct <= 30 ? 'text-yellow-600' : 'text-green-600'
onMounted(async () => {
  const [tRes, rRes] = await Promise.all([api.get(`/tanks/${route.params.id}/`), api.get(`/tank-readings/?tank=${route.params.id}`)])
  tank.value = tRes.data
  readings.value = rRes.data.results || rRes.data
})
</script>
