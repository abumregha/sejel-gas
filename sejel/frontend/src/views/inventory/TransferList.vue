<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التحويلات بين الخزانات</h2>
      <router-link to="/inventory/transfers/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تحويل</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>من خزان</th><th>إلى خزان</th><th>الكمية</th><th>المسجل</th></tr></thead>
        <tbody>
          <tr v-for="t in items" :key="t.id">
            <td>{{ t.created_at }}</td>
            <td>{{ t.from_tank_name }}</td>
            <td>{{ t.to_tank_name }}</td>
            <td class="font-mono font-bold">{{ Number(t.quantity).toLocaleString() }} لتر</td>
            <td>{{ t.created_by_name || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تحويلات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/tank-transfers/'); items.value = data.results || data })
</script>
