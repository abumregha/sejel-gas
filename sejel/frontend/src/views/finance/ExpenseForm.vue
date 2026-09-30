<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المصروف' : 'إضافة مصروف' }}</h2>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">{{ error }}</div>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
        <select v-model="form.category" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر الفئة</option>
          <option v-for="c in categories" :key="c.name" :value="c.name">{{ c.category_name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ل)</label>
        <input v-model="form.amount" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <input v-model="form.description" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
        <select v-model="form.payment_method" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="cash">نقدي</option>
          <option value="voucher">كوبونات</option>
          <option value="other">آخر</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/finance/expenses" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const form = ref({ station: '', category: '', amount: '', description: '', payment_method: 'cash' })
const stations = ref([])
const categories = ref([])

onMounted(async () => {
  const [sRes, cRes] = await Promise.all([api.get('/stations/'), api.get('/expense-categories/')])
  stations.value = sRes.data.results || sRes.data
  categories.value = cRes.data.results || cRes.data
  if (isEdit.value) {
    const { data } = await api.get(`/expenses/${route.params.id}/`)
    form.value = { station: data.station, category: data.category, amount: data.amount, description: data.description || '', payment_method: data.payment_method || 'cash' }
  }
})

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    if (isEdit.value) await api.put(`/expenses/${route.params.id}/`, form.value)
    else await api.post('/expenses/', form.value)
    router.push('/finance/expenses')
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
