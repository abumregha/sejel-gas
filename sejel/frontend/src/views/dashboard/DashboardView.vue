<script setup>
// Sejel Operations Dashboard (docs/DASHBOARD_REDESIGN_PROMPT.md).
// One API load per render (§24): GET /api/dashboard-station/ returns the whole
// payload; all numbers displayed are backend values (§27).
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { useAuthStore } from '../../stores/auth'
import Icon from '../../components/dashboard/Icon.vue'
import KpiCard from '../../components/dashboard/KpiCard.vue'
import StationMap from '../../components/dashboard/StationMap.vue'
import TankCard from '../../components/dashboard/TankCard.vue'
import DetailDrawers from '../../components/dashboard/DetailDrawers.vue'
import ShiftStatusCard from '../../components/dashboard/ShiftStatusCard.vue'
import ReconciliationSummary from '../../components/dashboard/ReconciliationSummary.vue'
import AlertsPanel from '../../components/dashboard/AlertsPanel.vue'
import QuickActions from '../../components/dashboard/QuickActions.vue'
import TrendSection from '../../components/dashboard/TrendSection.vue'
import { fmtNum, fmtMoney, fmtTime } from '../../components/dashboard/format'
import { SHIFT_STATUS_PRIMARY, label } from '../../utils/labels'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const data = ref(null)
const stations = ref([]) // for the owner selector

// selected station: supervisor is locked to their binding (§3.1)
const selected = ref(auth.stationId || '')

const isAggregate = computed(() => !selected.value)
const canSwitch = computed(() => auth.isAdmin || ['manager', 'finance'].includes(auth.role))

// ---- drawer state ----------------------------------------------------------
const drawer = ref({ open: false, kind: '', payload: null })
function openDrawer(kind, payload) {
  drawer.value = { open: true, kind, payload }
}
function closeDrawer() {
  drawer.value.open = false
}

// island name lookup for the readings table / machine drawer context
const islandName = computed(() => {
  const map = {}
  for (const i of data.value?.islands || []) map[i.id] = i.name
  return (id) => map[id] || '—'
})

// latest readings table rows (§13) — from the same payload, no extra calls
const readingRows = computed(() => {
  const rows = (data.value?.meters || []).filter((m) => m.reading)
  rows.sort((a, b) => new Date(b.reading.recorded_at) - new Date(a.reading.recorded_at))
  return rows
})

// Excel-style totals (§17/§18): backend liters + backend expected sales only
const excelTotals = computed(() => ({
  liters: readingRows.value.reduce((s, r) => s + Number(r.reading.liters_sold || 0), 0),
  sales: readingRows.value.reduce((s, r) => s + Number(r.reading.expected_sales || 0), 0),
}))
const readingDate = computed(() => {
  const d = data.value?.meta?.date
  if (!d) return ''
  return new Date(d).toLocaleDateString('ar-LY-u-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' })
})

// ---- data loading ----------------------------------------------------------
async function load() {
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (selected.value) params.station = selected.value
    const { data: d } = await api.get('/dashboard-station/', { params })
    data.value = d
    if (d.mode === 'aggregate') stations.value = d.stations
    else if (!stations.value.length) await loadStationList()
  } catch (e) {
    error.value = e.response?.data?.exception || 'تعذر تحميل لوحة التحكم'
  } finally {
    loading.value = false
  }
}

async function loadStationList() {
  try {
    const { data: d } = await api.get('/stations/')
    stations.value = (d.results || d).map((s) => ({
      id: s.name,
      name: s.station_name || s.name,
      address: s.address,
    }))
  } catch {
    stations.value = []
  }
}

// keep the selector populated even in single-station mode
onMounted(async () => {
  if (!auth.user) await auth.restore()
  if (!auth.stationId && !stations.value.length) await loadStationList()
  await load()
})

watch(selected, load)

