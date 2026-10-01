<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التحويلات بين الخزانات</h2>
      <router-link to="/inventory/transfers/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تحويل</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>من خزان</th><th>إلى خزان</th><th>الكمية</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="t in items" :key="t.name">
            <td>{{ (t.transfer_date || '').slice(0, 16).replace('T', ' ') }}</td>
            <td>{{ tankMap[t.from_tank] || t.from_tank }}</td>
            <td>{{ tankMap[t.to_tank] || t.to_tank }}</td>
            <td class="font-mono font-bold">{{ Number(t.quantity).toLocaleString('en-US') }} لتر</td>
            <td>
              <span :class="t.status === 'completed' ? 'badge-green' : t.status === 'cancelled' ? 'badge-red' : 'badge-gray'" class="badge">
                {{ { completed: 'مكتمل', draft: 'مسودة', cancelled: 'ملغى' }[t.status] || t.status }}
              </span>
            </td>
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
const tankMap = ref({})
onMounted(async () => {
  const [tRes, tankRes] = await Promise.all([api.get('/tank-transfers/'), api.get('/tanks/')])
  items.value = tRes.data.results || tRes.data
  tankMap.value = Object.fromEntries((tankRes.data.results || tankRes.data).map(t => [t.name, t.tank_name]))
})
</script>
