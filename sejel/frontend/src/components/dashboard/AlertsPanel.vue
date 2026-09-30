<script setup>
// Alerts (prompt §17): computed server-side; each alert is clickable and
// deep-links to the relevant record.
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'

const props = defineProps({
  alerts: { type: Array, required: true },
})

const router = useRouter()

const sev = {
  critical: { cls: 'bg-red-50 border-red-200 text-red-800', icon: 'alert' },
  warning: { cls: 'bg-amber-50 border-amber-200 text-amber-800', icon: 'alert' },
  info: { cls: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'info' },
}

function go(a) {
  if (!a.link) return
  if (a.link.startsWith('/app/')) window.open(a.link, '_blank')
  else router.push(a.link)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 class="font-bold flex items-center gap-2 mb-3">
      <Icon name="alert" :size="17" class="text-gray-400" /> التنبيهات
      <span v-if="alerts.length" class="text-xs font-normal bg-red-100 text-red-700 rounded-full px-2 py-0.5">{{ alerts.length }}</span>
    </h3>

    <div v-if="alerts.length" class="space-y-2">
      <button
        v-for="(a, i) in alerts"
        :key="i"
        class="w-full text-right flex items-start gap-2 border rounded-lg px-3 py-2 text-sm transition-colors hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        :class="sev[a.severity]?.cls || sev.info.cls"
        @click="go(a)"
      >
        <Icon :name="sev[a.severity]?.icon || 'info'" :size="15" class="mt-0.5 shrink-0" />
        <span class="leading-snug">{{ a.message }}</span>
      </button>
    </div>
    <div v-else class="text-sm text-gray-400 py-4 text-center flex items-center justify-center gap-2">
      <Icon name="check" :size="15" class="text-green-500" /> لا توجد تنبيهات
    </div>
  </div>
</template>
