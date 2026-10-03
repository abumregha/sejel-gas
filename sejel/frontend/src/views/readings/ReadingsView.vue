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
import { countReadings, countExceptions } from '../../utils/labels'

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
      let letter = 0
      for (const m of mach.meters || []) {
        if (m.status === 'inactive') continue
        // Position on the pump = how the operator names the gun («مسدس A»).
        map[m.id] = {
          meter: m, island: isl, mach, gunLetter: String.fromCharCode(65 + letter),
          current: '', exception_type: '', notes: '', showException: false, savedNow: false,
        }
        letter++
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
    for (const mach of isl.machines || []) {
      for (const m of mach.meters || []) {
        if (!rows.value[m.id]) continue
        guns.push({ mach, row: rows.value[m.id] })
      }
    }
    if (guns.length) out.push({ island: isl, guns })
  }
  return out
})

function liveLiters(row) {
  if (row.current === '' || row.current === null || row.current === undefined) return null
  // While the operator is typing, the model briefly holds "-" (or "1e"), which
  // Number() turns into NaN. Treating that as a quantity produced a card that
  // showed nothing and reacted to nothing until the field was completed.
  const current = Number(row.current)
  if (!Number.isFinite(current)) return null
  // An unsaved opening reading has nothing to sell yet — showing
  // current − 0 would display the meter's entire cumulative counter.
  if (isOpening(row)) return null
  const prev = prevOf(row)
  if (prev === null || prev === undefined) return null
  const p = Number(prev)
  if (!Number.isFinite(p)) return null
  return current - p
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
  const litres = liveLiters(row)
  if (litres !== null && litres < 0) return true
  // A meter never reads below zero. On a gun with no history yet there is no
  // previous reading to compare against, so the litres preview is legitimately
  // blank — but a negative number typed in is still simply wrong, and used to
  // produce no feedback at all.
  const typed = Number(row.current)
  return row.current !== '' && row.current !== null && row.current !== undefined
    && Number.isFinite(typed) && typed < 0
}

