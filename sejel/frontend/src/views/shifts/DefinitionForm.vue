<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل التعريف' : 'إضافة تعريف مناوبة' }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم التعريف</label>
        <input v-model="form.definition_name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="مثال: تعريف صباحي" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة</label>
        <select v-model="form.island" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="i in filteredIslands" :key="i.name" :value="i.name">{{ i.island_name }}</option>
        </select>
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
        <label class="block text-sm font-medium text-gray-700 mb-1">الأيام</label>
        <div class="flex flex-wrap gap-2">
          <label v-for="day in dayOptions" :key="day.value" class="flex items-center gap-1 text-sm">
            <input type="checkbox" :value="day.value" v-model="form.days" class="rounded" />
            {{ day.label }}
          </label>
        </div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/shifts/definitions" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter(), route = useRoute()
const isEdit = computed(() => !!route.params.id)
const error = ref('')
const saving = ref(false)
const form = ref({ definition_name: '', station: '', island: '', start_time: '', end_time: '', days: [] })
const stations = ref([])
const islands = ref([])
const dayOptions = [
  { label: 'السبت', value: 'sat' }, { label: 'الأحد', value: 'sun' },
  { label: 'الاثنين', value: 'mon' }, { label: 'الثلاثاء', value: 'tue' },
  { label: 'الأربعاء', value: 'wed' }, { label: 'الخميس', value: 'thu' },
  { label: 'الجمعة', value: 'fri' },
]
const filteredIslands = computed(() => form.value.station ? islands.value.filter(i => i.station === form.value.station) : islands.value)

onMounted(async () => {
  const [sRes, iRes] = await Promise.all([api.get('/stations/'), api.get('/islands/')])
  stations.value = sRes.data.results || sRes.data
  islands.value = iRes.data.results || iRes.data
  if (isEdit.value) {
    const { data } = await api.get(`/shift-definitions/${route.params.id}/`)
    form.value = { definition_name: data.definition_name, station: data.station, island: data.island || '', start_time: data.start_time, end_time: data.end_time, days: String(data.days || '').split(',').filter(Boolean) }
  }
})

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.island) delete payload.island
    // backend stores days as a comma-separated string, not an array
    payload.days = (form.value.days || []).join(',')
    if (isEdit.value) await api.put(`/shift-definitions/${route.params.id}/`, payload)
    else await api.post('/shift-definitions/', payload)
    router.push('/shifts/definitions')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
