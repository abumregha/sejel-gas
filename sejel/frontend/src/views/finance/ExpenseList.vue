<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المصروفات</h2>
      <router-link to="/finance/expenses/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مصروف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الفئة</th><th>المبلغ</th><th>الوصف</th><th>طريقة الدفع</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="e in items" :key="e.name">
            <td>{{ categoryMap[e.category] || e.category }}</td>
            <td class="font-mono font-bold text-red-600">{{ Number(e.amount).toLocaleString() }} د.ل</td>
            <td>{{ e.description || '—' }}</td>
            <td>{{ paymentLabel(e.payment_method) }}</td>
            <td class="flex gap-2">
              <router-link :to="`/finance/expenses/${e.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(e)" class="text-red-500 text-sm">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد مصروفات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const categoryMap = ref({})
const paymentLabel = (m) => ({ cash: 'نقدي', voucher: 'كوبونات', other: 'آخر' }[m] || m || '—')

onMounted(async () => {
  const [eRes, cRes] = await Promise.all([api.get('/expenses/'), api.get('/expense-categories/')])
  items.value = eRes.data.results || eRes.data
  categoryMap.value = Object.fromEntries((cRes.data.results || cRes.data).map(c => [c.name, c.category_name]))
})

const remove = async (e) => {
  if (!confirm('حذف؟')) return
  await api.delete(`/expenses/${e.name}/`)
  items.value = items.value.filter(x => x.name !== e.name)
}
</script>
