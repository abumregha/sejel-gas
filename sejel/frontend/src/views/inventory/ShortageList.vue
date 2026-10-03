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
            <td class="font-mono text-red-600 font-bold">{{ s.claimed_quantity == null ? '—' : Number(s.claimed_quantity).toLocaleString('en-US') + ' لتر' }}</td>
            <td>
              <span :class="{ approved: 'badge-green', rejected: 'badge-red', closed: 'badge-gray', settled: 'badge-green', claimed: 'badge-yellow' }[s.status] || 'badge-yellow'" class="badge">
                {{ STATUS_LABEL[s.status] || s.status }}
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

// The vocabulary the DocType actually allows. The screen used to map
// pending/approved/rejected, none of which the backend accepts, so every row
// rendered the raw English status (QA-22).
const STATUS_LABEL = {
  not_claimed: 'لم يتم المطالبة',
  claimed: 'تم المطالبة',
  settled: 'تمت التسوية',
  closed: 'مغلقة',
}

const items = ref([])
onMounted(async () => { const { data } = await api.get('/shortage-claims/'); items.value = data.results || data })
</script>
