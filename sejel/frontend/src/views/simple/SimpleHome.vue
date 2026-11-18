<template>
  <div class="space-y-5">
    <!-- Day close: one button, one confirmation. Only for roles that may
         create the daily Reconciliation (canCloseDay); everyone else never
         sees it (per the rule: no error states, just absence). -->
    <button v-if="mayCloseDay && !dayClosed" data-testid="simple-close-day" @click="closeDay"
      :disabled="closing || loading"
      class="w-full min-h-[56px] rounded-xl bg-gray-900 text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50">
      <Icon name="clock" :size="20" />
      {{ loading ? 'جارٍ التحميل…' : 'إقفال اليوم' }}
    </button>
    <div v-if="dayClosed" data-testid="simple-day-closed"
      class="w-full min-h-[44px] rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold flex items-center justify-center gap-2">
      <Icon name="check" :size="16" /> تم إقفال اليوم
    </div>

    <!-- The 3–4 primary actions. Delivery renders only for roles that hold
         Delivery create permission (B1 decision a): it is hidden, never an
         error state, for everyone else. -->
    <div class="grid grid-cols-2 gap-3">
      <RouterLink v-if="canDeliver" to="/simple/delivery" data-testid="simple-nav-delivery"
        class="btn-card bg-white border-blue-200 text-blue-900">
        <Icon name="island" :size="30" class="text-blue-500" />
        <span>توريد وقود</span>
      </RouterLink>
      <RouterLink to="/simple/readings" data-testid="simple-nav-readings"
        class="btn-card bg-white border-gray-200 text-gray-900">
        <Icon name="gauge" :size="30" class="text-gray-500" />
        <span>قراءات المضخات</span>
      </RouterLink>
      <RouterLink to="/simple/income" data-testid="simple-nav-income"
        class="btn-card bg-white border-gray-200 text-gray-900">
        <Icon name="banknote" :size="30" class="text-gray-500" />
        <span>الإيرادات</span>
      </RouterLink>
      <RouterLink to="/simple/tank-reading" data-testid="simple-nav-tank"
        class="btn-card bg-white border-gray-200 text-gray-900">
        <Icon name="tank" :size="30" class="text-gray-500" />
        <span>قراءة خزان</span>
      </RouterLink>
    </div>

    <!-- Read-only Today summary. All values come from the same backend
         payloads Manager Mode uses; nothing is recomputed in the browser
         beyond summing what the API returned. -->
    <section data-testid="simple-today" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <h2 class="font-bold text-gray-800 mb-3">اليوم</h2>
      <div v-if="loading" class="text-sm text-gray-400 py-4 text-center">جارٍ التحميل…</div>
      <div v-else-if="error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{{ error }}</div>
      <div v-else>
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="rounded-xl bg-gray-50 p-3">
            <div data-testid="simple-today-readings" class="text-xl font-bold tabular-nums">{{ readingsDone }}/{{ readingsTotal }}</div>
            <div class="text-[11px] text-gray-500 mt-1">قراءات المسدسات</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-3">
            <div data-testid="simple-today-liters" class="text-xl font-bold tabular-nums">{{ fmtNum(totalLiters) }}</div>
            <div class="text-[11px] text-gray-500 mt-1">لتر — إجمالي اليوم</div>
          </div>
          <div class="rounded-xl bg-gray-50 p-3">
            <div data-testid="simple-today-income" class="text-xl font-bold tabular-nums">{{ fmtMoney(totalIncome) }}</div>
            <div class="text-[11px] text-gray-500 mt-1">إجمالي الإيرادات</div>
          </div>
        </div>
        <div class="text-center text-[11px] text-gray-400 mt-2 tabular-nums" data-testid="simple-today-deliveries">
          توريد اليوم: {{ deliveriesToday }}
        </div>
      </div>

      <!-- Tank levels: the operator dips these tanks and orders fuel — seeing
           the level removes the "call the manager and ask" step. Same payload
           Manager Mode's gauges use (current_level / capacity / percent). -->
      <div v-if="!loading && !error && tanks.length" data-testid="simple-tanks" class="mt-4 pt-3 border-t border-gray-100 space-y-2">
        <div class="text-[11px] text-gray-500">الخزانات</div>
        <div v-for="t in tanks" :key="t.id" class="flex items-center gap-3">
          <div class="flex-1">
            <div class="flex justify-between text-[11px] text-gray-600 mb-1">
              <span>{{ t.name }}</span>
              <span class="tabular-nums">{{ fmtNum(t.current_level) }} / {{ fmtNum(t.capacity) }} لتر</span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full" :class="t.percent <= 20 ? 'bg-red-500' : t.percent <= 40 ? 'bg-amber-400' : 'bg-emerald-500'"
                :style="{ width: Math.min(100, Math.max(0, t.percent || 0)) + '%' }" />
            </div>
          </div>
          <span class="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">{{ lastDip(t) }}</span>
        </div>
      </div>

      <!-- Read-only log of today's recorded entries: what is already done,
           without opening Manager Mode. -->
      <div v-if="!loading && !error && todayLog.length" data-testid="simple-today-log" class="mt-4 pt-3 border-t border-gray-100">
        <div class="text-[11px] text-gray-500 mb-2">سجل اليوم</div>
        <ul class="space-y-1.5">
          <li v-for="(row, i) in todayLog" :key="i" class="flex items-center gap-2 text-xs text-gray-700">
            <span>{{ row.icon }}</span>
            <span class="tabular-nums">{{ row.text }}</span>
          </li>
        </ul>
      </div>

      <!-- Manager Mode: only for roles with broad access -->
      <div v-if="showManagerMode" class="mt-4 pt-3 border-t border-gray-100">
        <RouterLink to="/" data-testid="simple-manager-mode"
          class="text-sm text-blue-700 font-semibold hover:underline">الوضع الكامل (للمدير) ←</RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
