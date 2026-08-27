<template>
  <div class="max-w-3xl mx-auto">
    <router-link :to="`/shifts/${id}`" class="text-sm text-primary hover:underline mb-2 block">← المناوبة</router-link>
    <h2 class="text-xl font-bold mb-6">إضافة قراءات العدادات</h2>
    <form @submit.prevent="save" class="space-y-4">
      <div v-for="(r, idx) in readings" :key="idx"
        class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">العداد</label>
            <select v-model="r.meter" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option v-for="m in meters" :key="m.id" :value="m.id">{{ m.code }} ({{ m.fuel_type_name }})</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">قراءة الافتتاح</label>
            <input v-model="r.start_reading" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
            <p v-if="getPrevClosing(r.meter)" class="text-xs text-gray-500 mt-1">القراءة السابقة: {{ getPrevClosing(r.meter) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">قراءة الاختتام</label>
            <input v-model="r.end_reading" type="number" step="0.001" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="تُملأ عند الإقفال" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">نوع الاستثناء (اختياري)</label>
            <select v-model="r.exception_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
              <option value="">لا يوجد</option>
              <option value="reset">تصفير العداد</option>
              <option value="replacement">استبدال العداد</option>
              <option value="other">سبب آخر</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <input v-model="r.notes" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <button type="button" @click="addRow" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">+ عداد آخر</button>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ القراءات' }}
        </button>
        <router-link :to="`/shifts/${id}`" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
const route = useRoute(), router = useRouter()
const id = route.params.id
const saving = ref(false)
const meters = ref([])
const prevClosings = ref({})
const readings = ref([{ meter: '', start_reading: '', end_reading: '', exception_type: '', notes: '' }])
const addRow = () => readings.value.push({ meter: '', start_reading: '', end_reading: '', exception_type: '', notes: '' })
const getPrevClosing = (meterId) => meterId ? prevClosings.value[meterId] : null
onMounted(async () => {
  const { data: shift } = await api.get(`/shifts/${id}/`)
  const station = shift.station
  const [mRes] = await Promise.all([api.get(`/meters/?station=${station}`)])
  meters.value = mRes.data.results || mRes.data
})
const save = async () => {
  saving.value = true
  try {
    for (const r of readings.value) {
      const payload = { shift: parseInt(id), meter: parseInt(r.meter), start_reading: r.start_reading, end_reading: r.end_reading || null, exception_type: r.exception_type || null, notes: r.notes }
      await api.post('/meter-readings/', payload)
    }
    router.push(`/shifts/${id}`)
  } catch (e) { alert('خطأ: ' + JSON.stringify(e.response?.data || e.message)) }
  finally { saving.value = false }
}
</script>
