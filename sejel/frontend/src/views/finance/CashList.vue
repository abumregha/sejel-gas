<template>
  <div>
    <h2 class="text-xl font-bold mb-6">التحصيل النقدي</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المناوبة</th><th>المبلغ</th><th>المحصل</th><th>الوقت</th></tr></thead>
        <tbody>
          <tr v-for="c in items" :key="c.id">
            <td>{{ c.shift }}</td>
            <td>{{ c.shift }}</td>
            <td class="font-mono font-bold">{{ Number(c.amount).toLocaleString() }} د.ل</td>
            <td>{{ c.received_by_name || '—' }}</td>
            <td>{{ c.time }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد سجلات تحصيل</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/cash-collections/'); items.value = data.results || data })
</script>
