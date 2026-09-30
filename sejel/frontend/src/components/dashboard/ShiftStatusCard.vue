<script setup>
// Shift status (prompt §14): renders today's actual Shift records — there is
// no "scheduled" status in the backend, so nothing is invented here.
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { SHIFT_STATUS_PRIMARY, SHIFT_BADGE, label } from '../../utils/labels'

const props = defineProps({
  shifts: { type: Array, required: true },
})

const router = useRouter()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold flex items-center gap-2"><Icon name="clock" :size="17" class="text-gray-400" /> مناوبات اليوم</h3>
      <router-link to="/shifts" class="text-xs text-blue-700 hover:underline">كل المناوبات</router-link>
    </div>

    <div v-if="shifts.length" class="space-y-2">
      <button
        v-for="s in shifts"
        :key="s.id"
        class="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="router.push(`/shifts/${s.id}`)"
      >
        <span class="flex items-center gap-2 min-w-0">
          <b class="truncate">{{ s.name }}</b>
          <span class="text-gray-400 text-xs">{{ s.start_time }}–{{ s.end_time }}</span>
        </span>
        <span class="flex items-center gap-2 shrink-0">
          <span v-if="s.employee" class="text-xs text-gray-500 hidden sm:inline">{{ s.employee }}</span>
          <span class="text-[11px] border rounded-full px-2 py-0.5" :class="'badge ' + (SHIFT_BADGE[s.status] || 'badge-gray')">
            {{ label(SHIFT_STATUS_PRIMARY, s.status) }}
          </span>
        </span>
      </button>
    </div>
    <div v-else class="text-sm text-gray-400 py-4 text-center">لا توجد مناوبات اليوم</div>
  </div>
</template>
