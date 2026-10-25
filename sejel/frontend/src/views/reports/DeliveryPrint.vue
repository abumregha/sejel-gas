<template>
  <div>
    <div class="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-xl font-bold">تقرير التسليم للطباعة</h2>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <select v-model="selectedStation" class="border border-gray-300 rounded-lg px-4 py-2">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
        <div class="flex items-center gap-1">
          <button @click="setPreset('thisWeek')" :class="presetBtnClass('thisWeek')">هذا الأسبوع</button>
          <button @click="setPreset('lastWeek')" :class="presetBtnClass('lastWeek')">الأسبوع الماضي</button>
          <button @click="setPreset('thisMonth')" :class="presetBtnClass('thisMonth')">هذا الشهر</button>
          <button @click="setPreset('lastMonth')" :class="presetBtnClass('lastMonth')">الشهر الماضي</button>
        </div>
        <input v-model="startDate" type="date" class="border border-gray-300 rounded-lg px-4 py-2" />
        <span class="text-gray-400">—</span>
        <input v-model="endDate" type="date" class="border border-gray-300 rounded-lg px-4 py-2" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">توليد</button>
        <button @click="printReport" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">🖨️ طباعة</button>
      </div>
    </div>
    <div v-if="report" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي المسلّم</div><div class="kpi-value">{{ formatNum(report.total_delivered) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي غير المسلّم</div><div class="kpi-value text-red-600">{{ formatNum(report.total_undelivered) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي في الطريق</div><div class="kpi-value text-yellow-600">{{ formatNum(report.total_transit) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي الكمية المستلمة</div><div class="kpi-value text-green-600">{{ formatNum(report.total_quantity_received) }}</div></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">تفاصيل التسليمات — {{ report.station_name }}</h3>
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>رقم الفاتورة</th><th>تاريخ التسليم</th><th>نوع الوقود</th><th>الخزان</th><th>الكمية المتوقعة</th><th>الكمية المستلمة</th><th>الحالة</th></tr></thead>
            <tbody>
              <tr v-for="(d, i) in report.deliveries" :key="i">
                <td class="font-medium">{{ d.invoice_number }}</td>
                <td>{{ d.delivery_date }}</td>
                <td>{{ d.fuel_type }}</td>
                <td>{{ d.tank }}</td>
                <td class="font-mono">{{ formatNum(d.expected_quantity) }}</td>
                <td class="font-mono">{{ formatNum(d.received_quantity) }}</td>
                <td>
                  <span :class="flagClass(d.flag)" class="badge">{{ flagLabel(d.flag) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">اختر المحطة ونطاق التاريخ لعرض التقرير</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const stations = ref([])
const selectedStation = ref('')
const startDate = ref('')
const endDate = ref('')
const activePreset = ref('')
const report = ref(null)
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
const setPreset = (preset) => {
  activePreset.value = preset
  const now = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  if (preset === 'thisWeek') {
    const day = now.getDay() || 7
    const mon = new Date(now)
    mon.setDate(now.getDate() - day + 1)
    startDate.value = fmt(mon)
    endDate.value = fmt(now)
  } else if (preset === 'lastWeek') {
    const day = now.getDay() || 7
    const lastMon = new Date(now)
    lastMon.setDate(now.getDate() - day - 6)
    const lastSun = new Date(lastMon)
    lastSun.setDate(lastMon.getDate() + 6)
    startDate.value = fmt(lastMon)
    endDate.value = fmt(lastSun)
  } else if (preset === 'thisMonth') {
    startDate.value = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
    endDate.value = fmt(now)
  } else if (preset === 'lastMonth') {
    startDate.value = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1))
    endDate.value = fmt(new Date(now.getFullYear(), now.getMonth(), 0))
  }
}
const presetBtnClass = (preset) => [
  'px-3 py-1.5 rounded-lg text-sm border transition',
  activePreset.value === preset
    ? 'bg-primary text-white border-primary'
    : 'bg-white border-gray-200 hover:border-primary'
]
const loadReport = async () => {
  if (!selectedStation.value && stations.value.length > 0) {
    selectedStation.value = stations.value[0].name
  }
  if (!selectedStation.value) { alert('اختر المحطة'); return }
  try {
    const { data } = await api.get('/delivery-print/', {
      params: { station: selectedStation.value, start_date: startDate.value, end_date: endDate.value }
    })
    report.value = data
  } catch (e) { alert('خطأ في تحميل التقرير') }
}
const printReport = () => window.print()
onMounted(async () => {
  setPreset('thisMonth')
  try {
    const { data } = await api.get('/stations/')
    stations.value = data.results || data
    if (stations.value.length > 0 && !selectedStation.value) {
      selectedStation.value = stations.value[0].name
      loadReport()
    }
  } catch (e) {}
})
</script>
