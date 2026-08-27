<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المصروفات</h2>
      <router-link to="/finance/expenses/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مصروف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>الفئة</th><th>المبلغ</th><th>الوصف</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="e in items" :key="e.id">
            <td>{{ e.date }}</td>
            <td>{{ e.category_name }}</td>
            <td class="font-mono font-bold text-red-600">{{ Number(e.amount).toLocaleString() }} د.ل</td>
            <td>{{ e.description || '—' }}</td>
            <td class="flex gap-2">
              <router-link :to="`/finance/expenses/${e.id}/edit`" class="text-primary text-sm">تعديل</router-link>
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
onMounted(async () => { const { data } = await api.get('/expenses/'); items.value = data.results || data })
const remove = async (e) => { if (!confirm('حذف؟')) return; await api.delete(`/expenses/${e.id}/`); items.value = items.value.filter(x => x.id !== e.id) }
</script>
