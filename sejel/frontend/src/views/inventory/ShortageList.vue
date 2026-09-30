<template>
  <div>
    <h2 class="text-xl font-bold mb-6">المطالبات بالنقص</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الشحنة</th><th>المحطة</th><th>الكمية</th><th>الحالة</th><th>الوصف</th></tr></thead>
        <tbody>
          <tr v-for="s in items" :key="s.name">
            <td>#{{ s.delivery_id_display }}</td>
            <td>{{ s.station_name }}</td>
            <td class="font-mono text-red-600 font-bold">{{ Number(s.claimed_quantity).toLocaleString() }} لتر</td>
            <td>
              <span :class="s.status === 'approved' ? 'badge-green' : s.status === 'rejected' ? 'badge-red' : 'badge-yellow'" class="badge">
                {{ { pending: 'قيد المراجعة', approved: 'موافق عليها', rejected: 'مرفوضة' }[s.status] || s.status }}
              </span>
            </td>
            <td>{{ s.description || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد مطالبات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/shortage-claims/'); items.value = data.results || data })
</script>
