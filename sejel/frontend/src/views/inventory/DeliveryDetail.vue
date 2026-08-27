<template>
  <div>
    <router-link to="/inventory/deliveries" class="text-sm text-primary hover:underline mb-2 block">← الشحنات</router-link>
    <h2 class="text-xl font-bold mb-6">تفاصيل الشحنة #{{ id }}</h2>
    <div v-if="d" class="bg-white rounded-xl shadow-sm border p-4">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><span class="text-gray-500">المحطة:</span> {{ d.station_name }}</div>
        <div><span class="text-gray-500">الخزان:</span> {{ d.tank_name }}</div>
        <div><span class="text-gray-500">النوع:</span> {{ d.fuel_type_name }}</div>
        <div><span class="text-gray-500">التاريخ:</span> {{ d.delivery_date }}</div>
        <div><span class="text-gray-500">المتوقع:</span> <strong>{{ Number(d.expected_quantity).toLocaleString() }} لتر</strong></div>
        <div><span class="text-gray-500">المستلم:</span> <strong class="text-green-600">{{ d.received_quantity ? Number(d.received_quantity).toLocaleString() : '—' }} لتر</strong></div>
        <div><span class="text-gray-500">النقص:</span> <strong class="text-red-600">{{ d.shortage_quantity ? Number(d.shortage_quantity).toLocaleString() : '—' }} لتر</strong></div>
        <div><span class="text-gray-500">الحالة:</span> {{ d.status }}</div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute(), id = route.params.id, d = ref(null)
onMounted(async () => { const { data } = await api.get(`/deliveries/${id}/`); d.value = data })
</script>
