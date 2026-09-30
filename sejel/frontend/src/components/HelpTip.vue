<template>
  <span class="helptip relative inline-flex align-middle" dir="rtl">
    <button type="button" :aria-label="text" tabindex="0"
      class="helptip-btn w-4 h-4 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 text-[10px] font-bold flex items-center justify-center cursor-help leading-none">؟</button>
    <span class="helptip-pop absolute z-50 bottom-full mb-2 right-1/2 translate-x-1/2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed pointer-events-none text-right">
      {{ text }}
    </span>
  </span>
</template>
<script setup>
// Arabic "?" help tooltip (client request): hover/focus a small question-mark
// next to a card title or form label to pop a short RTL explanation.
defineProps({ text: { type: String, required: true } })
</script>
<style scoped>
.helptip-pop { display: none; }
.helptip:hover .helptip-pop,
.helptip:focus-within .helptip-pop { display: inline-block; }
</style>
