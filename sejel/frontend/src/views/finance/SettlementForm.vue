<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل التسوية' : 'إضافة تسوية كوبونات' }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm text-gray-600 mb-1">5 د.ل</label>
          <input v-model.number="form.denom_5" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">6 د.ل</label>
          <input v-model.number="form.denom_6" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">7 د.ل</label>
          <input v-model.number="form.denom_7" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">8 د.ل</label>
          <input v-model.number="form.denom_8" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="0" />
        </div>
      </div>
      <div class="text-sm font-bold text-primary">الإجمالي: {{ settlementTotal.toLocaleString() }} د.ل</div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع (د.ل)</label>
        <input v-model="form.paid_amount" type="number" step="0.01" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/finance/settlements" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const today = new Date().toISOString().split('T')[0]
const form = ref({ station: '', submission_date: today, denom_5: 0, denom_6: 0, denom_7: 0, denom_8: 0, paid_amount: 0 })
const stations = ref([])
const settlementTotal = computed(() => (form.value.denom_5 || 0) * 5 + (form.value.denom_6 || 0) * 6 + (form.value.denom_7 || 0) * 7 + (form.value.denom_8 || 0) * 8)

onMounted(async () => {
  const { data: sRes } = await api.get('/stations/')
  stations.value = sRes.results || sRes
  if (isEdit.value) {
    const { data } = await api.get(`/voucher-settlements/${route.params.id}/`)
    form.value = { station: data.station, submission_date: data.submission_date || today, denom_5: data.denom_5 || 0, denom_6: data.denom_6 || 0, denom_7: data.denom_7 || 0, denom_8: data.denom_8 || 0, paid_amount: data.paid_amount || 0 }
  }
})

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    // total_value/total_count are calculated by the backend controller
    const payload = { ...form.value }
    if (isEdit.value) await api.put(`/voucher-settlements/${route.params.id}/`, payload)
    else await api.post('/voucher-settlements/', payload)
    router.push('/finance/settlements')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