// Say WHY the reason is required: a negative number and a meter that went
// backwards are different mistakes.
function exceptionHint(row) {
  if (!needsException(row)) return ''
  const litres = liveLiters(row)
  return litres === null || litres >= 0
    ? '(مطلوب — لا يمكن إدخال قراءة سالبة)'
    : '(مطلوب — القراءة أقل من السابقة)'
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
// `keepMessage` is for the post-action reload (after save / day close): the
// reload is what keeps the on-screen counts honest, but it used to run *after*
// the message was set and cleared it — «لم يتم حفظ …» therefore disappeared
// the instant the counts refreshed. Explicit navigation (date or station
// change) still clears both banners.
async function load({ keepMessage = false } = {}) {
  if (!stationSel.value) { data.value = null; loading.value = false; return }
  loading.value = true
  if (!keepMessage) { error.value = ''; notice.value = '' }
  try {
    const params = { date: date.value }
    if (stationSel.value) params.station = stationSel.value
    const { data: d } = await api.get('/dashboard-station/', { params })
    data.value = d
    rows.value = buildRows(d, rows.value)
  } catch (e) {
    error.value = error.value ? `${error.value} · ${friendlyError(e)}` : friendlyError(e)
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
// A disabled close button with no wording left the manager wondering whether
// the day was already closed or whether something was broken.
const dayClosed = computed(() =>
  (data.value?.shifts || []).some((s) => s.is_day_close && s.status === 'closed'))
const closeLabel = computed(() => {
  if (closing.value) return '...'
  if (dayClosed.value) return 'تم إقفال اليوم'
  if (!activeShift.value) return 'إقفال اليوم'
  return 'إقفال اليوم'
})

// The station's own configured reading cycle. The persisted Station value is
// the single source of truth — the previous hard-coded 23:00 fallback made a
// station running an 11:00 cycle silently display (and look like) 23:00.
const stationCycle = computed(() => {
  const t = data.value?.station?.day_close_time
  return t ? String(t).slice(0, 5) : ''
})
const dayCloseTime = computed(() => stationCycle.value || '23:00')
const cycleNotConfigured = computed(() => !stationCycle.value)

async function ensureShift() {
  // Server-side idempotent ensure: the dashboard payload this view rendered
  // from can be stale — client-side check-then-create duplicated the day-close
  // Shift on every failed save (8 duplicates observed 2026-10-01).
  const { data: sh } = await api.post('/ensure-day-close/', {
    station: stationSel.value,
    date: date.value,
  })
  // A closed day is financially sealed. Booking more readings into it created
  // a second day-close Shift and, on closing it, a duplicate reconciliation.
  if (sh.closed || sh.status === 'closed') {
    throw new Error('تم إقفال هذا اليوم — لا يمكن إضافة قراءات إليه. تواصل مع المدير.')
  }
  return sh.name
}

// Arabic counts: 1 → قراءة واحدة, 2 → قراءتان, 3+ → N قراءات. Saying
// «تم حفظ 1 قراءة» reads like a form field name, not a sentence.
function savedPhrase(n) {
  return `تم حفظ ${countReadings(n)} بنجاح`
}

async function save() {
  const pending = Object.values(rows.value).filter((r) => (rowStatus(r) === 'filled' || rowStatus(r) === 'invalid'))
  if (!pending.length) { notice.value = 'أدخل قراءة واحدة على الأقل أولاً'; return }
  saving.value = true
  error.value = ''
  notice.value = ''
  try {
    const shiftId = await ensureShift()
    const saved = []
    const failed = []
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
        r.savedNow = true
        saved.push(r)
      } catch (e) {
        // Keep going. Readings are saved one gun at a time, so aborting on the
        // first error left the guns before it stored while the screen showed a
        // single error and a stale "0/9 complete" — the operator had no way to
        // tell what had actually been kept.
        // Name the gun exactly as its card does (letter + pump), so the
        // operator can match the message to the physical pump without
        // translating the database's island/pump hierarchy.
        failed.push({
          label: `المسدس ${r.gunLetter || '—'}${r.mach?.name ? ' — ' + r.mach.name : ''}`,
          message: friendlyError(e),
        })
      }
    }
    // Report both outcomes, always naming the counts.
    if (saved.length && !failed.length) {
      notice.value = savedPhrase(saved.length)
      error.value = ''
    } else if (saved.length && failed.length) {
      notice.value = savedPhrase(saved.length)
      error.value = `لم يتم حفظ ${countReadings(failed.length)}: ${failed.map((f) => `${f.label} — ${f.message}`).join(' · ')}`
    } else if (failed.length) {
      error.value = `لم يتم حفظ أي قراءة: ${failed.map((f) => `${f.label} — ${f.message}`).join(' · ')}`
    }
    // Always reload so the completed count on screen matches what is stored,
    // without discarding the save outcome reported just above.
    await load({ keepMessage: true })
  } catch (e) {
    error.value = friendlyError(e)
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
    await load({ keepMessage: true })
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
        <!-- Closing the day books the day’s reconciliation, a manager-only action.
             A supervisor used to be offered this button, confirmed the dialog,
             and was then refused with «ليست لديك صلاحية» — say who does it
             instead of showing a button that cannot work. -->
        <button v-if="auth.canCloseDay" data-testid="close-day" :disabled="closing || !activeShift" @click="closeDay"
          :title="dayClosed
            ? 'تم إقفال هذا اليوم وإنشاء التسوية المالية'
            : (!activeShift ? 'احفظ قراءة واحدة أولاً حتى تبدأ دورة الإقفال' : 'دورة الإقفال اليومية ' + dayCloseTime + ' ← ' + dayCloseTime)"
          class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 disabled:opacity-40 flex items-center gap-1.5">
          <Icon :name="dayClosed ? 'check' : 'clock'" :size="15" />
          {{ closeLabel }}
        </button>
        <span v-else data-testid="close-day-hint"
          class="text-xs bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Icon name="clock" :size="15" />
          إقفال اليوم يتم من حساب المدير
        </span>
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
        <span v-if="dayClosed" data-testid="day-closed-banner"
          class="text-xs bg-green-50 text-green-800 border border-green-200 rounded-full px-2.5 py-1 flex items-center gap-1">
          <Icon name="check" :size="13" /> هذا اليوم مقفل — القراءات مسجلة والتسوية المالية أُنشئت
        </span>
        <span v-if="cycleNotConfigured" data-testid="cycle-warning"
          class="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-1">
          لم يتم ضبط وقت إقفال اليوم لهذه المحطة — يتم استخدام 23:00 مؤقتاً. اضبطه من صفحة تعديل المحطة.
        </span>
        <span v-if="allDone" class="flex items-center gap-2 text-green-700 font-bold">
          <Icon name="check" :size="18" /> جميع القراءات مكتملة
        </span>
        <span v-else class="flex items-center gap-2 text-amber-700 font-bold">
          <Icon name="alert" :size="18" /> {{ doneGuns }} / {{ totalGuns }} مكتملة
          <span class="text-xs font-normal text-gray-500">— تبقي {{ countReadings(totalGuns - doneGuns) }} اليوم</span>
        </span>
        <span v-if="exceptionGuns" class="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2.5 py-1">
          {{ countExceptions(exceptionGuns) }}
        </span>
        <span class="mr-auto text-sm text-gray-600 tabular-nums">
          إجمالي اللترات: <b class="text-blue-700">{{ fmtNum(todayLiters, 3) }}</b> لتر
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
        <div v-for="(g, gi) in isl.guns" :key="g.row.meter.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
            <!-- The operator knows a gun by its position on the pump («مسدس A»),
                 not by its generated meter code. The code stays as small
                 secondary text for whoever cross-checks the physical pump. -->
            <div class="flex items-center gap-2 flex-wrap">
              <b class="text-base">المسدس {{ g.row.gunLetter }}</b>
              <span class="text-xs text-gray-500">{{ g.mach.name }}</span>
              <span class="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{{ g.row.meter.fuel_type }}</span>
              <span class="text-[11px] text-gray-400 tabular-nums" data-testid="gun-code">{{ g.row.meter.meter_code }}</span>
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
            <!-- ALREADY SAVED today: show the record that was written, not an
                 empty "current" field. Reloading the page used to make a saved
                 reading look like nothing had been entered. -->
            <template v-if="g.row.meter.reading && g.row.meter.reading.end_reading !== null && g.row.meter.reading.end_reading !== undefined">
              <div class="bg-gray-50 rounded-lg p-3" data-testid="gun-previous">
                <div class="text-xs text-gray-500 mb-1">القراءة السابقة</div>
                <b class="tabular-nums text-lg">{{ fmtNum(g.row.meter.reading.start_reading ?? prevOf(g.row), 3) }}</b>
              </div>
              <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3" data-testid="gun-saved-current">
                <div class="text-xs text-emerald-700 mb-1 flex items-center gap-1">
                  <Icon name="check" :size="12" /> القراءة المسجلة اليوم
                </div>
                <b class="tabular-nums text-lg text-emerald-800">{{ fmtNum(g.row.meter.reading.end_reading, 3) }}</b>
              </div>
              <div class="rounded-lg p-3 bg-blue-50" data-testid="gun-saved-liters">
                <div class="text-xs text-gray-500 mb-1">اللترات المباعة</div>
                <b class="tabular-nums text-lg text-blue-700">{{ fmtNum(g.row.meter.reading.liters_sold || 0, 3) }} لتر</b>
                <div v-if="expectedOf(g.row) !== null" class="text-xs text-gray-500 mt-0.5">
                  المبيعات المتوقعة: <span class="tabular-nums">{{ fmtMoney(expectedOf(g.row)) }}</span>
                </div>
              </div>
            </template>

            <!-- not saved yet: the operator fills exactly one field -->
            <template v-else>
            <!-- previous reading (auto, read-only) -->
            <div class="bg-gray-50 rounded-lg p-3" data-testid="gun-previous">
              <div class="text-xs text-gray-500 mb-1">القراءة السابقة (تلقائية)</div>
              <b class="tabular-nums text-lg">{{ fmtNum(prevOf(g.row), 3) }}</b>
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
                  :disabled="!!g.row.meter.reading || dayClosed"
                  :class="needsException(g.row) ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-300'"
                  class="w-full border rounded-lg pl-14 pr-4 py-3 text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="أدخل القراءة الحالية"
                />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">لتر</span>
              </div>
              <div v-if="liveLiters(g.row) !== null" class="text-xs mt-1" :class="liveLiters(g.row) < 0 ? 'text-red-600' : 'text-gray-500'">
                <template v-if="liveLiters(g.row) < 0">القراءة الحالية أقل من القراءة السابقة</template>
                <template v-else>= {{ fmtNum(liveLiters(g.row), 3) }} لتر مباعة</template>
              </div>
            </div>
            <!-- liters preview + expected sales (backend price) -->
            <div class="rounded-lg p-3" :class="needsException(g.row) ? 'bg-red-50' : 'bg-blue-50'">
              <div class="text-xs text-gray-500 mb-1">اللترات المباعة</div>
              <template v-if="needsException(g.row)">
                <!-- Never show a negative litres figure: it is not a real
                     quantity and it reads as a huge loss at a glance. -->
                <b class="text-sm text-red-700 leading-snug">
                  {{ liveLiters(g.row) === null ? 'لا يمكن إدخال قراءة سالبة' : 'لا يمكن حساب المبيعات — القراءة أقل من السابقة' }}
                </b>
                <div class="text-xs text-red-600 mt-1">اختر نوع الاستثناء بالأسفل لتسجيل السبب</div>
              </template>
              <b v-else class="tabular-nums text-lg text-blue-700">
                {{ liveLiters(g.row) === null ? '—' : fmtNum(liveLiters(g.row), 3) + ' لتر' }}
              </b>
              <div v-if="expectedOf(g.row) !== null && !(liveLiters(g.row) !== null && liveLiters(g.row) < 0)" class="text-xs text-gray-500 mt-0.5">
                المبيعات المتوقعة: <span class="tabular-nums">{{ fmtMoney(expectedOf(g.row)) }}</span>
              </div>
            </div>
            </template>
          </div>

          <!-- negative / exception flow (§13): block silent submission, require reason -->
          <div v-if="needsException(g.row) || g.row.showException" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div>
              <label class="block text-xs text-amber-800 mb-1">نوع الاستثناء {{ exceptionHint(g.row) }}</label>
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
          <button v-else-if="!g.row.meter.reading" type="button" class="mt-2 text-xs text-gray-400 hover:text-gray-600 min-h-[44px]" @click="g.row.showException = true">
            + تسجيل استثناء (تصفير / استبدال العداد)
          </button>
        </div>
      </div>
    </div>

    <!-- sticky save bar. On a phone it sits ABOVE the fixed bottom nav
         (bottom-16) — pinned to bottom-0 it was painted underneath the nav,
         hiding the one button the employee must press. -->
    <div v-if="data && stationSel" class="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:right-14 bg-white border-t border-gray-200 px-4 py-3 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <!-- Outcome of the last save, repeated next to the button that was
           pressed. The banner at the top of the page is off-screen on a phone
           once the gun list is scrolled, so a failed save looked like nothing
           happened at all. -->
      <div v-if="error || notice" class="max-w-6xl mx-auto mb-2 text-xs leading-snug rounded-lg px-3 py-2"
        :class="error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'"
        :data-testid="error ? 'save-bar-error' : 'save-bar-notice'">
        {{ error || notice }}
      </div>
      <div class="max-w-6xl mx-auto flex items-center gap-3 flex-wrap">
        <span class="text-sm text-gray-600">
          أدخلت الآن: <b>{{ filledNow }}</b> · مكتملة: <b>{{ doneGuns }}/{{ totalGuns }}</b>
        </span>
        <span class="text-sm text-gray-600 tabular-nums hidden sm:inline">
          الإجمالي: <b class="text-blue-700">{{ fmtNum(todayLiters, 3) }}</b> لتر
        </span>
        <button
          data-testid="save-readings"
          :disabled="saving || !filledNow || dayClosed"
          @click="save"
          class="mr-auto bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-primary/90"
        >
          {{ saving ? 'جاري الحفظ...' : 'حفظ القراءات المُدخلة' }}
        </button>
      </div>
    </div>
  </div>
</template>
