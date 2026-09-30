<template>
  <div>
    <h2 class="text-xl font-bold mb-6">المخزون والتوريد</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <div v-for="tank in tanks" :key="tank.id"
        class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-bold">{{ tank.name }}</div>
            <div class="text-sm text-gray-500">{{ tank.fuel_type_name }} — {{ tank.station_name }}</div>
          </div>
          <div class="text-lg font-bold" :class="Number(tank.level_percent) <= 15 ? 'text-red-600' : 'text-green-600'">
            {{ tank.level_percent }}%
          </div>
        </div>
        <div class="mt-3">
          <div class="tank-bar h-4">
            <div class="tank-bar-fill" :style="{ width: tank.level_percent + '%', background: Number(tank.level_percent) <= 15 ? '#ef4444' : Number(tank.level_percent) <= 30 ? '#f59e0b' : '#22c55e' }"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>{{ Number(tank.current_level || 0).toLocaleString() }} لتر</span>
            <span>{{ Number(tank.capacity).toLocaleString() }} لتر</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Pending Requests -->
    <div class="bg-white rounded-xl shadow-sm border p-4 mb-6">
      <h3 class="font-bold mb-3">طلبات توريد معلقة</h3>
      <table v-if="requests.length" class="data-table">
        <thead><tr><th>المحطة</th><th>الخزان</th><th>الكمية</th><th>الأولوية</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id">
            <td>{{ r.station_name }}</td>
            <td>{{ r.tank_name }}</td>
            <td class="font-mono">{{ Number(r.requested_quantity).toLocaleString() }}</td>
            <td>{{ label(PRIORITY, r.priority) }}</td>
            <td>
              <span :class="r.status === 'received' ? 'badge-green' : 'badge-yellow'" class="badge">{{ label(REQUEST_STATUS, r.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="text-gray-400 text-sm text-center py-4">لا توجد طلبات معلقة</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import { label, PRIORITY, REQUEST_STATUS } from '../../utils/labels'
const tanks = ref([])
const requests = ref([])
onMounted(async () => {
  const [tRes, rRes] = await Promise.all([api.get('/tanks/'), api.get('/delivery-requests/?status=pending')])
  tanks.value = tRes.data.results || tRes.data
  requests.value = rRes.data.results || rRes.data
})
</script>
