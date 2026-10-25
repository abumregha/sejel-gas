<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">دفعات المحطات المقدمة</h2>
      <router-link to="/finance/deposits/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة دفعة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المحطة</th><th>رقم الفاتورة</th><th>تاريخ الفاتورة</th><th>مبلغ الإيداع</th><th>المخصص</th><th>الرصيد</th></tr></thead>
        <tbody>
          <tr v-for="d in items" :key="d.name">
            <td>{{ stationMap[d.station] || d.station }}</td>
            <td>{{ d.invoice_number || '—' }}</td>
            <td>{{ d.invoice_date || '—' }}</td>
            <td class="font-mono font-bold">{{ Number(d.deposit_amount).toLocaleString('en-US') }} د.ل</td>
            <td class="font-mono">{{ Number(d.allocated_amount || 0).toLocaleString('en-US') }} د.ل</td>
            <td class="font-mono" :class="d.balance < 0 ? 'text-red-600 font-bold' : 'text-green-600'">{{ Number(d.balance || 0).toLocaleString('en-US') }} د.ل</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد دفعات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
onMounted(async () => {
  const [dRes, sRes] = await Promise.all([api.get('/station-deposits/'), api.get('/stations/')])
  items.value = dRes.data.results || dRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
})
</script>
