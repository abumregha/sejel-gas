<script setup>
// Tank card — rendered from backend tank payload (status computed server-side,
// prompt §12: the SPA never re-derives thresholds). Click opens details.
import Icon from './Icon.vue'
import HelpTip from '../HelpTip.vue'
import { label } from '../../utils/labels'

const props = defineProps({
  tank: { type: Object, required: true },
})

const statusStyle = {
  normal: { bar: 'bg-green-500', chip: 'bg-green-50 text-green-700 border-green-200', icon: 'check', text: 'طبيعي' },
  low: { bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'alert', text: 'منخفض' },
  critical: { bar: 'bg-red-500', chip: 'bg-red-50 text-red-700 border-red-200', icon: 'alert', text: 'حرج' },
  empty: { bar: 'bg-red-700', chip: 'bg-red-50 text-red-800 border-red-200', icon: 'xcircle', text: 'فارغ' },
  full: { bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'info', text: 'ممتلئ' },
}

function fmt(n) {
  return (n ?? 0).toLocaleString('ar-LY', { maximumFractionDigits: 0 })
}
</script>

<template>
  <button
    data-testid="tank-card"
    class="w-full text-right bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300"
    @click="$emit('open', tank)"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="text-gray-400"><Icon name="tank" :size="18" /></div>
        <span class="font-bold truncate">{{ tank.name }}</span>
        <HelpTip text="حالة الخزان تُحسب تلقائيًا من نسبة المستوى الحالي إلى السعة. اضغط البطاقة لعرض آخر القراءات والتفاصيل." />
      </div>
      <span class="text-[11px] border rounded-full px-2 py-0.5 flex items-center gap-1" :class="statusStyle[tank.status]?.chip">
        <Icon :name="statusStyle[tank.status]?.icon || 'info'" :size="12" />
        {{ statusStyle[tank.status]?.text || tank.status }}
      </span>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5">
      <span class="flex items-center gap-1"><Icon name="drop" :size="12" />{{ tank.fuel_type }}</span>
      <span class="tabular-nums">{{ fmt(tank.current_level) }} / {{ fmt(tank.capacity) }} لتر</span>
    </div>

    <!-- level bar -->
    <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden" role="img" :aria-label="`مستوى ${tank.name} ${tank.percent}%`">
      <div
        class="h-full rounded-full transition-all duration-500"
        :class="statusStyle[tank.status]?.bar || 'bg-gray-400'"
        :style="{ width: Math.min(100, tank.percent || 0) + '%' }"
      />
    </div>
    <div class="flex items-center justify-between mt-1.5 text-[11px] text-gray-400">
      <span class="tabular-nums">{{ (tank.percent ?? 0).toFixed(1) }}%</span>
      <span v-if="tank.unit_price != null" class="tabular-nums">سعر البيع: {{ tank.unit_price.toLocaleString('ar-LY') }} د.ل</span>
    </div>
  </button>
</template>
