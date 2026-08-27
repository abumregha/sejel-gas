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
          <tr v-for="d in items" :key="d.id" class="cursor-pointer" @click="$router.push(`/inventory/deliveries/${d.id}`)">
            <td>{{ d.delivery_date }}</td>
            <td>{{ d.station_name }}</td>
            <td>{{ d.tank_name }}</td>
            <td>{{ d.fuel_type_name }}</td>
            <td class="font-mono">{{ Number(d.expected_quantity).toLocaleString() }}</td>
            <td class="font-mono">{{ d.received_quantity ? Number(d.received_quantity).toLocaleString() : '—' }}</td>
            <td class="font-mono" :class="d.shortage_quantity > 0 ? 'text-red-600 font-bold' : ''">
              {{ d.shortage_quantity ? Number(d.shortage_quantity).toLocaleString() : '—' }}
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
onMounted(async () => { const { data } = await api.get('/deliveries/'); items.value = data.results || data })
</script>
