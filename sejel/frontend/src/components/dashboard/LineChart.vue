<script setup>
// Multi-series SVG line chart (hand-rolled — no chart lib). Receives parallel
// arrays from the backend (dashboard `trend` payload); zeros are truthful
// (nothing closed that day). RTL-safe: X axis is drawn left→right oldest→newest
// which is the standard reading direction for time series even in RTL locales.
import { computed } from 'vue'

const props = defineProps({
  labels: { type: Array, default: () => [] },      // ISO dates
  series: { type: Array, required: true },          // [{ name, color, data: [num] }]
  height: { type: Number, default: 190 },
  yUnit: { type: String, default: '' },
})

const W = 640
const H = computed(() => props.height)
const PAD_L = 46
const PAD_R = 12
const PAD_T = 12
const PAD_B = 26

const n = computed(() => props.labels.length)
const maxVal = computed(() => {
  let m = 0
  for (const s of props.series) for (const v of s.data) m = Math.max(m, Number(v) || 0)
  return m || 1
})
// round the axis max up to a pleasant number
const yMax = computed(() => {
  const raw = maxVal.value
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  return Math.ceil(raw / mag) * mag
})

const x = (i) => PAD_L + (n.value <= 1 ? (W - PAD_L - PAD_R) / 2 : (W - PAD_L - PAD_R) * (i / (n.value - 1)))
const y = (v) => PAD_T + (H.value - PAD_T - PAD_B) * (1 - (Number(v) || 0) / yMax.value)

const pathFor = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

const yTicks = computed(() => {
  const t = []
  for (let i = 0; i <= 4; i++) t.push(yMax.value * i / 4)
  return t
})

// show ~6 x labels max
const xLabelIdx = computed(() => {
  const idx = []
  const step = Math.max(1, Math.ceil(n.value / 6))
  for (let i = 0; i < n.value; i += step) idx.push(i)
  return idx
})

const shortDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('ar-LY-u-nu-latn', { day: 'numeric', month: 'short' }) } catch { return iso }
}
const fmt = (v) => (Number(v) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
      <div class="flex items-center gap-3 flex-wrap">
        <span v-for="s in series" :key="s.name" class="flex items-center gap-1.5 text-xs text-gray-500">
          <span class="inline-block w-3 h-1.5 rounded-full" :style="{ background: s.color }" />{{ s.name }}
        </span>
      </div>
    </div>
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" role="img" aria-label="مخطط الاتجاه">
      <!-- gridlines -->
      <g v-for="(t, i) in yTicks" :key="'g' + i">
        <line :x1="PAD_L" :x2="W - PAD_R" :y1="y(t)" :y2="y(t)" stroke="#f1f5f9" stroke-width="1" />
        <text :x="PAD_L - 6" :y="y(t) + 3" text-anchor="end" class="fill-gray-400" style="font-size: 9px">{{ fmt(t) }}</text>
      </g>
      <!-- series -->
      <g v-for="s in series" :key="s.name">
        <path :d="pathFor(s.data)" fill="none" :stroke="s.color" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <circle v-for="(v, i) in s.data" :key="i" :cx="x(i)" :cy="y(v)" r="2.5" :fill="s.color">
          <title>{{ shortDate(labels[i]) }}: {{ fmt(v) }}{{ yUnit }}</title>
        </circle>
      </g>
      <!-- x labels -->
      <text v-for="i in xLabelIdx" :key="'x' + i" :x="x(i)" :y="H - 8" text-anchor="middle" class="fill-gray-400" style="font-size: 9px">
        {{ shortDate(labels[i]) }}
      </text>
    </svg>
  </div>
</template>