// Simple Mode home — the whole day for a station operator on one screen.
import { computed, ref, onMounted } from 'vue'
import api from '../../api'
import friendlyError from '../../errors'
import { useAuthStore } from '../../stores/auth'
import { useStationStore } from '../../stores/station'
import { useToast } from '../../composables/useToast'
import Icon from '../../components/dashboard/Icon.vue'
import { fmtNum, fmtMoney } from '../../components/dashboard/format'
import { isManagerLevel, canCloseDay } from '../../utils/roles'

const auth = useAuthStore()
const stationStore = useStationStore()
const { show } = useToast()

const loading = ref(true)
const error = ref('')
const dash = ref(null)
const incomeReport = ref(null)

const mayCloseDay = computed(() => canCloseDay(auth.user))
// B1 (option a): Delivery create is manager-level per the DocType matrix
// (Sejel Supervisor holds read-only Delivery). Hide, never error.
const canDeliver = computed(() => isManagerLevel(auth.user))
const showManagerMode = computed(() => isManagerLevel(auth.user))

const dateStr = new Date().toISOString().slice(0, 10)

const activeDayShift = computed(() => {
  const list = dash.value?.shifts || []
  return list.find((s) => s.is_day_close && s.status === 'open')
    || list.find((s) => s.is_day_close && s.status === 'in_progress')
    || list.find((s) => s.is_day_close && s.status === 'submitted') || null
})
const dayClosed = computed(() =>
  (dash.value?.shifts || []).some((s) => s.is_day_close && s.status === 'closed'))

const readingsDone = computed(() => Number(dash.value?.readings_status?.done ?? 0))
const readingsTotal = computed(() => Number(dash.value?.readings_status?.total ?? 0))
const totalLiters = computed(() => {
  let sum = 0
  for (const isl of dash.value?.islands || []) {
    for (const mach of isl.machines || []) {
      for (const m of mach.meters || []) {
        if (m.reading) sum += Number(m.reading.liters_sold || 0)
      }
    }
  }
  return sum
})
const totalIncome = computed(() => {
  const r = incomeReport.value
  if (!r) return 0
  return Number(r.total_collection || 0)
})

// Operator context (read-only, same payloads Manager Mode uses):
// tank levels, today's deliveries, and a compact "today's log".
const tanks = computed(() => dash.value?.tanks || [])
const deliveriesToday = ref(0)
const deliveriesList = ref([])
const tankReadings = ref([])

const tankNameById = computed(() => {
  const map = {}
  for (const t of tanks.value) map[t.id || t.name] = t.name
  return map
})

