<script setup>
// قراءات المضخات — the primary end-of-day operational page (client prompt §9–§14).
//
// The operator enters ONLY the new cumulative reading per gun (المسدس):
// - Previous reading is auto-retrieved (today's reading end, else Meter.current_reading)
// - Liters preview = current − previous (display only; the backend recomputes
//   and validates everything — continuity, negatives, exceptions — §13/§33)
// - Money uses the backend frozen price carried on the payload row; the SPA
//   never invents financial values (§15/§33)
// - One dashboard-station load per render; no per-gun API calls (§31)
//
// Architect clarification (client confirmed): the meter-reading cycle is a
// FULL-DAY period bounded by the station's configurable day-close time
// (Station.day_close_time, e.g. 11:00→11:00) — NOT tied to employee shifts.
// Employee/operational shifts may rotate freely during the day (08→16, 16→00,
// 00→08) without requiring any new pump reading. The reading period is the
// same gun's previous reading → the operator's new cumulative entry.
// "Shift" in the data layer is only the internal audit container for the
// daily close (is_day_close=1); employees are attached to their own shifts.
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../api'
import { friendlyError } from '../../errors'
import { useAuthStore } from '../../stores/auth'
import Icon from '../../components/dashboard/Icon.vue'
import { fmtNum, fmtMoney } from '../../components/dashboard/format'

const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const closing = ref(false)
const error = ref('')
const notice = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const data = ref(null)
const stations = ref([])
// remember the chosen station across navigations — the operator returns to
// this screen many times during the day (dashboard → readings → dashboard)
const stationSel = ref(auth.stationId || sessionStorage.getItem('sejel-readings-station') || '')
watch(stationSel, (v) => sessionStorage.setItem('sejel-readings-station', v || ''))

const canSwitch = computed(() => auth.isAdmin || ['manager', 'finance'].includes(auth.role))

// rows[meterId] = entry state per gun
const rows = ref({})

function buildRows(payload, prevRows = {}) {
  const map = {}
  for (const isl of payload?.islands || []) {
    for (const mach of isl.machines || []) {
      for (const m of mach.meters || []) {
        if (m.status === 'inactive') continue
        map[m.id] = { meter: m, island: isl, current: '', exception_type: '', notes: '', showException: false, savedNow: false }
      }
    }
  }
  // preserve in-progress input on reload — never wipe what the operator typed
  // for guns that still have no saved reading
  for (const [id, row] of Object.entries(map)) {
    const old = prevRows[id]
    if (old && !row.meter.reading && !old.meter.reading) {
      row.current = old.current
      row.exception_type = old.exception_type
      row.notes = old.notes
      row.showException = old.showException
    }
  }
  return map
}

// previous valid reading for the next entry: today's saved end, else the
// meter's cumulative counter (never asks the operator to re-type it — §10).
// A start-only row (opening recorded, closing pending) has no end yet —
// fall back to the meter's cumulative counter.
function prevOf(row) {
  if (row.meter.reading && row.meter.reading.end_reading !== null && row.meter.reading.end_reading !== undefined)
    return row.meter.reading.end_reading
  return row.meter.current_reading ?? null
}

const islandList = computed(() => {
  const out = []
  for (const isl of data.value?.islands || []) {
    const guns = []
    for (const mach of isl.machines || [])
      for (const m of mach.meters || [])
        if (rows.value[m.id]) guns.push({ mach, row: rows.value[m.id] })
    if (guns.length) out.push({ island: isl, guns })
  }
  return out
})

function liveLiters(row) {
  if (row.current === '' || row.current === null || row.current === undefined) return null
  // An unsaved opening reading has nothing to sell yet — showing
  // current − 0 would display the meter's entire cumulative counter.
  if (isOpening(row)) return null
  const prev = prevOf(row)
  if (prev === null || prev === undefined) return null
  return Number(row.current) - Number(prev)
}

// A gun with neither a saved reading nor an established counter: this entry
// establishes the baseline, so it is not fuel that was sold (QA-32). The
// backend books 0 L for it — the UI must say so before the operator saves,
// otherwise the liters preview shows the meter's whole cumulative counter.
function isOpening(row) {
  if (row.meter.reading) return !!row.meter.reading.is_opening
  return !prevOf(row)
}

function needsException(row) {
  return liveLiters(row) !== null && liveLiters(row) < 0
}

function rowStatus(row) {
  if (row.meter.reading?.exception_type) return 'exception'
  if (row.meter.reading) return 'saved'
  if (needsException(row)) return 'invalid'
  if (row.current !== '' && row.current !== null && row.current !== undefined) return 'filled'
  return 'pending'
}

