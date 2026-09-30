<script setup>
// Detail drawers (prompt §7/§8/§9/§11): island, machine/pump, meter and tank
// each open this one component with a kind + payload. The meter drawer lazy-
// fetches the reading history from the CRUD API; the tank drawer fetches the
// latest tank readings. Machine/island detail comes from the dashboard payload
// itself (no extra request).
import { ref, computed, watch } from 'vue'
import DrawerBase from './DrawerBase.vue'
import Icon from './Icon.vue'
import { fmtNum, fmtMoney, fmtDateTime } from './format'
import { SHIFT_STATUS, METER_STATUS } from '../../utils/labels'
import api from '../../api'

const props = defineProps({
  open: { type: Boolean, default: false },
  kind: { type: String, default: '' }, // meter | machine | island | tank
  payload: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const history = ref([])
const historyLoading = ref(false)

const titles = { meter: 'عداد', machine: 'مضخة', island: 'جزيرة', tank: 'خزان' }

const title = computed(() => {
  const p = props.payload || {}
  if (props.kind === 'meter') return `عداد ${p.meter_code || ''}`
  if (props.kind === 'tank') return p.name || 'خزان'
  return `${titles[props.kind] || ''} ${p.name || ''}`.trim()
})

// --- meter reading history (lazy) -------------------------------------------
watch(
  () => [props.open, props.kind, props.payload?.id],
  async ([o, kind, id]) => {
    history.value = []
    if (!o || !id) return
    try {
      historyLoading.value = true
      if (kind === 'meter') {
        const { data } = await api.get('/meter-readings/', { params: { meter: id } })
        const rows = data.results || data
        history.value = rows.slice(0, 5)
      } else if (kind === 'tank') {
        const { data } = await api.get('/tank-readings/', { params: { tank: id } })
        const rows = data.results || data
        history.value = rows.slice(0, 5)
      }
    } catch {
      history.value = []
    } finally {
      historyLoading.value = false
    }
  },
  { immediate: true }
)

const readingStatusText = computed(() => {
  const p = props.payload || {}
  if (props.kind !== 'meter') return ''
  if (p.status === 'inactive') return 'خارج الخدمة'
  const rd = p.reading
  if (rd?.exception_type) return rd.exception_authorized_by ? 'استثناء معتمد' : 'استثناء غير معتمد'
  if (rd) return 'قراءة صحيحة'
  return 'بانتظار القراءة'
})
</script>

<template>
  <DrawerBase :open="open" :title="title" @close="emit('close')">
    <div v-if="payload" class="space-y-4">
      <!-- ================= METER ================= -->
      <template v-if="kind === 'meter'">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">نوع الوقود</div><b>{{ payload.fuel_type || '—' }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">المضخة</div><b>{{ payload.machine_name || '—' }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">القراءة الحالية (العداد)</div><b class="tabular-nums">{{ fmtNum(payload.current_reading) }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3">
            <div class="text-xs text-gray-500 mb-1">الحالة</div>
            <b :class="payload.reading ? 'text-green-700' : 'text-amber-700'">{{ readingStatusText }}</b>
          </div>
        </div>

        <div v-if="payload.reading" class="border rounded-xl p-4">
          <h4 class="font-bold mb-3 flex items-center gap-2 text-sm"><Icon name="gauge" :size="15" /> قراءة اليوم</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><div class="text-xs text-gray-500">القراءة السابقة</div><b class="tabular-nums">{{ fmtNum(payload.reading.start_reading) }}</b></div>
            <div><div class="text-xs text-gray-500">القراءة الحالية</div><b class="tabular-nums">{{ fmtNum(payload.reading.end_reading) }}</b></div>
            <div><div class="text-xs text-gray-500">اللترات المبيعة</div><b class="tabular-nums text-blue-700">{{ fmtNum(payload.reading.liters_sold) }} لتر</b></div>
            <div><div class="text-xs text-gray-500">المبيعات المتوقعة</div><b class="tabular-nums">{{ fmtMoney(payload.reading.expected_sales) }}</b></div>
            <div><div class="text-xs text-gray-500">الموظف</div><b>{{ payload.reading.attendant || '—' }}</b></div>
            <div><div class="text-xs text-gray-500">وقت التسجيل</div><b>{{ fmtDateTime(payload.reading.recorded_at) }}</b></div>
          </div>
          <div v-if="payload.reading.exception_type" class="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm flex items-start gap-2">
            <Icon name="alert" :size="16" class="text-amber-600 mt-0.5" />
            <div>
              <b>استثناء قراءة: {{ payload.reading.exception_type }}</b>
              <div v-if="payload.reading.exception_authorized_by" class="text-xs text-gray-600 mt-0.5">اعتمده: {{ payload.reading.exception_authorized_by }}</div>
            </div>
          </div>
          <div v-if="payload.reading.photo" class="mt-3">
            <a
              :href="payload.reading.photo"
              target="_blank"
              class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
            >
              <Icon name="camera" :size="15" /> عرض صورة العداد
            </a>
          </div>
        </div>
        <div v-else class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
          <Icon name="clock" :size="16" class="mt-0.5" />
          لا توجد قراءة مسجلة لهذا العداد اليوم
        </div>

        <!-- reading history -->
        <div v-if="history.length" class="border rounded-xl p-4">
          <h4 class="font-bold mb-2 text-sm">آخر القراءات</h4>
          <table class="w-full text-xs">
            <thead><tr class="text-gray-500 text-right">
              <th class="py-1.5 font-medium">الوقت</th><th class="font-medium">من</th><th class="font-medium">إلى</th><th class="font-medium">لترات</th>
            </tr></thead>
            <tbody>
              <tr v-for="h in history" :key="h.name" class="border-t border-gray-50 tabular-nums">
                <td class="py-1.5">{{ fmtDateTime(h.recorded_at) }}</td>
                <td>{{ fmtNum(h.start_reading) }}</td>
                <td>{{ fmtNum(h.end_reading) }}</td>
                <td class="font-bold">{{ fmtNum(h.liters_sold) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- ================= MACHINE ================= -->
      <template v-else-if="kind === 'machine'">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">الجزيرة</div><b>{{ payload.islandName || '—' }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">عدد العدادات</div><b>{{ (payload.meters || []).length }}</b></div>
        </div>
        <div class="border rounded-xl divide-y">
          <div v-for="m in payload.meters || []" :key="m.id" class="flex items-center justify-between p-3 text-sm">
            <span class="font-medium tabular-nums">{{ m.meter_code }}</span>
            <span class="text-gray-500">{{ m.fuel_type }} · {{ m.reading ? fmtNum(m.reading.liters_sold) + ' لتر اليوم' : 'بدون قراءة' }}</span>
          </div>
        </div>
      </template>

      <!-- ================= ISLAND ================= -->
      <template v-else-if="kind === 'island'">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">عدد المضخات</div><b>{{ (payload.machines || []).length }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">عدد العدادات</div><b>{{ (payload.machines || []).reduce((a, m) => a + m.meters.length, 0) }}</b></div>
        </div>
        <div class="border rounded-xl divide-y">
          <div v-for="m in payload.machines || []" :key="m.id" class="flex items-center justify-between p-3 text-sm">
            <span class="font-medium">{{ m.name }}</span>
            <span class="text-gray-500">{{ m.meters.length }} عدادات</span>
          </div>
        </div>
      </template>

      <!-- ================= TANK ================= -->
      <template v-else-if="kind === 'tank'">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">نوع الوقود</div><b>{{ payload.fuel_type || '—' }}</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">السعة</div><b class="tabular-nums">{{ fmtNum(payload.capacity) }} لتر</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">المستوى الحالي</div><b class="tabular-nums">{{ fmtNum(payload.current_level) }} لتر</b></div>
          <div class="bg-gray-50 rounded-lg p-3"><div class="text-xs text-gray-500 mb-1">النسبة</div><b class="tabular-nums">{{ (payload.percent ?? 0).toFixed(1) }}%</b></div>
        </div>
        <div v-if="history.length" class="border rounded-xl p-4">
          <h4 class="font-bold mb-2 text-sm">آخر قراءات الخزان</h4>
          <table class="w-full text-xs">
            <thead><tr class="text-gray-500 text-right">
              <th class="py-1.5 font-medium">الوقت</th><th class="font-medium">المستوى</th><th class="font-medium">النوع</th>
            </tr></thead>
            <tbody>
              <tr v-for="h in history" :key="h.name" class="border-t border-gray-50 tabular-nums">
                <td class="py-1.5">{{ fmtDateTime(h.recorded_at) }}</td>
                <td>{{ fmtNum(h.reading_level) }} لتر</td>
                <td>{{ h.reading_type }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <router-link
          v-if="payload.id"
          :to="`/tanks/${payload.id}`"
          class="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
          @click="emit('close')"
        >
          فتح صفحة الخزان الكاملة
        </router-link>
      </template>
    </div>
  </DrawerBase>
</template>
