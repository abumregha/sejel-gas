<template>
  <div>
    <h2 class="text-xl font-bold mb-6">تسوية الوقود</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>الخزان</th><th>النظري</th><th>الفعلي</th><th>الفرق</th></tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.name">
            <td>{{ r.created_at }}</td>
            <td>{{ r.station_name }}</td>
            <td>{{ r.tank_name }}</td>
            <td class="font-mono">{{ Number(r.theoretical_level).toLocaleString('en-US') }}</td>
            <td class="font-mono">{{ r.actual_level ? Number(r.actual_level).toLocaleString('en-US') : '—' }}</td>
            <td class="font-mono font-bold" :class="Number(r.variance || 0) === 0 ? 'text-green-600' : 'text-red-600'">
              {{ r.variance != null ? Number(r.variance).toLocaleString('en-US') : '—' }}
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
onMounted(async () => { const { data } = await api.get('/fuel-reconciliations/'); items.value = data.results || data })
</script>
