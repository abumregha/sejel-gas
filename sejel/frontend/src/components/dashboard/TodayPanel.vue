<template>
  <!--
    Operational control panel: answers «شن المطلوب مني اليوم؟» before any
    analytics. Everything shown here is a backend value from
    GET /api/dashboard-station/ — nothing is recomputed in the browser.
  -->
  <section class="mb-6 space-y-4" data-testid="today-panel">

    <!-- ---------- 1. today's cycle + the one primary action ---------- -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 sm:p-5 bg-gradient-to-l from-primary/10 to-transparent border-b border-gray-100">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs text-gray-500 mb-1">دورة اليوم</p>
            <h2 class="text-2xl font-bold tabular-nums flex items-center gap-2">
              <Icon name="clock" :size="22" class="text-primary" />
              <span v-if="cycleTime">{{ cycleTime }} ← {{ cycleTime }}</span>
              <!-- Still show the number the day is actually running on: an
                   operator needs to know WHICH cycle they are entering readings
                   into, not only that nobody configured one. -->
              <span v-else class="text-amber-700 text-lg">
                23:00 ← 23:00 <span class="text-sm font-normal">(مؤقت)</span>
              </span>
            </h2>
            <p class="text-sm text-gray-600 mt-1">
              {{ readingDate }} · الحالة:
              <span class="font-semibold" :class="dayTone">{{ dayStatusLabel }}</span>
            </p>
            <p v-if="!cycleTime" class="text-xs text-amber-700 mt-1">
              اضبطه من صفحة تعديل المحطة — بدونه تعمل الدورة على 23:00 بشكل مؤقت.
            </p>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold tabular-nums" :class="pending ? 'text-amber-600' : 'text-green-600'"
              data-testid="today-progress">
              {{ status.done }}<span class="text-lg text-gray-400">/</span>{{ status.total }}
            </div>
            <div class="text-xs text-gray-500">مكتملة</div>
            <div v-if="pending" class="text-sm font-semibold text-amber-700 mt-1" data-testid="today-pending">
              تبقي {{ pendingLabel }} اليوم
            </div>
            <div v-else class="text-sm font-semibold text-green-700 mt-1">كل القراءات مكتملة</div>
          </div>
        </div>

        <!-- the single obvious action; it changes with the state of the day -->
        <router-link
          :to="primaryAction.to"
          data-testid="today-primary-action"
          class="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white text-lg font-bold min-h-[56px] active:scale-[.99] transition"
          :class="primaryAction.tone">
          <Icon :name="primaryAction.icon" :size="22" />
          {{ primaryAction.label }}
        </router-link>
      </div>

      <!-- ---------- 2. reading status, island by island ---------- -->
      <div class="p-4 sm:p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-800">حالة المسدسات</h3>
          <span class="text-xs text-gray-500">اضغط على أي مسدس لإدخال قراءته</span>
        </div>

        <div v-if="!islands.length" class="text-sm text-gray-500 py-4">
          لا توجد مسدسات مُعرّفة لهذه المحطة.
        </div>

        <div v-for="isl in islands" :key="isl.id" class="mb-4 last:mb-0">
          <h4 class="text-sm font-bold text-gray-700 mb-2">{{ isl.name }}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="mach in isl.machines" :key="mach.id"
              class="border border-gray-200 rounded-xl p-3 bg-gray-50/60">
              <div class="text-xs text-gray-500 mb-2">{{ mach.name }}</div>
              <router-link
                v-for="(m, i) in mach.meters"
                :key="m.id"
                :to="`/readings?station=${stationId}&meter=${m.id}`"
                class="flex items-center justify-between gap-2 py-2 px-3 mb-1 last:mb-0 rounded-lg bg-white border border-gray-200 min-h-[44px] hover:bg-gray-50"
                data-testid="gun-row">
                <span class="flex items-center gap-2 min-w-0">
                  <span class="font-semibold text-sm">المسدس {{ letter(i) }}</span>
                  <span class="text-xs text-gray-400 truncate">{{ m.meter_code }}</span>
                </span>
                <span class="text-xs font-semibold rounded-full px-2 py-1 whitespace-nowrap"
                  :class="gunTone(m)">{{ gunLabel(m) }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ---------- 3. things that need a human ---------- -->
    <div v-if="attention.length" class="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5"
      data-testid="attention-panel">
      <h3 class="font-bold text-amber-900 mb-2 flex items-center gap-2">
        <Icon name="alert" :size="18" /> يحتاج تدخلًا ({{ attention.length }})
      </h3>
      <ul class="space-y-2">
        <li v-for="(a, i) in attention" :key="i">
          <router-link :to="a.to"
            class="flex items-start gap-2 bg-white border border-amber-200 rounded-lg px-3 py-3 min-h-[44px] hover:bg-amber-50">
            <Icon name="alert" :size="16" class="text-amber-600 mt-0.5 shrink-0" />
            <span class="text-sm text-amber-900">{{ a.message }}</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- ---------- 4. the day's money, in plain numbers ---------- -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5" data-testid="money-panel">
      <h3 class="font-bold text-gray-800 mb-3">النتيجة المالية لليوم</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="text-xs text-gray-500">المبيعات المتوقعة</div>
          <div class="font-bold tabular-nums text-lg">{{ money(kpis.expected_sales) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="text-xs text-gray-500">إجمالي التحصيل</div>
          <div class="font-bold tabular-nums text-lg">{{ money(kpis.total_collection) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="text-xs text-gray-500">النقد</div>
          <div class="font-bold tabular-nums text-lg">{{ money(kpis.total_cash) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3">
          <div class="text-xs text-gray-500">القسائم + الدفع الإلكتروني</div>
          <div class="font-bold tabular-nums text-lg">{{ money(num(kpis.total_vouchers) + num(kpis.total_pos)) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-2">
          <div class="text-xs text-gray-500">الفرق</div>
          <div class="font-bold tabular-nums text-lg" :class="diffTone">{{ signed(kpis.difference) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 col-span-2 sm:col-span-2">
          <div class="text-xs text-gray-500">صافي النقد</div>
          <div class="font-bold tabular-nums text-lg">{{ money(kpis.net_cash) }}</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 col-span-2">
          <div class="text-xs text-gray-500">اللترات المباعة</div>
          <div class="font-bold tabular-nums text-lg">{{ num(kpis.total_liters) }} لتر</div>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 col-span-2">
          <div class="text-xs text-gray-500">الوقود المتوفر في الخزانات</div>
          <div class="font-bold tabular-nums text-lg">{{ num(summary.current_volume) }} لتر</div>
          <div v-if="summary.tanks_count" class="text-xs text-gray-500">{{ summary.tanks_count }} خزانات</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import Icon from '../../components/dashboard/Icon.vue'
import { countReadings } from '../../utils/labels'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  data: { type: Object, required: true },
})

const auth = useAuthStore()

const stationId = computed(() => props.data?.station?.id || '')
// «Today» must be spelled out: the employee has to know WHICH day the panel
// is talking about before typing any reading into it.
const readingDate = computed(() => {
  const d = props.data?.meta?.date
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('ar-LY-u-nu-latn', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return String(d)
  }
})
const cycleTime = computed(() => (props.data?.station?.day_close_time || '').slice(0, 5))
const islands = computed(() => props.data?.islands || [])
const kpis = computed(() => props.data?.kpis || {})
const summary = computed(() => props.data?.summary || {})
const status = computed(() => props.data?.readings_status || { total: 0, done: 0, exceptions: 0 })
const pending = computed(() => Number(status.value.pending || 0))
// «تبقي 1 قراءات اليوم» was grammatically wrong and read as a glitch on the
// one sentence the employee opens the app to read.
const pendingLabel = computed(() => countReadings(pending.value))

const dayShift = computed(() => (props.data?.shifts || []).find((s) => s.is_day_close))
const dayClosed = computed(() => dayShift.value?.status === 'closed')

const dayStatusLabel = computed(() => {
  if (!cycleTime.value) return 'غير محدد'
  if (dayClosed.value) return 'مغلقة'
  if (pending.value === 0) return 'جاهزة للإقفال'
  if (status.value.done > 0) return 'قيد التسجيل'
  return 'لم تبدأ'
})
const dayTone = computed(() => {
  if (!cycleTime.value) return 'text-amber-700'
  if (dayClosed.value) return 'text-green-700'
  if (pending.value === 0) return 'text-green-700'
  return 'text-amber-700'
})

// The one action that matters right now. It follows the state of the day
// instead of always offering the same button.
const primaryAction = computed(() => {
  if (!cycleTime.value) {
    return { to: '/stations', label: 'اضبط وقت إقفال اليوم', icon: 'clock', tone: 'bg-amber-500 hover:bg-amber-600' }
  }
  if (pending.value > 0) {
    return { to: '/readings', label: 'إدخال القراءات', icon: 'gauge', tone: 'bg-primary hover:opacity-90' }
  }
  if (!dayClosed.value) {
    // Closing the day is a manager action (it creates the reconciliation), so a
    // supervisor must not be sent to a button that will refuse them.
    if (auth.canCloseDay) {
      return { to: '/readings', label: 'إقفال اليوم', icon: 'check', tone: 'bg-green-600 hover:bg-green-700' }
    }
    return { to: '/readings', label: 'القراءات جاهزة — بانتظار المدير', icon: 'check', tone: 'bg-green-600 hover:bg-green-700' }
  }
  return { to: '/finance/reconciliations', label: 'مراجعة تسوية اليوم', icon: 'report', tone: 'bg-gray-700 hover:bg-gray-800' }
})

const attention = computed(() => {
  const items = []
  // readings recorded as an exception
  for (const isl of islands.value) {
    for (const mach of isl.machines || []) {
      mach.meters.forEach((m, i) => {
        if (m.reading && m.reading.exception_type) {
          items.push({
            message: `${mach.name} — مسدس ${letter(i)}: استثناء (${m.reading.exception_type}) تم تسجيله`,
            to: '/readings',
          })
        }
      })
    }
  }
  // guns still missing
  if (pending.value > 0) {
    items.push({ message: `تبقي ${pendingLabel.value} لم تُدخل اليوم`, to: '/readings' })
  }
  // day not closed yet
  if (cycleTime.value && !dayClosed.value && pending.value === 0) {
    items.push({
      message: auth.canCloseDay
        ? 'كل القراءات مكتملة واليوم جاهز، لكنه لم يُقفل بعد'
        : 'كل القراءات مكتملة — بانتظار المدير لإقفال اليوم',
      to: '/readings',
    })
  }
  // backend alerts (empty tanks, low stock, ...)
  for (const a of props.data?.alerts || []) {
    items.push({ message: a.message, to: a.link || '/inventory/tank-readings' })
  }
  return items
})

function letter(i) {
  return String.fromCharCode(65 + i)
}
function num(v) {
  const n = Number(v || 0)
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
function money(v) {
  return num(v) + ' د.ل'
}
function signed(v) {
  const n = Number(v || 0)
  return (n > 0 ? '+' : '') + money(n)
}
function gunLabel(m) {
  if (!m.reading) return 'بانتظار القراءة'
  if (m.reading.exception_type) return 'استثناء'
  if (m.reading.is_opening) return 'قراءة افتتاحية'
  return 'مسجلة'
}
function gunTone(m) {
  if (!m.reading) return 'bg-amber-100 text-amber-800'
  if (m.reading.exception_type) return 'bg-red-100 text-red-800'
  if (m.reading.is_opening) return 'bg-sky-100 text-sky-800'
  return 'bg-green-100 text-green-800'
}
const diffTone = computed(() => {
  const t = kpis.value.difference_type
  if (t === 'shortage') return 'text-red-600'
  if (t === 'surplus') return 'text-amber-600'
  return 'text-green-600'
})
</script>