// Read-only log of what was actually recorded today. Built only from the
// payloads this screen already uses — no new endpoints, no recomputation.
const todayLog = computed(() => {
  const rows = []
  for (const isl of dash.value?.islands || []) {
    for (const mach of isl.machines || []) {
      let letter = 0
      for (const m of mach.meters || []) {
        if (m.status === 'inactive') continue
        const r = m.reading
        if (r && r.end_reading != null) {
          rows.push({ icon: '🎯', text: `مسدس ${String.fromCharCode(65 + letter)} — ${fmtNum(r.liters_sold || 0, 3)} لتر` })
        }
        letter++
      }
    }
  }
  const rep = incomeReport.value
  if (rep) {
    const parts = []
    if (Number(rep.cash_sales) > 0) parts.push(`نقدي ${fmtMoney(rep.cash_sales)}`)
    if (Number(rep.coupon_sales) > 0) parts.push(`كوبونات ${fmtMoney(rep.coupon_sales)}`)
    if (Number(rep.epayment_sales) > 0) parts.push(`إلكتروني ${fmtMoney(rep.epayment_sales)}`)
    if (parts.length) rows.push({ icon: '💰', text: `إيراد — ${parts.join(' · ')}` })
  }
  for (const r of tankReadings.value) {
    if (!String(r.recorded_at || '').startsWith(dateStr)) continue
    rows.push({ icon: '🛢️', text: `قراءة خزان ${tankNameById.value[r.tank] || r.tank} — ${fmtNum(r.reading_level, 3)} لتر` })
  }
  for (const d of deliveriesList.value) {
    if (!String(d.arrival_date || '').startsWith(dateStr)) continue
    rows.push({ icon: '🚚', text: `توريد وقود — ${fmtNum(d.expected_quantity ?? d.requested_quantity ?? 0)} لتر` })
  }
  return rows
})

function lastDip(t) {
  if (!t.last_reading_date) return '—'
  const s = String(t.last_reading_date)
  return s.includes(' ') ? s.split(' ')[1].slice(0, 5) : s.slice(11, 16)
}

async function loadDeliveries() {
  try {
    const { data } = await api.get('/deliveries/', { params: { station: stationStore.currentStation } })
    const list = data.results || data || []
    deliveriesList.value = list
    deliveriesToday.value = list.filter((d) => String(d.arrival_date || '').startsWith(dateStr)).length
  } catch { /* context line only — never blocks the home screen */ }
}

async function loadTankReadings() {
  try {
    const { data } = await api.get('/tank-readings/')
    tankReadings.value = data.results || data || []
  } catch { /* context line only — never blocks the home screen */ }
}

async function load() {
  if (!stationStore.currentStation) { loading.value = false; return }
  loading.value = true
  error.value = ''
  try {
    const [d, s] = await Promise.all([
      api.get('/dashboard-station/', { params: { date: dateStr } }),
      api.get('/reports/daily-sales/', { params: { date: dateStr } }),
    ])
    dash.value = d.data
    incomeReport.value = s.data && !s.data.station_required ? s.data : null
    await Promise.all([loadDeliveries(), loadTankReadings()])
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    loading.value = false
  }
}

// One button, ONE confirmation (the old flow had up to two).
const closing = ref(false)
async function closeDay() {
  if (closing.value) return
  if (!activeDayShift.value) {
    show('لا توجد قراءات محفوظة اليوم بعد — احفظ قراءة واحدة أولاً', 'error')
    return
  }
  if (!window.confirm('إقفال اليوم؟ سيتم حساب المبيعات وإنشاء التسوية المالية.')) return
  closing.value = true
  try {
    const id = activeDayShift.value.id
    if (activeDayShift.value.status !== 'submitted') {
      await api.put(`/shifts/${id}/`, { status: 'submitted' })
    }
    await api.post(`/shifts/${id}/close/`)
    show('تم إقفال اليوم بنجاح')
    await load()
  } catch (e) {
    show(friendlyError(e), 'error')
  } finally {
    closing.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.btn-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 120px;
  border-radius: 1rem;
  border-width: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 700;
  font-size: 1.05rem;
}
</style>
