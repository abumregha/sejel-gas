<template>
  <div>
    <h2 class="text-xl font-bold mb-6">الكوبونات</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>الفئة</th><th>العدد</th><th>القيمة</th></tr></thead>
        <tbody>
          <tr v-for="v in items" :key="v.id">
            <td>{{ v.shift }}</td>
            <td>{{ v.category_name }}</td>
            <td>{{ v.count }}</td>
            <td class="font-mono font-bold">{{ Number(v.total_value).toLocaleString() }} د.ل</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد كوبونات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/vouchers/'); items.value = data.results || data })
</script>
