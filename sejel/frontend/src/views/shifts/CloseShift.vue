<template>
  <div class="max-w-2xl mx-auto text-center py-12">
    <h2 class="text-xl font-bold mb-4">إقفال المناوبة</h2>
    <p class="text-gray-500 mb-6">هل تريد إقفال المناوبة وإنشاء التسوية المالية؟</p>
    <p class="text-sm text-gray-400 mb-6">يمكنك أيضاً إضافة القراءات ثم الإقفال من صفحة المناوبة مباشرة.</p>
    <div class="flex justify-center gap-3">
      <router-link :to="`/shifts/${id}`" class="bg-primary text-white px-6 py-2.5 rounded-xl">العودة للمناوبة</router-link>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id
</script>
