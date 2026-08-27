<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التقرير اليومي</h2>
      <div class="flex items-center gap-3">
        <input v-model="reportDate" type="date" class="border border-gray-300 rounded-lg px-4 py-2" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="printReport" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">🖨️ طباعة</button>
      </div>
    </div>
    <div v-if="report" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي اللترات</div><div class="kpi-value">{{ formatNum(report.total_liters) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">المبيعات المتوقعة</div><div class="kpi-value">{{ formatNum(report.total_expected_sales) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي التحصيل</div><div class="kpi-value">{{ formatNum(report.total_collected) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">الفرق</div><div class="kpi-value" :class="Number(report.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatNum(report.difference || 0) }} د.ل</div></div>
      </div>
      <div v-if="report.stations?.length" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">مقارنة المحطات</h3>
        <table class="data-table">
          <thead><tr><th>المحطة</th><th>اللترات</th><th>المبيعات</th><th>التحصيل</th><th>الفرق</th></tr></thead>
          <tbody>
            <tr v-for="s in report.stations" :key="s.id">
              <td class="font-medium">{{ s.name }}</td>
              <td class="font-mono">{{ formatNum(s.liters) }}</td>
              <td class="font-mono">{{ formatNum(s.expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(s.collected) }}</td>
              <td class="font-mono font-bold" :class="Number(s.difference || 0) >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatNum(s.difference || 0) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">اختر تاريخاً لعرض التقرير</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const reportDate = ref(new Date().toISOString().split('T')[0])
const report = ref(null)
const formatNum = (v) => v ? Number(v).toLocaleString('ar-LY') : '0'
const loadReport = async () => {
  try {
    const { data } = await api.get(`/reports/daily/?date=${reportDate.value}`)
    report.value = data
  } catch (e) { alert('خطأ في تحميل التقرير') }
}
const printReport = () => window.print()
onMounted(loadReport)
</script>