function fmtDiff(v) {
  if (v === null || v === undefined) return '—'
  const n = Number(v)
  return (n > 0 ? '+' : '') + n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const diffTone = computed(() => {
  const t = data.value?.kpis?.difference_type
  return t === 'shortage' ? 'red' : t === 'surplus' ? 'amber' : 'green'
})
</script>

<template>
  <div>
    <!-- ============ A. HEADER / STATION CONTEXT (§3) ============ -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-xl font-bold flex items-center gap-2">
          <Icon name="station" :size="22" class="text-gray-500" />
          {{ isAggregate ? 'لوحة إدارة المحطات' : data?.station?.name || '...' }}
        </h1>
        <p v-if="!isAggregate && data?.station?.address" class="text-sm text-gray-500 mt-0.5">{{ data.station.address }}</p>
        <p v-if="!isAggregate && data" class="text-xs text-gray-400 mt-0.5">آخر تحديث: {{ fmtTime(data.meta?.generated_at) }}</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- دليل الاستخدام — direct link from the dashboard (client request) -->
        <router-link to="/guide" title="دليل الاستخدام"
          class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 flex items-center gap-1.5 text-sm">
          <Icon name="info" :size="16" />
          <span class="hidden md:inline">الدليل</span>
        </router-link>
        <!-- Excel export of this station's data (client request) -->
        <a v-if="!isAggregate && data?.station?.id"
          :href="`/api/export/?view=station&name=${data.station.id}`"
          class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 flex items-center gap-1.5 text-sm"
          title="تصدير بيانات المحطة إلى Excel">
          <Icon name="download" :size="16" />
          <span class="hidden md:inline">تصدير Excel</span>
        </a>
        <button class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500" title="تحديث" @click="load">
          <Icon name="refresh" :size="16" :class="{ 'animate-spin': loading }" />
        </button>
        <select
          v-if="canSwitch"
          v-model="selected"
          data-testid="station-selector"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[180px]"
        >
          <option value="">جميع المحطات</option>
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <span v-else-if="auth.stationId" class="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-2">
          محطتك: {{ data?.station?.name || auth.stationId }}
        </span>
      </div>
    </div>

    <!-- loading / error -->
    <div v-if="loading && !data" data-testid="dashboard-loading" class="text-center text-gray-400 py-20">جارٍ التحميل…</div>
    <div v-else-if="error" data-testid="dashboard-error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{{ error }}</div>

    <!-- ============ AGGREGATE MODE (§3: all stations) ============ -->
    <div v-else-if="isAggregate" class="space-y-4">
      <AlertsPanel v-if="data?.alerts?.length" :alerts="data.alerts" />
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="s in data?.stations || []"
          :key="s.id"
          class="text-right bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
          @click="selected = s.id"
        >
          <div class="flex items-center justify-between mb-3">
            <b class="text-lg flex items-center gap-2"><Icon name="station" :size="18" class="text-gray-400" />{{ s.name }}</b>
            <span v-if="s.open_shifts" class="text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
              {{ s.open_shifts }} مناوبة مفتوحة
            </span>
          </div>
          <div v-if="s.address" class="text-xs text-gray-400 mb-3">{{ s.address }}</div>
          <div class="grid grid-cols-3 gap-2 text-center text-sm mb-3">
            <div class="bg-gray-50 rounded-lg py-2"><div class="text-[11px] text-gray-500">اللترات</div><b class="tabular-nums">{{ fmtNum(s.total_liters ?? 0) }}</b></div>
            <div class="bg-gray-50 rounded-lg py-2"><div class="text-[11px] text-gray-500">التحصيل</div><b class="tabular-nums">{{ fmtNum(s.total_collection ?? 0) }}</b></div>
            <div class="bg-gray-50 rounded-lg py-2"><div class="text-[11px] text-gray-500">الفرق</div><b class="tabular-nums">{{ fmtDiff(s.difference) }}</b></div>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1"><Icon name="tank" :size="13" />{{ s.tanks }} خزانات</span>
            <span v-if="s.low_tanks" class="text-amber-700 flex items-center gap-1"><Icon name="alert" :size="13" />{{ s.low_tanks }} منخفضة</span>
            <span class="mr-auto tabular-nums">المخزون {{ s.volume_pct ?? 0 }}%</span>
          </div>
        </button>
      </div>
      <div v-if="data && !data.stations.length" class="text-center text-gray-400 py-16">
        لا توجد محطات نشطة — ابدأ من
        <router-link to="/stations/setup-wizard" class="text-blue-700 hover:underline">إعداد محطة جديدة</router-link>
      </div>
    </div>

    <!-- ============ SINGLE STATION MODE ============ -->
    <div v-else-if="data" class="space-y-6">
      <!-- B. KPI SUMMARY (§4) — Arabic explanations on "?" hover -->
      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard icon="drop" label="إجمالي اللترات" :value="fmtNum(data.kpis.total_liters)" tone="blue"
          help="مجموع اللترات المباعة في مناوبات اليوم حسب قراءات العدادات (الختامية ناقص الافتتاحية)." />
        <KpiCard icon="receipt" label="المبيعات المتوقعة" :value="fmtMoney(data.kpis.expected_sales)" tone="gray"
          help="اللترات المباعة × سعر اللتر المجمّد وقت إقفال المناوبة. هذا رقم محاسبي وليس النقد الفعلي." />
        <KpiCard icon="banknote" label="إجمالي التحصيل" :value="fmtMoney(data.kpis.total_collection)" tone="green"
          help="النقد + الكوبونات + الدفع الإلكتروني (POS) المسجلة في المناوبة." />
        <KpiCard icon="scale" label="فرق المطابقة" :value="fmtDiff(data.kpis.difference)" :tone="diffTone"
          help="التحصيل ناقص المبيعات المتوقعة: مطابق عند التساوي، فائض إذا زاد التحصيل، وعجز إذا نقص." />
        <KpiCard icon="wallet" label="المصروفات" :value="fmtMoney(data.kpis.total_expenses)" tone="gray"
          help="مصروفات نقدية معتمدة تُخصم من النقد الصافي، ولا تقلل المبيعات المتوقعة." />
        <KpiCard icon="trending" label="هامش الربح" :value="data.kpis.profit === null ? 'غير مُعرّف' : fmtMoney(data.kpis.profit)" tone="green"
          :hint="data.kpis.profit === null ? 'سعر التكلفة غير مسجل' : ''"
          help="(سعر البيع ناقص سعر التكلفة) × اللترات المباعة. يظهر «غير مُعرّف» إذا لم يُسجل سعر التكلفة." />
        <KpiCard icon="banknote" label="النقد الصافي" :value="fmtMoney(data.kpis.net_cash)" tone="gray"
          help="النقد المُحصّل ناقص المصروفات النقدية المعتمدة." />
      </div>

      <!-- قراءات اليوم — completion status (§22): very visible, click → entry screen -->
      <router-link v-if="data?.readings_status" to="/readings" data-testid="readings-status"
        class="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3 border-r-4 hover:shadow-md transition-shadow"
        :class="data.readings_status.pending === 0 ? 'border-green-500' : 'border-amber-500'">
        <span :class="data.readings_status.pending === 0 ? 'text-green-600' : 'text-amber-600'">
          <Icon :name="data.readings_status.pending === 0 ? 'check' : 'alert'" :size="22" />
        </span>
        <div class="min-w-0">
          <div class="font-bold text-sm" :class="data.readings_status.pending === 0 ? 'text-green-700' : 'text-amber-700'">
            قراءات اليوم — {{ data.readings_status.done }} / {{ data.readings_status.total }} مكتملة
          </div>
          <div class="text-xs text-gray-500">
            {{ data.readings_status.pending === 0
              ? 'جميع قراءات المسدسات مسجلة لهذا اليوم'
              : data.readings_status.pending + ' قراءة متبقية — انقر لإدخال القراءات' }}
            <span v-if="data.readings_status.exceptions" class="text-red-600"> · {{ data.readings_status.exceptions }} استثناء</span>
          </div>
        </div>
        <Icon name="arrowright" :size="16" class="mr-auto text-gray-400 rotate-180" />
      </router-link>

      <!-- C2. GAUGES + 14-DAY TREND CHARTS -->
      <TrendSection :trend="data.trend" :tanks="data.tanks" :summary="data.summary" />

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <!-- main column -->
        <div class="xl:col-span-2 space-y-6">
          <!-- C. INTERACTIVE STATION MAP (§5–§10) -->
          <section>
            <h2 class="font-bold mb-3 flex items-center gap-2"><Icon name="layers" :size="18" class="text-gray-500" /> خريطة المحطة</h2>
            <StationMap
              :islands="data.islands"
              @open-island="(p) => openDrawer('island', p)"
              @open-machine="(p) => openDrawer('machine', { ...p, islandName: islandName(p.island) })"
              @open-meter="(p) => openDrawer('meter', p)"
            />
          </section>

          <!-- D. TANKS (§11/§12) -->
          <section>
            <h2 class="font-bold mb-3 flex items-center gap-2">
              <Icon name="tank" :size="18" class="text-gray-500" /> الخزانات
              <span class="text-xs font-normal text-gray-400">إجمالي المخزون {{ fmtNum(data.summary.current_volume) }} / {{ fmtNum(data.summary.total_capacity) }} لتر</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TankCard v-for="t in data.tanks" :key="t.id" :tank="t" @open="(p) => openDrawer('tank', p)" />
              <div v-if="!data.tanks.length" class="text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center sm:col-span-2">
                لا توجد خزانات معرّفة
              </div>
            </div>
          </section>

          <!-- M. EXCEL-STYLE READINGS TABLE (§17/§18): the client's familiar
               columns — التاريخ، قراءة بداية اليوم، قراءة نهاية اليوم،
               اللترات المباعة، رقم المضخة، المسدس — plus useful extras. -->
          <section v-if="readingRows.length">
            <h2 class="font-bold mb-3 flex items-center gap-2">
              <Icon name="gauge" :size="18" class="text-gray-500" /> قراءات المضخات اليوم
              <router-link to="/readings" class="text-xs font-normal text-blue-700 hover:underline mr-auto flex items-center gap-1">
                شاشة الإدخال <Icon name="arrowright" :size="13" class="rotate-180" />
              </router-link>
            </h2>
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
              <table class="w-full text-sm min-w-[760px]">
                <thead>
                  <tr class="text-xs text-gray-500 text-right border-b border-gray-100">
                    <th class="py-2.5 px-3 font-medium">التاريخ</th>
                    <th class="font-medium">رقم المضخة</th>
                    <th class="font-medium">المسدس</th>
                    <th class="font-medium">الجزيرة</th>
                    <th class="font-medium">نوع الوقود</th>
                    <th class="font-medium">قراءة بداية اليوم</th>
                    <th class="font-medium">قراءة نهاية اليوم</th>
                    <th class="font-medium">اللترات المباعة</th>
                    <th class="font-medium">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in readingRows"
                    :key="r.id"
                    class="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                    @click="openDrawer('meter', r)"
                  >
                    <td class="py-2.5 px-3 text-xs text-gray-600">{{ readingDate }}</td>
                    <td>{{ r.machine_name || '—' }}</td>
                    <td class="font-bold tabular-nums">{{ r.meter_code }}</td>
                    <td>{{ islandName(r.island) }}</td>
                    <td>{{ r.fuel_type || '—' }}</td>
                    <td class="tabular-nums">{{ fmtNum(r.reading.start_reading) }}</td>
                    <td class="tabular-nums">{{ fmtNum(r.reading.end_reading) }}</td>
                    <td class="tabular-nums font-bold text-blue-700">{{ fmtNum(r.reading.liters_sold) }}</td>
                    <td>
                      <span v-if="r.reading.exception_type" class="text-[11px] bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5">استثناء</span>
                      <span v-else class="text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">صحيحة</span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-gray-200 bg-gray-50 font-bold text-sm">
                    <td class="py-2.5 px-3" colspan="7">إجمالي اللترات المباعة</td>
                    <td class="py-2.5 px-3 tabular-nums text-blue-700">{{ fmtNum(excelTotals.liters) }}</td>
                    <td></td>
                  </tr>
                  <tr v-if="excelTotals.sales" class="bg-gray-50 font-bold text-sm border-t border-gray-100">
                    <td class="py-2.5 px-3" colspan="7">إجمالي قيمة المبيعات (المتوقعة)</td>
                    <td class="py-2.5 px-3 tabular-nums">{{ fmtMoney(excelTotals.sales) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </div>

        <!-- side column -->
        <div class="space-y-6">
          <ShiftStatusCard :shifts="data.shifts" />
          <ReconciliationSummary :kpis="data.kpis" />
          <AlertsPanel :alerts="data.alerts" />
          <QuickActions :station-id="data.station?.id" />
        </div>
      </div>
    </div>

    <!-- shared detail drawers (§13: same component as the map) -->
    <DetailDrawers :open="drawer.open" :kind="drawer.kind" :payload="drawer.payload" @close="closeDrawer" />
  </div>
</template>
