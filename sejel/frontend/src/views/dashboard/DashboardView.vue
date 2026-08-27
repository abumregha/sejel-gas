<template>
  <div>
    <h2 class="text-xl font-bold mb-6">لوحة التحكم</h2>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="kpi-card">
        <div class="kpi-label">المحطات</div>
        <div class="kpi-value">{{ data?.stations_count || 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">مناوبات اليوم</div>
        <div class="kpi-value">{{ data?.total_shifts_today || 0 }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">لترات اليوم</div>
        <div class="kpi-value">{{ formatNum(data?.total_liters_today) }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">تحصيل اليوم (د.ل)</div>
        <div class="kpi-value">{{ formatNum(data?.total_collections_today) }}</div>
      </div>
    </div>

    <!-- Tank Alerts -->
    <div v-if="data?.tank_alerts?.length" class="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
      <h3 class="font-bold text-red-800 mb-3">⚠️ تنبيهات الخزانات</h3>
      <div v-for="alert in data.tank_alerts" :key="alert.id" class="text-sm text-red-700 py-1">
        {{ alert.tank_name }} — {{ alert.alert_type_display }}
      </div>
    </div>

    <!-- Recent Shifts -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 class="font-bold mb-4">آخر المناوبات</h3>
      <div v-if="data?.recent_shifts?.length" class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المحطة</th>
              <th>الجزيرة</th>
              <th>المناوب</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shift in data.recent_shifts" :key="shift.id"
              class="cursor-pointer hover:bg-gray-50" @click="$router.push(`/shifts/${shift.id}`)">
              <td>{{ shift.date }}</td>
              <td>{{ shift.station_name }}</td>
              <td>{{ shift.island_name || '—' }}</td>
              <td>{{ shift.employee_name || '—' }}</td>
              <td>
                <span :class="shift.status === 'closed' ? 'badge-green' : 'badge-yellow'" class="badge">
                  {{ shift.status === 'closed' ? 'مغلقة' : 'نشطة' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center text-gray-400 py-8">لا توجد مناوبات حديثة</div>
    </div>

    <!-- Station Summary -->
    <div v-if="data?.stations_summary?.length" class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="station in data.stations_summary" :key="station.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:border-primary transition"
        @click="$router.push(`/stations/${station.id}`)">
        <h4 class="font-bold">{{ station.name }}</h4>
        <div class="text-sm text-gray-500 mt-2 space-y-1">
          <div>🏝️ {{ station.islands_count }} جزيرة</div>
          <div>🔧 {{ station.meters_count }} عداد</div>
          <div>🛢️ {{ station.tanks_count }} خزان</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'

const data = ref(null)

const formatNum = (v) => {
  if (!v) return '0'
  return Number(v).toLocaleString('ar-LY')
}

onMounted(async () => {
  try {
    const { data: res } = await api.get('/dashboard/')
    data.value = res
  } catch (e) {
    console.error('Dashboard load error:', e)
  }
})
</script>
