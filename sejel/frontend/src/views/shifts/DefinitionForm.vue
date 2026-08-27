<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل تعريف المناوبة' : 'إضافة تعريف مناوبة' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المناوبة</label>
        <input v-model="form.name" required placeholder="مثال: مناوبة صباحية" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
          <input v-model="form.start_time" type="time" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت الانتهاء</label>
          <input v-model="form.end_time" type="time" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">أيام العمل</label>
        <div class="flex flex-wrap gap-2 mt-1">
          <label v-for="(label, idx) in dayLabels" :key="idx" class="flex items-center gap-1 text-sm">
            <input type="checkbox" :value="idx" v-model="form.days" class="rounded" />
            {{ label }}
          </label>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة (اختياري)</label>
        <select v-model="form.island" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">كل المحطة</option>
          <option v-for="i in filteredIslands" :key="i.id" :value="i.id">{{ i.name }}</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/shifts/definitions" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const dayLabels = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
const form = ref({ name: '', start_time: '06:00', end_time: '14:00', days: [0, 1, 2, 3, 4, 5, 6], station: '', island: '' })
const stations = ref([])
const islands = ref([])
const filteredIslands = computed(() => islands.value.filter(i => i.station == form.value.station))
onMounted(async () => {
  const [sRes, iRes] = await Promise.all([api.get('/stations/'), api.get('/islands/')])
  stations.value = sRes.data.results || sRes.data
  islands.value = iRes.data.results || iRes.data
  if (isEdit.value) {
    const { data: d } = await api.get(`/shift-definitions/${route.params.id}/`)
    form.value = { name: d.name, start_time: d.start_time, end_time: d.end_time, days: d.days || [], station: d.station, island: d.island || '' }
  }
})
const save = async () => {
  const payload = { ...form.value, days: JSON.stringify(form.value.days) }
  if (!payload.island) payload.island = null
  if (isEdit.value) await api.put(`/shift-definitions/${route.params.id}/`, payload)
  else await api.post('/shift-definitions/', payload)
  router.push('/shifts/definitions')
}
</script>
