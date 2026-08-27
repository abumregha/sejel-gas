<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المضخة' : 'إضافة مضخة' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المضخة</label>
        <input v-model="form.name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة</label>
        <select v-model="form.island" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="i in islands" :key="i.id" :value="i.id">{{ i.name }} ({{ i.station_name }})</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/machines" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
import { useAuthStore } from '../../stores/auth'
const router = useRouter(), route = useRoute()
const auth = useAuthStore()
const isOwner = computed(() => auth.isOwner)
const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '', island: '' })
const islands = ref([])
onMounted(async () => {
  const params = isOwner.value ? {} : { station: auth.stationId }
  const { data } = await api.get('/islands/', { params }); islands.value = data.results || data
  if (isEdit.value) {
    const { data: d } = await api.get(`/machines/${route.params.id}/`)
    form.value = { name: d.name, island: d.island }
  }
})
const save = async () => {
  if (isEdit.value) await api.put(`/machines/${route.params.id}/`, form.value)
  else await api.post('/machines/', form.value)
  router.push('/machines')
}
</script>
