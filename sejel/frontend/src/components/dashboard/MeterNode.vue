<script setup>
// Meter node — compact interactive chip representing one meter inside a pump
// card. Status = icon + label + color (never color alone, prompt §10).
// Green: reading today & valid · Amber: exception or no reading yet ·
// Gray: meter inactive · Red: missing reading on an active meter after shift
// open (simplified here: active meter with no reading = amber; exception = red
// if unauthorized, amber if authorized).
import Icon from './Icon.vue'

const props = defineProps({
  meter: { type: Object, required: true },
})

const emit = defineEmits(['open'])

function state(m) {
  if (m.status === 'inactive') return { cls: 'bg-gray-50 border-gray-200 text-gray-400', icon: 'minus', text: 'خارج الخدمة' }
  const rd = m.reading
  if (rd?.exception_type) {
    return rd.exception_authorized_by
      ? { cls: 'bg-amber-50 border-amber-300 text-amber-700', icon: 'alert', text: 'استثناء معتمد' }
      : { cls: 'bg-red-50 border-red-300 text-red-700', icon: 'alert', text: 'استثناء' }
  }
  if (rd) return { cls: 'bg-green-50 border-green-300 text-green-700', icon: 'check', text: 'تمت القراءة' }
  return { cls: 'bg-amber-50 border-amber-300 text-amber-700', icon: 'clock', text: 'بانتظار القراءة' }
}
</script>

<template>
  <button
    class="group relative flex items-center gap-1.5 border rounded-lg px-2 py-1.5 text-xs font-medium transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    :class="state(meter).cls"
    :title="`${meter.meter_code} — ${state(meter).text}`"
    @click="emit('open', meter)"
  >
    <Icon :name="state(meter).icon" :size="13" />
    <span class="tabular-nums">{{ meter.meter_code }}</span>
    <span class="hidden xl:inline">{{ state(meter).text }}</span>
  </button>
</template>
