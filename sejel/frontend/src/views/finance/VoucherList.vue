<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الكوبونات</h2>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المناوبة</th><th>الفئة</th><th>العدد</th><th>القيمة</th><th>مُلغي</th></tr></thead>
        <tbody>
          <tr v-for="v in items" :key="v.name">
            <td>{{ shiftMap[v.shift] || v.shift }}</td>
            <td>{{ categoryMap[v.category] || v.category }}</td>
            <td class="font-mono">{{ v.count }}</td>
            <td class="font-mono font-bold text-blue-600">{{ Number(v.total_value).toLocaleString('en-US') }} د.ل</td>
            <td>
              <span :class="v.is_cancelled ? 'text-red-500' : 'text-gray-400'">
                {{ v.is_cancelled ? 'نعم' : 'لا' }}
              </span>
            </td>
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
const shiftMap = ref({})
const categoryMap = ref({})

onMounted(async () => {
  const [vRes, shRes, vcRes] = await Promise.all([api.get('/vouchers/'), api.get('/shifts/'), api.get('/voucher-categories/')])
  items.value = vRes.data.results || vRes.data
  shiftMap.value = Object.fromEntries((shRes.data.results || shRes.data).map(s => [s.name, `${s.shift_name} (${s.date})`]))
  categoryMap.value = Object.fromEntries((vcRes.data.results || vcRes.data).map(c => [c.name, c.category_name]))
})
</script>
