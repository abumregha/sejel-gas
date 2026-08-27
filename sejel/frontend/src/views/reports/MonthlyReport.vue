<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التقرير الشهري</h2>
      <div class="flex items-center gap-3">
        <select v-model="reportMonth" class="border border-gray-300 rounded-lg px-3 py-2">
          <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
        </select>
        <input v-model="reportYear" type="number" class="border border-gray-300 rounded-lg px-3 py-2 w-24" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="window.print()" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">🖨️</button>
      </div>
    </div>
    <div v-if="report" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي اللترات</div><div class="kpi-value">{{ formatNum(report.total_liters) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">المبيعات</div><div class="kpi-value">{{ formatNum(report.total_expected_sales) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">التحصيل</div><div class="kpi-value">{{ formatNum(report.total_collected) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">المناوبات</div><div class="kpi-value">{{ report.total_shifts || 0 }}</div></div>
      </div>
      <div v-if="report.stations?.length" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">مقارنة المحطات</h3>
        <table class="data-table">
          <thead><tr><th>المحطة</th><th>اللترات</th><th>المبيعات</th><th>التحصيل</th></tr></thead>
          <tbody>
            <tr v-for="s in report.stations" :key="s.id">
              <td class="font-medium">{{ s.name }}</td>
              <td class="font-mono">{{ formatNum(s.liters) }}</td>
              <td class="font-mono">{{ formatNum(s.expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(s.collected) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const now = new Date()
const reportMonth = ref(now.getMonth() + 1)
const reportYear = ref(now.getFullYear())
const report = ref(null)
const formatNum = (v) => v ? Number(v).toLocaleString('ar-LY') : '0'
const loadReport = async () => {
  try {
    const { data } = await api.get(`/reports/monthly/?year=${reportYear.value}&month=${reportMonth.value}`)
    report.value = data
  } catch (e) { alert('خطأ') }
}
onMounted(loadReport)
</script>
