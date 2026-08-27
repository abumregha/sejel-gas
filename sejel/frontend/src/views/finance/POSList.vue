<template>
  <div>
    <h2 class="text-xl font-bold mb-6">واصلات POS</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>المبلغ</th><th>مرجع</th><th>المسجل</th><th>التاريخ</th></tr></thead>
        <tbody>
          <tr v-for="p in items" :key="p.id">
            <td>{{ p.shift }}</td>
            <td class="font-mono font-bold">{{ Number(p.total_amount).toLocaleString() }} د.ل</td>
            <td>{{ p.reference || '—' }}</td>
            <td>{{ p.entered_by_name || '—' }}</td>
            <td>{{ p.created_at }}</td>
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
onMounted(async () => { const { data } = await api.get('/pos-records/'); items.value = data.results || data })
</script>
