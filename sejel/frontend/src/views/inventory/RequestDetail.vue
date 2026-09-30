<template>
  <div>
    <router-link to="/inventory/requests" class="text-sm text-primary hover:underline mb-2 block">← الطلبات</router-link>
    <h2 class="text-xl font-bold mb-6">طلب التوريد #{{ id }}</h2>
    <div v-if="r" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المحطة:</span> {{ stationMap[r.station] || r.station }}</div>
          <div><span class="text-gray-500">نوع الوقود:</span> {{ fuelMap[r.fuel_type] || r.fuel_type || '—' }}</div>
          <div><span class="text-gray-500">الكمية:</span> <strong>{{ Number(r.requested_quantity).toLocaleString() }} لتر</strong></div>
          <div><span class="text-gray-500">الأولوية:</span> {{ priorityLabel(r.priority) }}</div>
          <div><span class="text-gray-500">الحالة:</span>
            <span :class="statusBadge(r.status)" class="badge">{{ statusLabel(r.status) }}</span>
          </div>
          <div v-if="r.reason"><span class="text-gray-500">السبب:</span> {{ r.reason }}</div>
        </div>
      </div>
      <div v-if="r.status !== 'received' && r.status !== 'cancelled'" class="flex gap-2">
        <button v-if="r.status === 'pending'" @click="updateStatus('approved')" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">موافقة</button>
        <button v-if="r.status === 'approved'" @click="updateStatus('dispatched')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">تم الشحن</button>
        <button v-if="r.status === 'dispatched'" @click="updateStatus('received')" class="bg-green-800 text-white px-4 py-2 rounded-lg text-sm">تم الاستلام</button>
        <button @click="updateStatus('cancelled')" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">إلغاء</button>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute(), id = route.params.id, r = ref(null)
const stationMap = ref({})
const fuelMap = ref({})
const priorityLabel = (p) => ({ normal: 'عادي', urgent: 'عاجل', critical: 'حرج' }[p] || p)
const load = async () => {
  const [dRes, sRes, fRes] = await Promise.all([api.get(`/delivery-requests/${id}/`), api.get('/stations/'), api.get('/fuel-types/')])
  r.value = dRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
}
onMounted(load)
const updateStatus = async (status) => { await api.patch(`/delivery-requests/${id}/`, { status }); await load() }
const statusLabel = (s) => ({ pending: 'قيد الانتظار', approved: 'تمت الموافقة', dispatched: 'في الطريق', received: 'تم الاستلام', cancelled: 'ملغى' }[s] || s)
const statusBadge = (s) => ({ pending: 'badge-yellow', approved: 'badge-blue', dispatched: 'badge-blue', received: 'badge-green', cancelled: 'badge-red' }[s] || 'badge-gray')
</script>