// ---- progress (§22): readings completed today vs active guns ---------------
const totalGuns = computed(() => Object.keys(rows.value).length)
const doneGuns = computed(() => Object.values(rows.value).filter((r) => r.meter.reading).length)
const exceptionGuns = computed(() => Object.values(rows.value).filter((r) => r.meter.reading?.exception_type).length)
const filledNow = computed(() => Object.values(rows.value).filter((r) => rowStatus(r) === 'filled' || rowStatus(r) === 'invalid').length)
const allDone = computed(() => totalGuns.value > 0 && doneGuns.value >= totalGuns.value)

// today's liters = saved readings + live preview of unsaved entries (display only)
const todayLiters = computed(() => {
  let sum = 0
  for (const r of Object.values(rows.value)) {
    if (r.meter.reading) sum += Number(r.meter.reading.liters_sold || 0)
    else if (rowStatus(r) === 'filled' && (liveLiters(r) || 0) > 0) sum += liveLiters(r)
  }
  return sum
})

function gunPrice(row) {
  return row.meter.reading?.unit_price ?? row.meter.fuel_price ?? null
}
function expectedOf(row) {
  const liters = row.meter.reading ? Number(row.meter.reading.liters_sold || 0) : liveLiters(row)
  const p = gunPrice(row)
  if (liters === null || p === null || p === undefined || liters < 0) return null
  return liters * p
}

// ---- data loading -----------------------------------------------------------
async function load() {
  if (!stationSel.value) { data.value = null; loading.value = false; return }
  loading.value = true
  error.value = ''
  try {
    const params = { date: date.value }
    if (stationSel.value) params.station = stationSel.value
    const { data: d } = await api.get('/dashboard-station/', { params })
    data.value = d
    rows.value = buildRows(d, rows.value)
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    loading.value = false
  }
}

async function loadStations() {
  try {
    const { data: d } = await api.get('/stations/')
    stations.value = (d.results || d).map((s) => ({ id: s.name, name: s.station_name || s.name }))
  } catch { stations.value = [] }
}

onMounted(async () => {
  if (!auth.user) await auth.restore()
  if (!auth.stationId) await loadStations()
  await load()
})

// ---- save -------------------------------------------------------------------
// The day-close container (is_day_close=1) — the station's reading/closing
// cycle for this date. Employee shifts never appear here.
const activeShift = computed(() => {
  const list = data.value?.shifts || []
  return list.find((s) => s.is_day_close && s.status === 'open')
    || list.find((s) => s.is_day_close && s.status === 'in_progress')
    || list.find((s) => s.is_day_close && s.status === 'submitted') || null
})

// Station-configured daily close time (fallback 23:00 — never hard-coded
// business logic; each station can run its own cycle, e.g. 11:00→11:00).
const dayCloseTime = computed(() => {
  const t = data.value?.station?.day_close_time
  return (t ? String(t).slice(0, 5) : '') || '23:00'
})

async function ensureShift() {
  // Server-side idempotent ensure: the dashboard payload this view rendered
  // from can be stale — client-side check-then-create duplicated the day-close
  // Shift on every failed save (8 duplicates observed 2026-10-01).
  const { data: sh } = await api.post('/ensure-day-close/', {
    station: stationSel.value,
    date: date.value,
  })
  return sh.name
}

async function save() {
  const pending = Object.values(rows.value).filter((r) => (rowStatus(r) === 'filled' || rowStatus(r) === 'invalid'))
  if (!pending.length) { notice.value = 'أدخل قراءة واحدة على الأقل أولاً'; return }
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    const shiftId = await ensureShift()
    for (const r of pending) {
      const prev = prevOf(r)
      const body = {
        shift: shiftId,
        meter: r.meter.id,
        // start = the auto-retrieved previous reading (§10); the backend still
        // validates continuity against real history and rejects silent gaps
        start_reading: prev,
        end_reading: Number(r.current),
        source: 'manual',
      }
      if (r.exception_type) {
        body.exception_type = r.exception_type
        body.notes = r.notes || '—'
      }
      try {
        await api.post('/meter-readings/', body)
      } catch (e) {
        // name the failing gun so the operator knows exactly which entry
        // was rejected (client report 2026-10-01: opaque "error occurred")
        e.readingContext = `${r.meter.meter_code}${r.mach?.name ? ' — ' + r.mach.name : ''}`
        throw e
      }
      r.savedNow = true
    }
    notice.value = `تم حفظ ${pending.length} قراءة بنجاح`
    await load()
  } catch (e) {
    const msg = friendlyError(e)
    error.value = e.readingContext ? `${e.readingContext}: ${msg}` : msg
  } finally {
    saving.value = false
  }
}

