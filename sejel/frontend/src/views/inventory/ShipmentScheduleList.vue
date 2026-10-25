<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">جدول الشحنات</h2>
      <router-link to="/inventory/shipment-schedules/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة شحنة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المسلسل</th><th>المحطة</th><th>نوع الوقود</th><th>التاريخ المتوقع</th><th>الكمية</th><th>سعر الشراء للتر</th><th>المبلغ</th><th>الحالة</th><th>الفاتورة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="s in items" :key="s.name">
            <td class="font-mono text-center font-bold text-gray-600">{{ s.serial_number || '—' }}</td>
            <td>{{ stationMap[s.station] || s.station }}</td>
            <td>{{ fuelMap[s.fuel_type] || s.fuel_type }}</td>
            <td>{{ s.expected_shipping_date || s.expected_date || '—' }}</td>
            <td class="font-mono">{{ Number(s.quantity).toLocaleString('en-US') }} لتر</td>
            <td class="font-mono text-xs">{{ s.unit_price ? Number(s.unit_price).toFixed(8) : '—' }}</td>
            <td class="font-mono font-medium">{{ Number(s.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) }} د.ل</td>
            <td><span class="badge" :class="statusClass(s.status)">{{ statusLabel(s.status) }}</span></td>
            <td>{{ s.invoice_number || '—' }}</td>
            <td>
              <router-link :to="`/inventory/shipment-schedules/${s.name}`" class="text-primary hover:underline text-xs font-semibold">تعديل</router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد شحنات مجدولة</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
const fuelMap = ref({})
const statusLabel = (s) => ({
  scheduled: 'مجدولة',
  dispatched: 'مُرسلة',
  delivered: 'مسلّمة',
  undelivered: 'غير مسلّمة',
  transit: 'مرحلة',
  cancelled: 'ملغاة',
}[s] || s || '—')
const statusClass = (s) => ({
  scheduled: 'badge-blue',
  dispatched: 'badge-yellow',
  delivered: 'badge-green',
  undelivered: 'badge-red',
  transit: 'badge-yellow',
  cancelled: 'badge-gray',
}[s] || 'badge-gray')
onMounted(async () => {
  const [ssRes, sRes, fRes] = await Promise.all([api.get('/shipment-schedules/'), api.get('/stations/'), api.get('/fuel-types/')])
  items.value = ssRes.data.results || ssRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
})
</script>
