<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المصروف' : 'إضافة مصروف' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
        <select v-model="form.category" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ل)</label>
        <input v-model="form.amount" type="number" step="0.001" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
        <input v-model="form.date" type="date" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <input v-model="form.description" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
        <select v-model="form.payment_method" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="cash">نقدي</option>
          <option value="transfer">تحويل</option>
          <option value="other">آخر</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/finance/expenses" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const today = new Date().toISOString().split('T')[0]
const form = ref({ station: '', category: '', amount: '', date: today, description: '', payment_method: 'cash' })
const stations = ref([])
const categories = ref([])
onMounted(async () => {
  const [sRes, cRes] = await Promise.all([api.get('/stations/'), api.get('/expense-categories/')])
  stations.value = sRes.data.results || sRes.data
  categories.value = cRes.data.results || cRes.data
  if (isEdit.value) {
    const { data: d } = await api.get(`/expenses/${route.params.id}/`)
    form.value = { station: d.station, category: d.category, amount: d.amount, date: d.date, description: d.description || '', payment_method: d.payment_method || 'cash' }
  }
})
const save = async () => {
  if (isEdit.value) await api.put(`/expenses/${route.params.id}/`, form.value)
  else await api.post('/expenses/', form.value)
  router.push('/finance/expenses')
}
</script>
