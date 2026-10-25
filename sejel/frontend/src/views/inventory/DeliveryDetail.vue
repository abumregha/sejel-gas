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
        <div><span class="text-gray-500">التاريخ المجدول:</span> {{ d.scheduled_date || '—' }}</div>
        <div><span class="text-gray-500">شحنة غير مجدولة:</span> {{ d.is_unscheduled ? 'نعم' : 'لا' }}</div>
        <div><span class="text-gray-500">تاريخ الاستلام الفعلي:</span> {{ d.arrival_date || '—' }}</div>
        <div><span class="text-gray-500">الحالة:</span> {{ label(DELIVERY_STATUS, d.status) }}</div>
        <div><span class="text-gray-500">المتوقع:</span> <strong>{{ Number(d.expected_quantity).toLocaleString('en-US') }} لتر</strong></div>
        <div><span class="text-gray-500">المستلم:</span> <strong class="text-green-600">{{ d.received_quantity ? Number(d.received_quantity).toLocaleString('en-US') : '—' }} لتر</strong></div>
        <div><span class="text-gray-500">النقص:</span> <strong class="text-red-600">{{ d.shortage_quantity ? Number(d.shortage_quantity).toLocaleString('en-US') : '—' }} لتر</strong></div>
        <div v-if="d.total_amount != null"><span class="text-gray-500">الإجمالي:</span> <strong>{{ Number(d.total_amount).toLocaleString('en-US') }}</strong></div>
      </div>
      <div class="flex gap-2 mt-4">
        <button
          v-if="d.status !== 'undelivered'"
          @click="markUndelivered"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          غير مسلّمة
        </button>
        <button
          v-if="d.status !== 'transit'"
          @click="markTransit"
          class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
        >
          مرحلة
        </button>
        <button
          v-if="d.status !== 'received'"
          @click="confirmDelivery"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          تأكيد الاستلام
        </button>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import { label, DELIVERY_STATUS, PAYMENT_STATUS } from '../../utils/labels'
const route = useRoute(), id = route.params.id, d = ref(null)
onMounted(async () => { const { data } = await api.get(`/deliveries/${id}/`); d.value = data })
async function markUndelivered() {
  const { data } = await api.put(`/deliveries/${id}/`, { ...d.value, status: 'undelivered' })
  d.value = data
}
async function markTransit() {
  const { data } = await api.put(`/deliveries/${id}/`, { ...d.value, status: 'transit' })
  d.value = data
}
async function confirmDelivery() {
  const { data } = await api.put(`/deliveries/${id}/`, { ...d.value, status: 'received', arrival_date: new Date().toISOString() })
  d.value = data
}
</script>
