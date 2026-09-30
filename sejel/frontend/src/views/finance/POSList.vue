<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">واصلات POS</h2>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>المبلغ</th><th>عدد المعاملات</th><th>مُلغي</th></tr></thead>
        <tbody>
          <tr v-for="p in items" :key="p.name">
            <td>{{ shiftMap[p.shift] || p.shift }}</td>
            <td class="font-mono font-bold text-purple-600">{{ Number(p.total_amount).toLocaleString() }} د.ل</td>
            <td class="font-mono">{{ p.transaction_count }}</td>
            <td>
              <span :class="p.is_cancelled ? 'text-red-500' : 'text-gray-400'">
                {{ p.is_cancelled ? 'نعم' : 'لا' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد سجلات POS</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const shiftMap = ref({})

onMounted(async () => {
  const [pRes, shRes] = await Promise.all([api.get('/pos-records/'), api.get('/shifts/')])
  items.value = pRes.data.results || pRes.data
  shiftMap.value = Object.fromEntries((shRes.data.results || shRes.data).map(s => [s.name, `${s.shift_name} (${s.date})`]))
})
</script>
