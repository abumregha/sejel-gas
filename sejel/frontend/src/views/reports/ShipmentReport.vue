<template>
  <div>
    <div class="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-xl font-bold">تقرير الشحنات الشهري</h2>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <select v-model="selectedStation" class="border border-gray-300 rounded-lg px-4 py-2">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
        <select v-model="reportMonth" class="border border-gray-300 rounded-lg px-3 py-2">
          <option v-for="m in months" :key="m.v" :value="m.v">{{ m.n }}</option>
        </select>
        <input v-model="reportYear" type="number" class="border border-gray-300 rounded-lg px-3 py-2 w-24" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="printReport" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">🖨️ طباعة</button>
      </div>
    </div>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="report" class="space-y-6">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي المجدول</div><div class="kpi-value">{{ formatNum(report.total_scheduled) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي المسلّم</div><div class="kpi-value text-green-600">{{ formatNum(report.total_delivered) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي غير المسلّم</div><div class="kpi-value text-red-600">{{ formatNum(report.total_undelivered) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي في الطريق</div><div class="kpi-value text-yellow-600">{{ formatNum(report.total_transit) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي الكمية المستلمة</div><div class="kpi-value text-green-600">{{ formatNum(report.total_quantity_received) }}</div></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">تفاصيل الشحنات — {{ report.station_name }} — {{ monthName }} {{ reportYear }}</h3>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>رقم الفاتورة</th><th>التاريخ المجدول</th><th>تاريخ التسليم الفعلي</th><th>نوع الوقود</th><th>الخزان</th><th>الكمية المتوقعة</th><th>الكمية المستلمة</th><th>الحالة</th><th>العلامة</th></tr></thead>
            <tbody>
              <tr v-for="(d, i) in report.shipments" :key="i">
                <td class="font-medium">{{ d.invoice_number }}</td>
                <td>{{ d.scheduled_date }}</td>
                <td>{{ d.delivery_date }}</td>
                <td>{{ d.fuel_type }}</td>
                <td>{{ d.tank }}</td>
                <td class="font-mono">{{ formatNum(d.expected_quantity) }}</td>
                <td class="font-mono">{{ formatNum(d.received_quantity) }}</td>
                <td>{{ d.status }}</td>
                <td>
                  <span :class="flagClass(d.flag)" class="badge">{{ flagLabel(d.flag) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">اختر المحطة والشهر لعرض التقرير</div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import { friendlyError } from '../../errors'

const stations = ref([])
const selectedStation = ref('')
const now = new Date()
const reportMonth = ref(now.getMonth() + 1)
const reportYear = ref(now.getFullYear())
const report = ref(null)
const error = ref('')

const months = [
  { v: 1, n: 'يناير' }, { v: 2, n: 'فبراير' }, { v: 3, n: 'مارس' }, { v: 4, n: 'أبريل' },
  { v: 5, n: 'مايو' }, { v: 6, n: 'يونيو' }, { v: 7, n: 'يوليو' }, { v: 8, n: 'أغسطس' },
  { v: 9, n: 'سبتمبر' }, { v: 10, n: 'أكتوبر' }, { v: 11, n: 'نوفمبر' }, { v: 12, n: 'ديسمبر' },
]
const monthName = computed(() => months.find(m => m.v === Number(reportMonth.value))?.n || reportMonth.value)

const formatNum = (v) => v ? Number(v).toLocaleString('en-US') : '0'
const flagLabel = (flag) => {
  if (flag === 'مرحلة') return 'مرحلة'
  if (flag === 'undelivered') return 'غير مسلّم'
  if (flag === 'transit') return 'في الطريق'
  return flag
}
const flagClass = (flag) => {
  if (flag === 'مرحلة') return 'badge-green'
  if (flag === 'undelivered') return 'badge-red'
  if (flag === 'transit') return 'badge-yellow'
  return ''
}
const loadReport = async () => {
  error.value = ''
  if (!selectedStation.value && stations.value.length > 0) {
    selectedStation.value = stations.value[0].name
  }
  if (!selectedStation.value) {
    error.value = 'يرجى اختيار المحطة أولاً'
    return
  }
  try {
    const { data } = await api.get('/reports/monthly-shipments/', {
      params: { station: selectedStation.value, year: reportYear.value, month: reportMonth.value }
    })
    report.value = data
  } catch (e) {
    error.value = friendlyError(e) || 'خطأ في تحميل التقرير'
  }
}
const printReport = () => window.print()
onMounted(async () => {
  try {
    const { data } = await api.get('/stations/')
    stations.value = data.results || data
    if (stations.value.length > 0 && !selectedStation.value) {
      selectedStation.value = stations.value[0].name
      loadReport()
    }
  } catch (e) {
    error.value = friendlyError(e)
  }
})
</script>
