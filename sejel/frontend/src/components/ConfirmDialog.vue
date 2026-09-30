<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="cancel"></div>
    <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
      <h3 class="font-bold text-lg mb-2">{{ titleText }}</h3>
      <p class="text-sm text-gray-600 mb-6">{{ messageText }}</p>
      <div class="flex gap-3 justify-end">
        <button @click="cancel" class="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">إلغاء</button>
        <button @click="confirm" :class="dangerText ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90'"
          class="px-4 py-2 rounded-lg text-white text-sm">{{ confirmTextValue }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Styled replacement for window.confirm (Q49). Usage:
//   const dlg = ref(null)
//   <ConfirmDialog ref="dlg" @confirm="doDelete" />
//   dlg.value.open({ title: 'حذف', message: '...', confirmText: 'حذف' })
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: 'تأكيد' },
  message: { type: String, default: 'هل أنت متأكد؟' },
  confirmText: { type: String, default: 'تأكيد' },
  danger: { type: Boolean, default: true },
})
const emit = defineEmits(['confirm'])

const open = ref(false)
const titleText = ref(props.title)
const messageText = ref(props.message)
const confirmTextValue = ref(props.confirmText)
const dangerText = ref(props.danger)
let resolveFn = null

const openDialog = (opts = {}) => {
  titleText.value = opts.title || props.title
  messageText.value = opts.message || props.message
  confirmTextValue.value = opts.confirmText || props.confirmText
  dangerText.value = opts.danger !== undefined ? opts.danger : props.danger
  open.value = true
  return new Promise((resolve) => { resolveFn = resolve })
}
const confirm = () => { open.value = false; emit('confirm'); resolveFn?.(true) }
const cancel = () => { open.value = false; resolveFn?.(false) }

defineExpose({ open: openDialog })
</script>
