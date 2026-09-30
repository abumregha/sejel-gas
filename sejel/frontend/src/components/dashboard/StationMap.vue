<script setup>
// Station visualization — fully data-driven (prompt §5/§22): the layout is a
// pure function of the station payload. A station with 3 islands shows 3
// islands; no physical geometry is hard-coded anywhere.
import IslandPanel from './IslandPanel.vue'

const props = defineProps({
  islands: { type: Array, required: true },
})

const emit = defineEmits(['open-island', 'open-machine', 'open-meter'])
</script>

<template>
  <div class="flex flex-col gap-3">
    <IslandPanel
      v-for="isl in islands"
      :key="isl.id"
      :island="isl"
      @open-island="(x) => emit('open-island', x)"
      @open-machine="(x) => emit('open-machine', x)"
      @open-meter="(x) => emit('open-meter', x)"
    />
    <div v-if="!islands.length" class="text-sm text-gray-400 bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
      لا توجد جزر معرّفة لهذه المحطة بعد
    </div>
  </div>
</template>
