<script setup>
// Semi-circular SVG gauge for the dashboard (hand-rolled — no chart lib,
// consistent with the icon approach; prompt §26: restrained animation).
// Value 0..100 (%). Color + label come from the backend status, never
// recomputed in the SPA.
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  unit: { type: String, default: '%' },
  color: { type: String, default: '#22c55e' }, // hex — SVG stroke, from status map
  caption: { type: String, default: '' },
})

const RADIUS = 54
const CIRC = Math.PI * RADIUS // half circle arc length

const pct = computed(() => Math.max(0, Math.min(100, Number(props.value) || 0)))
const dashOffset = computed(() => CIRC * (1 - pct.value / 100))
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center">
    <div class="text-xs text-gray-500 mb-1">{{ label }}</div>
    <svg viewBox="0 0 140 82" class="w-full max-w-[190px]" role="img" :aria-label="`${label} ${value}${unit}`">
      <!-- track -->
      <path d="M 16 74 A 54 54 0 0 1 124 74" fill="none" stroke="#e5e7eb" stroke-width="11" stroke-linecap="round" />
      <!-- value arc -->
      <path
        d="M 16 74 A 54 54 0 0 1 124 74"
        fill="none" :stroke="color" stroke-width="11" stroke-linecap="round"
        :stroke-dasharray="CIRC" :stroke-dashoffset="dashOffset"
        style="transition: stroke-dashoffset 600ms ease"
      />
      <text x="70" y="66" text-anchor="middle" class="fill-gray-800" style="font-size: 21px; font-weight: 700">
        {{ pct.toLocaleString('ar-LY', { maximumFractionDigits: 1 }) }}{{ unit }}
      </text>
    </svg>
    <div v-if="caption" class="text-[11px] text-gray-400 mt-1 text-center">{{ caption }}</div>
  </div>
</template>
