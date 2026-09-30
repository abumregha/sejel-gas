<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة مناوبة</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name || s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المناوبة</label>
        <input v-model="form.shift_name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="مثال: مناوبة صباحية 08-09-2026" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">التعريف (اختياري)</label>
        <select v-model="form.definition" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون تعريف</option>
          <option v-for="d in definitions" :key="d.name" :value="d.name">{{ d.definition_name || d.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة</label>
        <select v-model="form.island" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="i in filteredIslands" :key="i.name" :value="i.name">{{ i.island_name || i.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المناوب</label>
        <select v-model="form.employee" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="e in employees" :key="e.name" :value="e.name">{{ e.employee_name || e.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
        <input v-model="form.date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
          <input v-model="form.start_time" type="time" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">وقت الانتهاء</label>
          <input v-model="form.end_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/shifts" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { friendlyError } from '../../errors'
const router = useRouter()
const error = ref('')
const saving = ref(false)
const today = new Date().toISOString().split('T')[0]
const form = ref({ station: '', shift_name: '', definition: '', island: '', employee: '', date: today, start_time: '', end_time: '' })
const stations = ref([])
const definitions = ref([])
const islands = ref([])
const employees = ref([])
const filteredIslands = computed(() => form.value.station ? islands.value.filter(i => i.station == form.value.station) : islands.value)
onMounted(async () => {
  try {
    const [sRes, dRes, iRes, eRes] = await Promise.all([api.get('/stations/'), api.get('/shift-definitions/'), api.get('/islands/'), api.get('/employees/')])
    stations.value = sRes.data.results || sRes.data
    definitions.value = dRes.data.results || dRes.data
    islands.value = iRes.data.results || iRes.data
    employees.value = eRes.data.results || eRes.data
  } catch (e) { error.value = 'خطأ في تحميل البيانات' }
})
const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.definition) delete payload.definition
    if (!payload.island) delete payload.island
    if (!payload.employee) delete payload.employee
    if (!payload.end_time) delete payload.end_time
    await api.post('/shifts/', payload)
    router.push('/shifts')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
