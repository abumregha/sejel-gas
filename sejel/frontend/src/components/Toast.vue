<template>
  <Transition name="toast">
    <div v-if="visible"
      data-testid="wizard-toast"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
      :class="typeClasses">
      <svg v-if="type === 'success'" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <svg v-else-if="type === 'error'" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
      <span>{{ message }}</span>
        <button v-if="type === 'error'" data-testid="wizard-toast-close"
          class="mr-1 text-current opacity-70 hover:opacity-100" aria-label="إغلاق"
          @click="dismiss">✕</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const visible = ref(false)
const message = ref('')
const type = ref('success')
let timer = null

const typeClasses = computed(() => ({
  'bg-emerald-50 text-emerald-700 border border-emerald-200': type.value === 'success',
  'bg-red-50 text-red-700 border border-red-200': type.value === 'error',
}))

// An ERROR stays until the operator acknowledges it. A 3-second toast was
// fine for "saved" but wrong for "the station name is taken" — on a phone the
// operator is still reading the form when it vanishes, and the failure then
// looks like nothing happened (QA-6).
const show = (msg, toastType = 'success', duration = toastType === 'error' ? 0 : 3000) => {
  message.value = msg
  type.value = toastType
  visible.value = true
  clearTimeout(timer)
  if (duration > 0) {
    timer = setTimeout(() => { visible.value = false }, duration)
  }
}

const dismiss = () => {
  clearTimeout(timer)
  visible.value = false
}
defineExpose({ show, dismiss })

onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -12px); }
</style>