// ---- daily closing (§23) — reuses the existing backend closing logic --------
async function closeDay() {
  const shiftId = activeShift.value?.id
  if (!shiftId) { error.value = 'لم يتم بدء دورة إقفال اليوم بعد — احفظ قراءة واحدة أولاً'; return }
  if (doneGuns.value < totalGuns.value && !window.confirm('هناك قراءات لم تُسجّل بعد. هل تريد إقفال اليوم على أي حال؟')) return
  if (!window.confirm('إقفال اليوم سيحسب المبيعات المتوقعة وينشئ التسوية المالية. متابعة؟')) return
  closing.value = true
  error.value = ''
  try {
    if (activeShift.value.status !== 'submitted') {
      await api.put(`/shifts/${shiftId}/`, { status: 'submitted' })
    }
    await api.post(`/shifts/${shiftId}/close/`)
    notice.value = 'تم إقفال اليوم وإنشاء التسوية المالية بنجاح'
    await load()
  } catch (e) {
    error.value = friendlyError(e)
  } finally {
    closing.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <!-- header -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Icon name="gauge" :size="22" class="text-gray-500" />
          قراءات المضخات
        </h2>
        <p class="text-sm text-gray-500 mt-0.5">أدخل القراءة الحالية لكل مسدس — القراءة السابقة (آخر قراءة لنفس المسدس) تُجلب تلقائياً</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <input v-model="date" type="date" data-testid="readings-date" class="border border-gray-300 rounded-lg px-3 py-2" @change="load" />
        <select v-if="canSwitch" v-model="stationSel" data-testid="readings-station" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white min-w-[160px]" @change="load">
          <option value="" disabled>اختر المحطة</option>
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <button data-testid="close-day" :disabled="closing || !activeShift" @click="closeDay"
          :title="'دورة الإقفال اليومية ' + dayCloseTime + ' ← ' + dayCloseTime"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1.5">
          <Icon name="clock" :size="15" />
          {{ closing ? '...' : 'إقفال اليوم' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <div v-if="notice" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 text-sm">{{ notice }}</div>

    <!-- station picker for multi-station managers -->
    <div v-if="canSwitch && !stationSel" class="text-center text-gray-400 py-16">
      اختر محطة لعرض مسدساتها
    </div>

    <div v-else-if="loading && !data" class="text-center text-gray-400 py-16">جارٍ التحميل…</div>

    <div v-else-if="data" class="space-y-4 pb-28">
      <!-- progress chip (§22) -->
      <div data-testid="readings-progress" class="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <span class="text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-2.5 py-1" data-testid="reading-period">
          دورة القراءة: {{ date }} {{ dayCloseTime }} ← {{ dayCloseTime }}
        </span>
        <span v-if="allDone" class="flex items-center gap-2 text-green-700 font-bold">
          <Icon name="check" :size="18" /> جميع القراءات مكتملة
        </span>
        <span v-else class="flex items-center gap-2 text-amber-700 font-bold">
          <Icon name="alert" :size="18" /> {{ doneGuns }} / {{ totalGuns }} مكتملة
          <span class="text-xs font-normal text-gray-500">— {{ totalGuns - doneGuns }} قراءة متبقية</span>
        </span>
        <span v-if="exceptionGuns" class="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-1">
          {{ exceptionGuns }} استثناء
        </span>
        <span class="mr-auto text-sm text-gray-600 tabular-nums">
          إجمالي اللترات: <b class="text-blue-700">{{ fmtNum(todayLiters) }}</b> لتر
        </span>
      </div>

      <!-- empty state -->
      <div v-if="!islandList.length" class="text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
        لا توجد عدادات (مسدسات) معرّفة لهذه المحطة — أضفها من إعداد المحطة
      </div>

      <!-- islands → pumps → guns -->
      <div v-for="isl in islandList" :key="isl.island.id" class="space-y-3">
        <h3 class="font-bold text-sm text-gray-600 flex items-center gap-2">
          <Icon name="island" :size="16" class="text-gray-400" /> {{ isl.island.name }}
          <span class="text-xs font-normal text-gray-400">
            ({{ isl.guns.filter((g) => g.row.meter.reading).length }}/{{ isl.guns.length }})
          </span>
        </h3>
        <div v-for="g in isl.guns" :key="g.row.meter.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <b class="tabular-nums break-all">{{ g.row.meter.meter_code }}</b>
              <span class="text-xs text-gray-500">{{ g.mach.name }}</span>
              <span class="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{{ g.row.meter.fuel_type }}</span>
            </div>
            <!-- per-gun status (§25): complete / pending / exception -->
            <span v-if="rowStatus(g.row) === 'saved'" class="text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Icon name="check" :size="12" /> مسجلة
            </span>
            <span v-else-if="rowStatus(g.row) === 'exception'" class="text-[11px] bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Icon name="alert" :size="12" /> استثناء
            </span>
            <span v-else-if="rowStatus(g.row) === 'invalid'" class="text-[11px] bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Icon name="alert" :size="12" /> قراءة غير صالحة
            </span>
            <span v-else class="text-[11px] bg-gray-50 text-gray-500 border border-gray-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Icon name="clock" :size="12" /> بانتظار القراءة
            </span>
            <!-- first reading of a gun with no counter yet: it sets the baseline,
                 it is not a sale (QA-32 — the backend books 0 L for these) -->
            <span v-if="isOpening(g.row)" data-testid="opening-badge"
              class="text-[11px] bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Icon name="info" :size="12" /> قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <!-- previous reading (auto, read-only) -->
            <div class="bg-gray-50 rounded-lg p-3">
              <div class="text-xs text-gray-500 mb-1">القراءة السابقة (تلقائية)</div>
              <b class="tabular-nums text-lg">{{ fmtNum(prevOf(g.row)) }}</b>
            </div>
            <!-- current reading: the only input the operator fills (§10) -->
            <div>
              <label class="block text-xs text-gray-500 mb-1">القراءة الحالية (لتر)</label>
              <div class="relative">
                <input
                  v-model.number="g.row.current"
                  data-testid="gun-current-input"
                  type="number"
                  step="0.001"
                  inputmode="decimal"
                  :disabled="!!g.row.meter.reading"
                  :class="needsException(g.row) ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-300'"
                  class="w-full border rounded-lg pl-14 pr-4 py-3 text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="أدخل القراءة الحالية"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">لتر</span>
              </div>
              <div v-if="liveLiters(g.row) !== null" class="text-xs mt-1" :class="liveLiters(g.row) < 0 ? 'text-red-600' : 'text-gray-500'">
                = {{ fmtNum(liveLiters(g.row)) }} لتر مباعة
              </div>
            </div>
            <!-- liters preview + expected sales (backend price) -->
            <div class="rounded-lg p-3" :class="liveLiters(g.row) !== null && liveLiters(g.row) < 0 ? 'bg-red-50' : 'bg-blue-50'">
              <div class="text-xs text-gray-500 mb-1">اللترات المباعة</div>
              <b class="tabular-nums text-lg" :class="liveLiters(g.row) !== null && liveLiters(g.row) < 0 ? 'text-red-700' : 'text-blue-700'">
                {{ liveLiters(g.row) === null ? '—' : fmtNum(liveLiters(g.row)) + ' لتر' }}
              </b>
              <div v-if="expectedOf(g.row) !== null" class="text-xs text-gray-500 mt-0.5">
                المبيعات المتوقعة: <span class="tabular-nums">{{ fmtMoney(expectedOf(g.row)) }}</span>
              </div>
            </div>
          </div>

          <!-- negative / exception flow (§13): block silent submission, require reason -->
          <div v-if="needsException(g.row) || g.row.showException" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div>
              <label class="block text-xs text-amber-800 mb-1">نوع الاستثناء {{ needsException(g.row) ? '(مطلوب — القراءة أقل من السابقة)' : '' }}</label>
              <select v-model="g.row.exception_type" class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="">لا يوجد</option>
                <option value="reset">تصفير العداد</option>
                <option value="replacement">استبدال العداد</option>
                <option value="other">سبب آخر</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-amber-800 mb-1">سبب الاستثناء {{ g.row.exception_type ? '(مطلوب)' : '' }}</label>
              <input v-model="g.row.notes" class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm" placeholder="اكتب السبب هنا" />
            </div>
          </div>
          <button v-else type="button" class="mt-2 text-xs text-gray-400 hover:text-gray-600" @click="g.row.showException = true">
            + تسجيل استثناء (تصفير / استبدال العداد)
          </button>
        </div>
      </div>
    </div>

    <!-- sticky save bar -->
    <div v-if="data && stationSel" class="fixed bottom-0 left-0 right-0 lg:right-14 bg-white border-t border-gray-200 px-4 py-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div class="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        <span class="text-sm text-gray-600">
          أدخلت الآن: <b>{{ filledNow }}</b> · مكتملة: <b>{{ doneGuns }}/{{ totalGuns }}</b>
        </span>
        <span class="text-sm text-gray-600 tabular-nums hidden sm:inline">
          الإجمالي: <b class="text-blue-700">{{ fmtNum(todayLiters) }}</b> لتر
        </span>
        <button
          data-testid="save-readings"
          :disabled="saving || !filledNow"
          @click="save"
          class="mr-auto bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-primary/90"
        >
          {{ saving ? 'جاري الحفظ...' : 'حفظ القراءات المُدخلة' }}
        </button>
      </div>
    </div>
  </div>
</template>
