<script setup>
// KPI card — icon + Arabic label + backend value. No emoji (prompt §4).
import Icon from './Icon.vue'
import HelpTip from '../HelpTip.vue'

const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], default: null },
  hint: { type: String, default: '' },
  help: { type: String, default: '' },   // Arabic explanation shown on "?" hover
  tone: { type: String, default: 'gray' }, // gray | green | red | blue | amber
})

const tones = {
  gray: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
}

function fmt(v) {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'string') return v
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
</script>

<template>
  <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
    <div class="rounded-lg p-2 shrink-0" :class="tones[tone] || tones.gray">
      <Icon :name="icon" :size="20" />
    </div>
    <div class="min-w-0">
      <div class="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
        {{ label }}
        <HelpTip v-if="help" :text="help" />
      </div>
      <div class="font-bold text-lg leading-tight tabular-nums">{{ fmt(value) }}</div>
      <div v-if="hint" class="text-[11px] text-gray-400 mt-0.5">{{ hint }}</div>
    </div>
  </div>
</template>
