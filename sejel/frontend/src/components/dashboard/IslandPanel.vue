<script setup>
// Island panel — visual box per island; machine/meter counts come from data.
import Icon from './Icon.vue'
import MachineCard from './MachineCard.vue'

const props = defineProps({
  island: { type: Object, required: true },
})

const emit = defineEmits(['open-island', 'open-machine', 'open-meter'])
</script>

<template>
  <div data-testid="island-panel" class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
    <div class="flex items-center justify-between mb-3">
      <button
        class="flex items-center gap-2 font-bold hover:text-blue-700 focus:outline-none"
        :title="`تفاصيل ${island.name}`"
        @click="emit('open-island', island)"
      >
        <span class="text-gray-400"><Icon name="island" :size="17" /></span>
        {{ island.name }}
      </button>
      <span class="text-[11px] text-gray-400">{{ island.machines.length }} مضخة · {{ island.machines.reduce((a, m) => a + m.meters.length, 0) }} عداد</span>
    </div>
    <div class="flex flex-wrap gap-2">
      <MachineCard
        v-for="m in island.machines"
        :key="m.id"
        :machine="m"
        @open-machine="(x) => emit('open-machine', x)"
        @open-meter="(x) => emit('open-meter', x)"
      />
      <div v-if="!island.machines.length" class="text-xs text-gray-400 py-3">لا توجد مضخات في هذه الجزيرة</div>
    </div>
  </div>
</template>
