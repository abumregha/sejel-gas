<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">تسويات الكوبونات</h2>
      <router-link to="/finance/settlements/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تسوية</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المحطة</th><th>التاريخ</th><th>العدد</th><th>القيمة</th><th>المدفوع</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="s in items" :key="s.name">
            <td>{{ stationMap[s.station] || s.station }}</td>
            <td>{{ s.submission_date }}</td>
            <td class="font-mono">{{ s.total_count }}</td>
            <td class="font-mono font-bold">{{ Number(s.total_value).toLocaleString('en-US') }} د.ل</td>
            <td class="font-mono text-green-600">{{ Number(s.paid_amount || 0).toLocaleString('en-US') }} د.ل</td>
            <td>
              <span :class="s.status === 'paid' ? 'badge-green' : s.status === 'approved' ? 'badge-blue' : 'badge-yellow'" class="badge">
                {{ statusLabel(s.status) }}
              </span>
            </td>
            <td>
              <router-link :to="`/finance/settlements/${s.name}/edit`" class="text-primary text-sm">تعديل</router-link>
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
const stationMap = ref({})
const statusLabel = (s) => ({ draft: 'مسودة', submitted: 'مقدمة', approved: 'موافق عليها', paid: 'مدفوعة', rejected: 'مرفوضة' }[s] || s || '—')

onMounted(async () => {
  const [vRes, sRes] = await Promise.all([api.get('/voucher-settlements/'), api.get('/stations/')])
  items.value = vRes.data.results || vRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
})
</script>
