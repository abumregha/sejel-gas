<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة مناوبة</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">التعريف (اختياري)</label>
        <select v-model="form.definition" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون تعريف</option>
          <option v-for="d in definitions" :key="d.id" :value="d.id">{{ d.name }} ({{ d.start_time }}-{{ d.end_time }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة</label>
        <select v-model="form.island" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="i in filteredIslands" :key="i.id" :value="i.id">{{ i.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المناوب</label>
        <select v-model="form.employee" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
        <input v-model="form.date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
          <input v-model="form.start_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت الانتهاء</label>
          <input v-model="form.end_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/shifts" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const today = new Date().toISOString().split('T')[0]
const form = ref({ station: '', definition: '', island: '', employee: '', date: today, start_time: '', end_time: '' })
const stations = ref([])
const definitions = ref([])
const islands = ref([])
const employees = ref([])
const filteredIslands = computed(() => islands.value.filter(i => i.station == form.value.station))
const filteredEmployees = computed(() => form.value.station ? employees.value.filter(e => e.station == form.value.station) : employees.value)
onMounted(async () => {
  const [sRes, dRes, iRes, eRes] = await Promise.all([api.get('/stations/'), api.get('/shift-definitions/'), api.get('/islands/'), api.get('/employees/')])
  stations.value = sRes.data.results || sRes.data
  definitions.value = dRes.data.results || dRes.data
  islands.value = iRes.data.results || iRes.data
  employees.value = eRes.data.results || eRes.data
})
const save = async () => {
  const payload = { ...form.value }
  if (!payload.definition) payload.definition = null
  if (!payload.island) payload.island = null
  if (!payload.employee) payload.employee = null
  await api.post('/shifts/', payload)
  router.push('/shifts')
}
</script>
