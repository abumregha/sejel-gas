<template>
  <div>
    <!-- controls (hidden when printing) -->
    <div class="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2 class="text-xl font-bold">التقرير الشهري</h2>
      <div class="flex items-center gap-3">
        <select v-model="reportMonth" class="border border-gray-300 rounded-lg px-3 py-2">
          <option v-for="m in months" :key="m.v" :value="m.v">{{ m.n }}</option>
        </select>
        <input v-model="reportYear" type="number" class="border border-gray-300 rounded-lg px-3 py-2 w-24" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="printReport" class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          طباعة
        </button>
        <!-- QA-25: this link was rendered only when the report covered exactly ONE
             station. The manager role is precisely the multi-station case, so the
             audience that most needs an export was the only one that could never
             reach it. The endpoint takes a single station, so the operator now
             picks which one explicitly instead of the control disappearing. -->
        <template v-if="report?.stations?.length >= 1">
          <select v-if="report.stations.length > 1" v-model="exportStation"
            data-testid="export-station" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option v-for="s in report.stations" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <a :href="`/api/export/?view=station&name=${exportStation}`"
            data-testid="export-excel"
            class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">⬇ Excel</a>
        </template>
      </div>
    </div>

    <div v-if="report" id="monthly-report" class="space-y-6">
      <!-- printable header -->
      <div class="report-header border-b border-gray-300 pb-4 text-center">
        <h1 class="text-lg font-bold">التقرير الشهري — {{ monthName }} {{ reportYear }}</h1>
        <p class="text-sm text-gray-500 mt-1">
          نظام سجل لإدارة محطات الوقود · صدر بتاريخ {{ new Date().toLocaleDateString('ar-LY-u-nu-latn') }}
        </p>
      </div>

      <!-- totals -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="kpi-card"><div class="kpi-label">إجمالي اللترات</div><div class="kpi-value">{{ formatNum(report.total_liters) }}</div></div>
        <div class="kpi-card"><div class="kpi-label">المبيعات المتوقعة</div><div class="kpi-value">{{ formatNum(report.total_expected_sales) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">التحصيل</div><div class="kpi-value">{{ formatNum(report.total_collected) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">المصروفات</div><div class="kpi-value">{{ formatNum(report.total_expenses) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">النقد الصافي</div><div class="kpi-value">{{ formatNum(report.net_cash) }} د.ل</div></div>
        <div class="kpi-card"><div class="kpi-label">المناوبات المغلقة</div><div class="kpi-value">{{ report.total_shifts || 0 }}</div></div>
      </div>
      <div class="text-sm text-center" :class="Number(report.difference) >= 0 ? 'text-green-700' : 'text-red-700'">
        فرق المطابقة الإجمالي: <b>{{ formatNum(report.difference) }} د.ل</b>
        ({{ Number(report.difference) >= 0 ? 'فائض' : 'عجز' }})
      </div>

      <!-- per-fuel-type breakdown -->
      <div v-if="report.fuel_breakdown?.length" class="bg-white rounded-xl shadow-sm border p-4 print:border">
        <h3 class="font-bold mb-3">المبيعات حسب نوع الوقود</h3>
        <table class="data-table">
          <thead><tr><th>نوع الوقود</th><th>اللترات</th><th>المبيعات المتوقعة</th></tr></thead>
          <tbody>
            <tr v-for="f in report.fuel_breakdown" :key="f.fuel_type">
              <td class="font-medium">{{ fuelName(f.fuel_type) }}</td>
              <td class="font-mono">{{ formatNum(f.liters) }}</td>
              <td class="font-mono font-bold">{{ formatNum(f.expected_sales) }} د.ل</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- per-station comparison -->
      <div v-if="report.stations?.length" class="bg-white rounded-xl shadow-sm border p-4 print:border">
        <h3 class="font-bold mb-3">مقارنة المحطات</h3>
        <table class="data-table">
          <thead><tr><th>المحطة</th><th>المناوبات</th><th>اللترات</th><th>المبيعات</th><th>التحصيل</th><th>الفرق</th></tr></thead>
          <tbody>
            <tr v-for="s in report.stations" :key="s.id">
              <td class="font-medium">{{ s.name }}</td>
              <td class="font-mono">{{ s.shifts || 0 }}</td>
              <td class="font-mono">{{ formatNum(s.liters) }}</td>
              <td class="font-mono">{{ formatNum(s.expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(s.collected) }}</td>
              <td class="font-mono" :class="Number(s.difference) >= 0 ? 'text-green-700' : 'text-red-700'">{{ formatNum(s.difference) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold border-t-2 border-gray-300">
              <td>الإجمالي</td>
              <td class="font-mono">{{ report.total_shifts || 0 }}</td>
              <td class="font-mono">{{ formatNum(report.total_liters) }}</td>
              <td class="font-mono">{{ formatNum(report.total_expected_sales) }}</td>
              <td class="font-mono">{{ formatNum(report.total_collected) }}</td>
              <td class="font-mono">{{ formatNum(report.difference) }}</td>
            </tr>
          </tfoot>
        </table>
        <p v-if="!report.total_shifts" class="text-xs text-gray-400 mt-3">
          لا توجد مناوبات مغلقة خلال هذا الشهر — تظهر الأرقام بعد إقفال المناوبات وإنشاء التسويات.
        </p>
      </div>

      <!-- signature block (print only) -->
      <div class="hidden print:grid grid-cols-3 gap-8 pt-10 text-center text-sm">
        <div class="border-t border-gray-400 pt-2">المحاسب</div>
        <div class="border-t border-gray-400 pt-2">مدير المحطة</div>
        <div class="border-t border-gray-400 pt-2">المالك</div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute()
const now = new Date()
const reportMonth = ref(Number(route.query.month) || now.getMonth() + 1)
const reportYear = ref(Number(route.query.year) || now.getFullYear())
const report = ref(null)
const fuelMap = ref({})

const months = [
  { v: 1, n: 'يناير' }, { v: 2, n: 'فبراير' }, { v: 3, n: 'مارس' }, { v: 4, n: 'أبريل' },
  { v: 5, n: 'مايو' }, { v: 6, n: 'يونيو' }, { v: 7, n: 'يوليو' }, { v: 8, n: 'أغسطس' },
  { v: 9, n: 'سبتمبر' }, { v: 10, n: 'أكتوبر' }, { v: 11, n: 'نوفمبر' }, { v: 12, n: 'ديسمبر' },
]
const monthName = computed(() => months.find(m => m.v === Number(reportMonth.value))?.n || reportMonth.value)

const formatNum = (v) => (v || v === 0) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'
const fuelName = (name) => fuelMap.value[name] || name

// Defaults to the first station in the report, so the Excel link always points
// somewhere real after the report loads.
const exportStation = ref('')

const loadReport = async () => {
  try {
    const { data } = await api.get(`/reports/monthly/?year=${reportYear.value}&month=${reportMonth.value}`)
    report.value = data
    const ids = (data && data.stations || []).map((s) => s.id).filter(Boolean)
    if (!ids.includes(exportStation.value)) exportStation.value = ids[0] || ''
  } catch (e) { alert('خطأ في تحميل التقرير') }
}

onMounted(async () => {
  try {
    const fRes = await api.get('/fuel-types/')
    fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
  } catch (e) { /* labels fall back to raw names */ }
  await loadReport()
})

// wait for the next frame so the DOM reflects the selected month before printing
const printReport = () => window.print()
</script>
