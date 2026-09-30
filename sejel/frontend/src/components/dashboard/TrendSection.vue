<script setup>
// Charts section for the station dashboard: gauges (tank levels / volume)
// + the 14-day trend line chart. All values come from the backend payload
// (`trend`, `tanks`, `summary`); nothing is recomputed here.
import { computed } from 'vue'
import LineChart from './LineChart.vue'
import GaugeCard from './GaugeCard.vue'
import HelpTip from '../HelpTip.vue'
import { fmtNum } from './format'

const props = defineProps({
  trend: { type: Object, default: null },
  tanks: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({}) },
})

const gaugeColor = (status) => ({
  normal: '#22c55e', low: '#f59e0b', critical: '#ef4444', empty: '#b91c1c', full: '#3b82f6',
}[status] || '#9ca3af')

const gauges = computed(() => props.tanks.slice(0, 4).map((t) => ({
  label: t.name,
  value: t.percent,
  color: gaugeColor(t.status),
  caption: `${t.fuel_type || ''} — ${fmtNum(t.current_level)} / ${fmtNum(t.capacity)} لتر`,
})))

const series = computed(() => {
  const t = props.trend
  if (!t?.has_data) return []
  return [
    { name: 'اللترات المباعة', color: '#3b82f6', data: t.liters },
    { name: 'التحصيل (د.ل)', color: '#22c55e', data: t.collection },
    { name: 'الفرق (د.ل)', color: '#f59e0b', data: t.difference },
  ]
})
</script>

<template>
  <section class="space-y-4">
    <!-- gauges row -->
    <div v-if="gauges.length" class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <GaugeCard v-for="g in gauges" :key="g.label" v-bind="g" />
    </div>

    <!-- trend chart -->
    <div v-if="trend">
      <h2 class="font-bold mb-3 flex items-center gap-2">
        اتجاه ١٤ يوماً
        <HelpTip text="مبيعات وتحصيل وفروق المطابقة لآخر 14 يوماً حسب التسويات المغلقة. الأيام بدون تسوية تظهر صفراً." />
      </h2>
      <LineChart v-if="trend.has_data" :labels="trend.labels" :series="series" />
      <div v-else class="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
        لا توجد تسويات مغلقة في آخر 14 يوماً — سيظهر المخطط تلقائياً بعد أول إقفال مناوبة
      </div>
    </div>
  </section>
</template>
