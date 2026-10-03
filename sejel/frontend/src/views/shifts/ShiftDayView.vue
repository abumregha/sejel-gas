<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h2 class="text-xl font-bold">يوم المحطة</h2>
        <p class="text-sm text-gray-500">كل مناوبات وقراءات اليوم في شاشة واحدة</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <input v-model="day" type="date" class="border border-gray-300 rounded-lg px-3 py-2" @change="load" />
        <select v-if="canSwitch" v-model="stationSel" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" @change="load">
          <option value="">جميع المحطات المعنية</option>
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <button @click="generate(false)" :disabled="generating" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50">
          {{ generating ? '...' : '⚙ توليد مناوبات اليوم' }}
        </button>
        <button @click="generate(true)" :disabled="generating" title="تجاهل فلتر الأيام — إنشاء كل التعريفات النشطة (حالات الطوارئ)"
          class="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50">
          ⚡ وضع الطوارئ (24 ساعة)
        </button>
      </div>
    </div>

    <div v-if="genMsg" class="rounded-xl px-4 py-3 mb-4 text-sm" :class="genOk ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'">
      {{ genMsg }}
    </div>

    <!-- all-stations summary: the one shape this screen can actually get when
         no station is selected. Pick a station to see its shifts and meters. -->
    <div v-if="isAggregate" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
      <h3 class="font-bold mb-1">ملخصص يوم المحطة — اختر محطة لنُظرها المناوبات الفريدة</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[620px]">
          <thead>
            <tr class="text-xs text-gray-500 text-right border-b border-gray-100">
              <th class="py-2 px-3 font-medium">المحطة</th>
              <th class="font-medium">قراءات</th>
              <th class="font-medium">مناوبات</th>
              <th class="font-medium">اللترات</th>
              <th class="font-medium">المتوقعت</th>
              <th class="font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="st in stationRows" :key="st.id" class="border-b border-gray-50 last:border-0">
              <td class="py-2.5 px-3 font-bold">
                <router-link :to="`/stations/${st.id}`" class="text-primary hover:underline">{{ st.name }}</router-link>
              </td>
              <td class="tabular-nums">
                {{ (st.readings_status?.done || 0) }} / {{ (st.readings_status?.total || 0) }}
                <span v-if="st.readings_status?.exceptions" class="text-red-600 text-xs">({{ st.readings_status.exceptions }} استثناء)</span>
              </td>
              <td class="tabular-nums">{{ st.shifts_today || 0 }}</td>
              <td class="tabular-nums font-bold text-blue-700">{{ Number(st.total_liters || 0).toLocaleString('en-US') }}</td>
              <td class="tabular-nums">{{ Number(st.expected_sales || 0).toLocaleString('en-US') }}</td>
              <td>
                <span v-if="st.day_closed" class="badge badge-green">مغلقة</span>
                <span v-else-if="st.open_shifts" class="badge badge-yellow">جارية</span>
                <span v-else class="text-gray-400 text-xs">—</span>
              </td>
            </tr>
            <tr v-if="!stationRows.length">
              <td colspan="6" class="text-center text-gray-400 py-6">لا توجد محطة</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- shifts grouped by status (single-station mode) -->
    <template v-if="!isAggregate">
    <div v-for="g in groups" :key="g.status" class="mb-5">
      <h3 class="font-bold mb-2 flex items-center gap-2 text-sm">
        <span class="inline-block w-2.5 h-2.5 rounded-full" :style="{ background: g.color }" />
        {{ g.label }} <span class="text-gray-400">({{ g.items.length }})</span>
      </h3>
      <div v-if="g.items.length" class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
        <div v-for="s in g.items" :key="s.id" class="flex items-center justify-between px-4 py-3 gap-3">
          <div class="min-w-0">
            <div class="font-medium text-sm truncate">{{ s.name }}</div>
            <div class="text-xs text-gray-400 mt-0.5">
              {{ (s.start_time || '').slice(0, 5) }}–{{ (s.end_time || '').slice(0, 5) }}
              <span v-if="s.employee"> · {{ employeeName(s.employee) }}</span>
              <span v-if="s.island"> · {{ islandName(s.island) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <router-link v-if="s.status === 'open'" :to="`/shifts/${s.id}/readings`"
              class="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg">+ قراءات</router-link>
            <router-link v-else-if="s.status === 'scheduled'" :to="`/shifts/${s.id}`"
              class="text-xs border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">تفعيل</router-link>
            <router-link v-else-if="s.status === 'submitted'" :to="`/shifts/${s.id}`"
              class="text-xs bg-primary text-white px-3 py-1.5 rounded-lg">إقفال</router-link>
            <router-link :to="`/shifts/${s.id}`" class="text-xs text-primary hover:underline">تفاصيل</router-link>
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-gray-400 px-1">—</div>
    </div>
    </template>

    <!-- readings grid (single-station mode only) -->
    <div v-if="!isAggregate" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mt-6">
      <h3 class="font-bold mb-3 flex items-center gap-2">
        شبكة قراءات العدادات
        <span class="text-xs font-normal text-gray-400">مجموع اللترات: {{ totalLiters.toLocaleString('en-US') }}</span>
      </h3>
      <div v-if="meterRows.length" class="overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead>
            <tr class="text-xs text-gray-500 text-right border-b border-gray-100">
              <th class="py-2 px-3 font-medium">العداد</th>
              <th class="font-medium">المضخة</th>
              <th class="font-medium">الوقود</th>
              <th class="font-medium">آخر اختتام</th>
              <th class="font-medium">قراءة اليوم</th>
              <th class="font-medium">اللترات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in meterRows" :key="r.name" class="border-b border-gray-50 last:border-0">
              <td class="py-2.5 px-3 font-bold">{{ r.meter_code }}</td>
              <td>{{ r.machine_name || '—' }}</td>
              <td>{{ fuelMap[r.fuel_type] || r.fuel_type || '—' }}</td>
              <td class="tabular-nums text-gray-500">{{ fmtReading(r.current_reading) }}</td>
              <td class="tabular-nums">
                <template v-if="r.reading">
                  {{ fmtReading(r.reading.start_reading) }} → {{ fmtReading(r.reading.end_reading ?? '—') }}
                </template>
                <span v-else class="text-amber-600 text-xs">بدون قراءة</span>
              </td>
              <td class="tabular-nums font-bold text-blue-700">{{ r.reading ? Number(r.reading.liters_sold || 0).toLocaleString('en-US') : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-sm text-gray-400 text-center py-8">
        لا توجد عدادات — أضف العدادات من صفحة المحطة أولاً
      </div>
    </div>

    <div v-if="!day" class="text-center text-gray-400 py-10">اختر التاريخ</div>
    <div v-else-if="loading && !groups.length" class="text-center text-gray-400 py-10">جارٍ التحميل…</div>
  </div>
</template>
<script setup>
// يوم المحطة — Phase-2 "one screen for the day" (Q-Phase2): status groups,
// auto-generated shifts (with emergency 24h mode), and the readings grid.
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../api'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const day = ref(new Date().toISOString().slice(0, 10))
const loading = ref(false)
const generating = ref(false)
const genMsg = ref('')
const genOk = ref(false)
const payload = ref(null)
const stations = ref([])
const stationSel = ref(auth.stationId || '')
const fuelMap = ref({})
const employeeMap = ref({})

const canSwitch = computed(() => auth.isAdmin || ['manager', 'finance'].includes(auth.role))

// /dashboard-station/ answers in one of two shapes. With a station selected it
// returns that station's shifts and meters; with "all stations" selected (the
// default for a manager) it returns mode:"aggregate" and a stations[] summary
// array with NO shifts/meters keys. This screen used to read the single-station
// keys unconditionally, so an operator who had not picked a station saw four
// empty shift groups, "0 litres" and "لا توجد عدادات" on a day that really had
// 16,803 litres recorded (QA-27). Aggregate mode now renders its own summary.
const isAggregate = computed(() => payload.value?.mode === 'aggregate')
const stationRows = computed(() => payload.value?.stations || [])

const groups = computed(() => {
  const defs = [
    { status: 'open', label: 'مناوبات جارية', color: '#22c55e' },
    { status: 'scheduled', label: 'مجدولة (لم تبدأ)', color: '#9ca3af' },
    { status: 'submitted', label: 'بانتظار الإقفال', color: '#f59e0b' },
    { status: 'closed', label: 'مغلقة اليوم', color: '#3b82f6' },
  ]
  const shifts = isAggregate.value ? [] : (payload.value?.shifts || [])
  return defs.map((d) => ({ ...d, items: shifts.filter((s) => s.status === d.status) }))
})

const meterRows = computed(() => payload.value?.meters || [])
const totalLiters = computed(() => meterRows.value.reduce((s, m) => s + Number(m.reading?.liters_sold || 0), 0))

const fmtReading = (v) => (v == null ? '—' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 }))
const employeeName = (id) => employeeMap.value[id] || id
const islandMap = computed(() => {
  const map = {}
  for (const isl of payload.value?.islands || []) map[isl.id] = isl.name
  return map
})
const islandName = (id) => islandMap.value[id] || id

async function load() {
  if (!day.value) return
  loading.value = true
  genMsg.value = ''
  try {
    const params = { date: day.value }
    if (stationSel.value) params.station = stationSel.value
    const { data } = await api.get('/dashboard-station/', { params })
    payload.value = data
  } catch (e) {
    genMsg.value = e.response?.data?.message || 'تعذر تحميل يوم المحطة'
    genOk.value = false
  } finally { loading.value = false }
}

async function generate(emergency) {
  generating.value = true
  genMsg.value = ''
  try {
    const { data: d } = await api.post('/generate-shifts/', { date: day.value, emergency: emergency ? 1 : 0 })
    genOk.value = d.created > 0
    genMsg.value = `تم التوليد (${d.mode}): ${d.created} مناوبة جديدة، ${d.skipped} موجودة مسبقاً`
    await load()
  } catch (e) {
    genOk.value = false
    const raw = e.response?.data?.message || e.response?.data?.exc || e.message
    genMsg.value = typeof raw === 'string' ? raw.replace(/<[^>]+>/g, '').split('\n')[0].slice(0, 160) : 'خطأ في التوليد'
  } finally { generating.value = false }
}

onMounted(async () => {
  try {
    const [fRes, eRes, sRes] = await Promise.all([api.get('/fuel-types/'), api.get('/employees/'), api.get('/stations/')])
    fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
    employeeMap.value = Object.fromEntries((eRes.data.results || eRes.data).map(e => [e.name, e.employee_name || e.name]))
    if (canSwitch.value) stations.value = (sRes.data.results || sRes.data).map(s => ({ id: s.name, name: s.station_name || s.name }))
  } catch (e) { /* optional labels */ }
  await load()
})
watch(day, load)
</script>
