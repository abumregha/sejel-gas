<template>
  <div>
    <div class="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-xl font-bold">كشف الحساب اليومي</h2>
        <p class="text-sm text-gray-500 mt-0.5" v-if="stationStore.currentStationName">المحطة: {{ stationStore.currentStationName }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <select v-model="reportMonth" class="border border-gray-300 rounded-lg px-3 py-2">
          <option v-for="m in months" :key="m.v" :value="m.v">{{ m.n }}</option>
        </select>
        <input v-model="reportYear" type="number" class="border border-gray-300 rounded-lg px-3 py-2 w-24" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="printReport" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5">طباعة</button>
      </div>
    </div>

    <div v-if="!stationStore.currentStation" class="text-center py-12 text-gray-400">اختر محطة من القائمة الجانبية</div>

    <div v-else-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>

    <div v-else-if="report" class="space-y-6">
      <div class="report-header border-b border-gray-300 pb-4 text-center">
        <h1 class="text-lg font-bold">كشف الحساب اليومي — {{ monthName }} {{ reportYear }}</h1>
        <p class="text-sm text-gray-500 mt-1">
          {{ report.station_name || stationStore.currentStationName }} · نظام سجل لإدارة محطات الوقود
        </p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي اللترات</div><div class="kpi-value">{{ formatNum(totals.liters) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">المبيعات المتوقعة</div><div class="kpi-value">{{ formatNum(totals.expected_sales) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي التحصيل</div><div class="kpi-value">{{ formatNum(totals.collected) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">المصروفات</div><div class="kpi-value">{{ formatNum(totals.expenses) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">صافي النقدية</div><div class="kpi-value">{{ formatNum(totals.net_cash) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">الفرق التراكمي</div><div class="kpi-value" :class="Number(totals.difference || 0) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(totals.difference) }} د.ل</div></div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-4 print:border overflow-x-auto">
        <table class="data-table min-w-[1100px] text-sm">
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>المناوبات</th>
              <th>اللترات</th>
              <th>المبيعات المتوقعة</th>
              <th>نقدي</th>
              <th>قسائم</th>
              <th>POS</th>
              <th>التحصيل</th>
              <th>مصروفات</th>
              <th>صافي النقدية</th>
              <th>الفرق</th>
              <th>رصيد التحصيل التراكمي</th>
              <th>صافي تراكمي</th>
              <th>فرق تراكمي</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length">
              <td colspan="14" class="text-center text-gray-400 py-6">لا توجد بيانات لهذا الشهر</td>
            </tr>
            <tr v-for="r in rows" :key="r.date" :class="Math.abs(Number(r.difference||0)) > 10000 ? 'bg-red-50' : ''">
              <td class="font-medium whitespace-nowrap">{{ r.date }}</td>
              <td class="font-mono">{{ r.shifts }}</td>
              <td class="font-mono">{{ formatNum(r.liters) }}</td>
              <td class="font-mono">{{ formatNum(r.expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(r.cash) }}</td>
              <td class="font-mono">{{ formatNum(r.vouchers) }}</td>
              <td class="font-mono">{{ formatNum(r.pos) }}</td>
              <td class="font-mono font-semibold">{{ formatNum(r.collected) }}</td>
              <td class="font-mono">{{ formatNum(r.expenses) }}</td>
              <td class="font-mono">{{ formatNum(r.net_cash) }}</td>
              <td class="font-mono font-semibold" :class="Number(r.difference||0) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(r.difference) }}</td>
              <td class="font-mono">{{ formatNum(r.running_collected) }}</td>
              <td class="font-mono">{{ formatNum(r.running_net_cash) }}</td>
              <td class="font-mono font-semibold" :class="Number(r.running_difference||0) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(r.running_difference) }}</td>
            </tr>
          </tbody>
          <tfoot v-if="rows.length">
            <tr class="font-bold border-t-2 border-gray-300 bg-gray-50">
              <td>الإجمالي</td>
              <td class="font-mono">{{ totals.shifts || 0 }}</td>
              <td class="font-mono">{{ formatNum(totals.liters) }}</td>
              <td class="font-mono">{{ formatNum(totals.expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(totals.cash) }}</td>
              <td class="font-mono">{{ formatNum(totals.vouchers) }}</td>
              <td class="font-mono">{{ formatNum(totals.pos) }}</td>
              <td class="font-mono">{{ formatNum(totals.collected) }}</td>
              <td class="font-mono">{{ formatNum(totals.expenses) }}</td>
              <td class="font-mono">{{ formatNum(totals.net_cash) }}</td>
              <td class="font-mono" :class="Number(totals.difference||0) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(totals.difference) }}</td>
              <td class="font-mono">{{ formatNum(lastRun('running_collected')) }}</td>
              <td class="font-mono">{{ formatNum(lastRun('running_net_cash')) }}</td>
              <td class="font-mono" :class="Number(lastRun('running_difference')||0) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(lastRun('running_difference')) }}</td>
            </tr>
          </tfoot>
        </table>
        <p class="text-xs text-gray-400 mt-3" v-if="rows.length">* الصفوف المظللة تشير إلى فروقات يومية كبيرة (تتطلب مراجعة).</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import { useStationStore } from '../../stores/station'

const route = useRoute()
const stationStore = useStationStore()
const now = new Date()
const reportMonth = ref(Number(route.query.month) || now.getMonth() + 1)
const reportYear = ref(Number(route.query.year) || now.getFullYear())
const report = ref(null)
const loading = ref(false)

const months = [
  { v: 1, n: 'يناير' }, { v: 2, n: 'فبراير' }, { v: 3, n: 'مارس' }, { v: 4, n: 'أبريل' },
  { v: 5, n: 'مايو' }, { v: 6, n: 'يونيو' }, { v: 7, n: 'يوليو' }, { v: 8, n: 'أغسطس' },
  { v: 9, n: 'سبتمبر' }, { v: 10, n: 'أكتوبر' }, { v: 11, n: 'نوفمبر' }, { v: 12, n: 'ديسمبر' },
]
const monthName = computed(() => months.find(m => m.v === Number(reportMonth.value))?.n || reportMonth.value)
const rows = computed(() => report.value?.rows || [])
const totals = computed(() => report.value?.totals || {})
const lastRun = (key) => rows.value.length ? rows.value[rows.value.length - 1][key] : 0

const formatNum = (v) => (v || v === 0) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'

const loadReport = async () => {
  if (!stationStore.currentStation) { report.value = null; return }
  loading.value = true
  try {
    const { data } = await api.get(`/reports/daily-statement/?year=${reportYear.value}&month=${reportMonth.value}`)
    report.value = data
  } catch (e) {
    report.value = null
    alert('خطأ في تحميل كشف الحساب')
  } finally {
    loading.value = false
  }
}

const printReport = () => window.print()

onMounted(async () => {
  if (!stationStore.loaded) await stationStore.init()
  await loadReport()
})

watch(() => stationStore.currentStation, loadReport)
</script>
