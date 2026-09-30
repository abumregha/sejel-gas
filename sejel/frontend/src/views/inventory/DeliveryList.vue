<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الشحنات</h2>
      <router-link to="/inventory/deliveries/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة شحنة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>الخزان</th><th>النوع</th><th>المتوقع</th><th>المستلم</th><th>النقص</th></tr></thead>
        <tbody>
          <tr v-for="d in items" :key="d.name" class="cursor-pointer" @click="$router.push(`/inventory/deliveries/${d.name}`)">
            <td>{{ (d.order_date || '').slice(0, 10) }}</td>
            <td>{{ stationMap[d.station] || d.station || '—' }}</td>
            <td>{{ tankMap[d.tank] || d.tank || '—' }}</td>
            <td>{{ fuelMap[d.fuel_type] || d.fuel_type || '—' }}</td>
            <td class="font-mono">{{ Number(d.expected_quantity).toLocaleString() }}</td>
            <td class="font-mono">{{ d.received_quantity ? Number(d.received_quantity).toLocaleString() : '—' }}</td>
            <td class="font-mono" :class="d.shortage > 0 ? 'text-red-600 font-bold' : ''">
              {{ d.shortage ? Number(d.shortage).toLocaleString() : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد شحنات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
const tankMap = ref({})
const fuelMap = ref({})
onMounted(async () => {
  const [dRes, sRes, tRes, fRes] = await Promise.all([api.get('/deliveries/'), api.get('/stations/'), api.get('/tanks/'), api.get('/fuel-types/')])
  items.value = dRes.data.results || dRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  tankMap.value = Object.fromEntries((tRes.data.results || tRes.data).map(t => [t.name, t.tank_name]))
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
})
</script>
