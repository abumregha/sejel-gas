<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل الموظف' : 'إضافة موظف' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
        <input v-model="form.name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المنصب</label>
        <input v-model="form.position" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
        <input v-model="form.phone" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/employees" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
const router = useRouter(), route = useRoute()
const isEdit = computed(() => !!route.params.id)
const form = ref({ name: '', position: '', phone: '', station: '' })
const stations = ref([])
onMounted(async () => {
  const { data } = await api.get('/stations/'); stations.value = data.results || data
  if (isEdit.value) {
    const { data: d } = await api.get(`/employees/${route.params.id}/`)
    form.value = { name: d.name, position: d.position, phone: d.phone, station: d.station }
  }
})
const save = async () => {
  if (isEdit.value) await api.put(`/employees/${route.params.id}/`, form.value)
  else await api.post('/employees/', form.value)
  router.push('/employees')
}
</script>
