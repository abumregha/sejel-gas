<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">طلبات التوريد</h2>
      <router-link to="/inventory/requests/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة طلب</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>الخزان</th><th>الكمية</th><th>الأولوية</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="r in items" :key="r.id" class="cursor-pointer" @click="$router.push(`/inventory/requests/${r.id}`)">
            <td>{{ r.created_at }}</td>
            <td>{{ r.station_name }}</td>
            <td>{{ r.tank_name }}</td>
            <td class="font-mono">{{ Number(r.requested_quantity).toLocaleString() }} لتر</td>
            <td>
              <span :class="r.priority === 'urgent' ? 'badge-red' : r.priority === 'high' ? 'badge-yellow' : 'badge-gray'" class="badge">
                {{ { normal: 'عادي', high: 'مهم', urgent: 'عاجل' }[r.priority] || r.priority }}
              </span>
            </td>
            <td>
              <span :class="r.status === 'received' ? 'badge-green' : r.status === 'cancelled' ? 'badge-red' : 'badge-yellow'" class="badge">
                {{ { pending: 'قيد الانتظار', approved: 'تمت الموافقة', dispatched: 'في الطريق', received: 'تم الاستلام', cancelled: 'ملغى' }[r.status] || r.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد طلبات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/delivery-requests/'); items.value = data.results || data })
</script>
