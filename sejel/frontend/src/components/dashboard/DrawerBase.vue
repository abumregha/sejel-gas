<script setup>
// Right-side drawer (RTL: slides from the left edge visually — mirrored),
// used by all dashboard detail popups. Emits 'close'.
import { watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  wide: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape' && props.open) emit('close')
}
watch(
  () => props.open,
  (v) => {
    if (v) document.addEventListener('keydown', onKey)
    else document.removeEventListener('keydown', onKey)
  }
)
</script>

<template>
  <Teleport to="body">
    <transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 flex" @keydown.esc="emit('close')">
        <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
        <div
          class="relative h-full bg-white shadow-2xl flex flex-col mr-auto"
          :class="wide ? 'w-full max-w-2xl' : 'w-full max-w-md'"
        >
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 class="font-bold text-lg">{{ title }}</h3>
            <button
              class="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="إغلاق"
              @click="emit('close')"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="border-t border-gray-100 p-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.18s ease;
}
.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.22s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(-24px);
}
</style>
