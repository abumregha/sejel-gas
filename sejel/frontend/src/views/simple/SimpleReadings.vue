<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-800">قراءات المضخات</h2>
      <span class="text-xs text-gray-500">{{ doneGuns }} / {{ totalGuns }} مكتملة</span>
    </div>

    <div v-if="loading" class="text-sm text-gray-400 py-10 text-center">جارٍ التحميل…</div>
    <div v-else-if="!gunRows.length" class="text-sm text-gray-400 bg-white border border-dashed border-gray-200 rounded-xl p-8 text-center">
      لا توجد مسدسات معرّفة لهذه المحطة
    </div>

    <div v-else class="space-y-3">
      <!-- ONE field per gun: the current reading. The previous value is
           read-only context. Exception fields appear ONLY when the typed
           reading is lower than the previous one. -->
      <div v-for="g in gunRows" :key="g.meter.id" data-testid="simple-gun-card"
        :data-saved="g.saved ? 'true' : 'false'"
        :data-prev="g.prev == null ? '' : String(g.prev)"
        class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <b>المسدس {{ g.letter }}</b>
            <span class="text-xs text-gray-500">{{ g.mach.name }}</span>
            <span class="text-[11px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{{ g.meter.fuel_type }}</span>
          </div>
          <span v-if="g.saved" data-testid="simple-gun-saved"
            class="text-[11px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">مسجلة</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-gray-50 p-3 text-center">
            <div class="text-[11px] text-gray-500 mb-1">القراءة السابقة</div>
            <b class="tabular-nums text-lg">{{ fmtNum(g.prev, 3) }}</b>
          </div>
          <div v-if="g.saved" class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
            <div class="text-[11px] text-emerald-700 mb-1">المسجلة اليوم</div>
            <b class="tabular-nums text-lg text-emerald-800">{{ fmtNum(g.meter.reading.end_reading, 3) }}</b>
          </div>
          <label v-else class="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center cursor-pointer">
            <div class="text-[11px] text-blue-700 mb-1">القراءة الحالية</div>
            <input v-model.number="g.current" data-testid="simple-gun-input" type="number" min="0" step="0.001"
              inputmode="decimal" :disabled="dayClosed"
              class="w-full bg-transparent text-center text-xl font-bold tabular-nums focus:outline-none" />
          </label>
        </div>

        <!-- A gun with no history yet: this first reading establishes the
             baseline and books 0 L (same backend rule as Manager Mode — the
             operator must see it before saving). -->
        <div v-if="!g.saved && isOpening(g)" data-testid="simple-gun-opening"
          class="mt-2 text-[11px] bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5 inline-block">
          قراءة افتتاحية — تُحفظ كخط أساس ولا تُحتسب مبيعات
        </div>

        <!-- Liters preview -->
        <div v-if="!g.saved && litersOf(g) !== null && !isOpening(g)" class="text-xs text-gray-500 mt-2 text-center tabular-nums">
          {{ fmtNum(litersOf(g), 3) }} لتر
        </div>

        <!-- Exception fields ONLY for a backwards reading -->
        <div v-if="!g.saved && needsException(g)" data-testid="simple-gun-exception"
          class="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2">
          <div class="text-xs text-amber-800">القراءة أقل من السابقة — اختر السبب:</div>
          <select v-model="g.exceptionType" class="w-full border border-amber-300 rounded-lg px-3 py-2.5 text-sm bg-white">
            <option value="reset">تصفير العداد</option>
            <option value="replacement">استبدال العداد</option>
            <option value="other">سبب آخر</option>
          </select>
          <input v-model="g.notes" type="text" placeholder="اكتب السبب هنا"
            class="w-full border border-amber-300 rounded-lg px-3 py-2.5 text-sm" />
        </div>
      </div>

      <!-- One Save button -->
      <button data-testid="simple-save-readings" @click="save" :disabled="saving || dayClosed"
        class="w-full min-h-[60px] rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-50">
        {{ saving ? 'جاري الحفظ…' : 'حفظ القراءات' }}
      </button>
    </div>
  </div>
</template>

