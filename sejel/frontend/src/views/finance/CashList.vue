<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التحصيل النقدي</h2>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>المبلغ</th><th>الوقت</th><th>المستلم</th><th>مُلغي</th></tr></thead>
        <tbody>
          <tr v-for="c in items" :key="c.name">
            <td>{{ shiftMap[c.shift] || c.shift }}</td>
            <td class="font-mono font-bold text-green-600">{{ Number(c.amount).toLocaleString('en-US') }} د.ل</td>
            <td class="font-mono">{{ c.time }}</td>
            <td>{{ c.received_by || '—' }}</td>
            <td>
              <span :class="c.is_cancelled ? 'text-red-500' : 'text-gray-400'">
                {{ c.is_cancelled ? 'نعم' : 'لا' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تحصيلات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const shiftMap = ref({})

onMounted(async () => {
  const [cRes, shRes] = await Promise.all([api.get('/cash-collections/'), api.get('/shifts/')])
  items.value = cRes.data.results || cRes.data
  shiftMap.value = Object.fromEntries((shRes.data.results || shRes.data).map(s => [s.name, `${s.shift_name} (${s.date})`]))
})
</script>
