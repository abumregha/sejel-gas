<template>
  <div>
    <h2 class="text-xl font-bold mb-6">التسويات المالية</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>المبيعات</th><th>التحصيل</th><th>الفرق</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="cursor-pointer" @click="$router.push(`/finance/reconciliations/${r.id}`)">
            <td>{{ r.shift_date }}</td>
            <td>{{ r.shift?.station_name }}</td>
            <td class="font-mono">{{ Number(r.total_expected_sales).toLocaleString() }}</td>
            <td class="font-mono">{{ Number(r.total_collected).toLocaleString() }}</td>
            <td class="font-mono font-bold" :class="Number(r.difference) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ Number(r.difference).toLocaleString() }}
            </td>
            <td>
              <span :class="r.status === 'approved' ? 'badge-green' : 'badge-yellow'" class="badge">
                {{ r.status === 'approved' ? 'موثقة' : 'قيد المراجعة' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تسويات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/reconciliations/'); items.value = data.results || data })
</script>