<script setup>
// Simple Mode readings — the operator types ONE number per gun and saves.
// No corrections, no baselines, no deletions (those live in Manager Mode).
import { computed, reactive, ref, onMounted } from 'vue'
import api from '../../api'
import friendlyError from '../../errors'
import { useStationStore } from '../../stores/station'
import { useToast } from '../../composables/useToast'
import { fmtNum } from '../../components/dashboard/format'

const stationStore = useStationStore()
const { show } = useToast()

const loading = ref(true)
const saving = ref(false)
const dash = ref(null)
const dateStr = new Date().toISOString().slice(0, 10)

const dayClosed = computed(() =>
  (dash.value?.shifts || []).some((s) => s.is_day_close && s.status === 'closed'))

const gunRows = computed(() => {
  const rows = []
  for (const isl of dash.value?.islands || []) {
    for (const mach of isl.machines || []) {
      let letter = 0
      for (const m of mach.meters || []) {
        if (m.status === 'inactive') continue
        const reading = m.reading || null
        const prev = (reading && reading.end_reading != null)
          ? reading.end_reading
          : (m.current_reading ?? null)
        // reactive() is REQUIRED: the template's exception v-if and liters
        // preview read g.current while v-model writes into these row objects.
        // Plain objects here = silent no-reactivity (typed value lands in the
        // model but the UI never reacts until reload).
        rows.push(reactive({
          meter: m, mach, letter: String.fromCharCode(65 + letter),
          saved: !!(reading && reading.end_reading != null),
          prev, current: '', exceptionType: 'reset', notes: '',
        }))
        letter++
      }
    }
  }
  return rows
})

const totalGuns = computed(() => gunRows.value.length)
const doneGuns = computed(() => gunRows.value.filter((g) => g.saved).length)

function litersOf(g) {
  const cur = Number(g.current)
  if (!Number.isFinite(cur) || g.prev == null) return null
  const l = cur - Number(g.prev)
  return l >= 0 ? l : null
}

// First reading of a gun with no counter yet: a baseline, not a sale —
// the backend books 0 L for it (same rule Manager Mode badges).
function isOpening(g) {
  return !g.prev
}

function needsException(g) {
  const cur = Number(g.current)
  if (g.current === '' || g.current == null) return false
  if (!Number.isFinite(cur) || cur < 0) return true
  return g.prev != null && cur < Number(g.prev)
}

async function load() {
  if (!stationStore.currentStation) { loading.value = false; return }
  loading.value = true
  try {
    const { data } = await api.get('/dashboard-station/', { params: { date: dateStr } })
    dash.value = data
  } catch (e) {
    show(friendlyError(e), 'error')
  } finally {
    loading.value = false
  }
}

async function save() {
  const pending = gunRows.value.filter((g) => !g.saved && g.current !== '' && g.current != null)
  if (!pending.length) { show('أدخل قراءة واحدة على الأقل أولاً', 'error'); return }
  saving.value = true
  try {
    // Server-side idempotent ensure — same contract the old screen uses.
    const { data: sh } = await api.post('/ensure-day-close/', {
      station: stationStore.currentStation, date: dateStr,
    })
    if (sh.closed || sh.status === 'closed') {
      show('تم إقفال هذا اليوم — لا يمكن إضافة قراءات إليه', 'error')
      return
    }
    const saved = []
    const failed = []
    for (const g of pending) {
      const liters = litersOf(g)
      const body = {
        shift: sh.name,
        meter: g.meter.id,
        start_reading: Number(g.prev),
        end_reading: Number(g.current),
        source: 'manual',
      }
      if (liters === null || liters < 0) {
        body.exception_type = g.exceptionType || 'other'
        body.notes = g.notes || '—'
      }
      try {
        await api.post('/meter-readings/', body)
        saved.push(g)
      } catch (e) {
        failed.push(`المسدس ${g.letter} — ${friendlyError(e)}`)
      }
    }
    if (failed.length) show(`تم حفظ ${saved.length} — لم تُحفظ: ${failed.join(' · ')}`, 'error')
    else show(`تم حفظ ${saved.length} قراءة بنجاح`)
    await load()
  } catch (e) {
    show(friendlyError(e), 'error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
