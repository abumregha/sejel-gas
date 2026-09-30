<script setup>
// Pump (machine) card — layout is generated from data (prompt §21/§22):
// machines per island vary automatically.
import Icon from './Icon.vue'
import MeterNode from './MeterNode.vue'

const props = defineProps({
  machine: { type: Object, required: true },
})

const emit = defineEmits(['open-machine', 'open-meter'])
</script>

<template>
  <div class="bg-gray-50 rounded-xl border border-gray-100 p-3 flex flex-col gap-2 min-w-[150px]">
    <button
      class="flex items-center gap-1.5 text-sm font-bold text-gray-700 hover:text-blue-700 focus:outline-none"
      :title="`تفاصيل ${machine.name}`"
      @click="emit('open-machine', machine)"
    >
      <Icon name="pump" :size="15" class="text-gray-400" />
      {{ machine.name }}
    </button>
    <div class="flex flex-wrap gap-1.5">
      <MeterNode
        v-for="m in machine.meters"
        :key="m.id"
        :meter="m"
        @open="(meter) => emit('open-meter', meter)"
      />
    </div>
  </div>
</template>
