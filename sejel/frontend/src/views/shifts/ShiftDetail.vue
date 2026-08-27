<template>
  <div>
    <router-link to="/shifts" class="text-sm text-primary hover:underline mb-2 block">← المناوبات</router-link>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">مناوبة {{ shift?.date }}</h2>
      <div class="flex gap-2">
        <router-link v-if="shift?.status === 'open'" :to="`/shifts/${id}/readings`"
          class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm">+ إضافة قراءات</router-link>
        <button v-if="shift?.status === 'open'" @click="closeShift"
          class="bg-primary text-white px-4 py-2 rounded-xl text-sm">إقفال المناوبة</button>
      </div>
    </div>
    <div v-if="shift" class="space-y-6">
      <!-- Info -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المحطة:</span> {{ shift.station_name }}</div>
          <div><span class="text-gray-500">الجزيرة:</span> {{ shift.island_name || '—' }}</div>
          <div><span class="text-gray-500">المناوب:</span> {{ shift.employee_name || '—' }}</div>
          <div><span class="text-gray-500">الحالة:</span>
            <span :class="shift.status === 'closed' ? 'badge-green' : 'badge-yellow'" class="badge">
              {{ { open: 'نشطة', closed: 'مغلقة', reconciled: 'موسّاة' }[shift.status] }}
            </span>
          </div>
        </div>
      </div>

      <!-- Meter Readings -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">قراءات العدادات</h3>
        <table v-if="shift.readings?.length" class="data-table">
          <thead><tr><th>العداد</th><th>النوع</th><th>الافتتاحية</th><th>الختامية</th><th>اللترات</th></tr></thead>
          <tbody>
            <tr v-for="r in shift.readings" :key="r.id">
              <td class="font-mono">{{ r.meter_code }}</td>
              <td>{{ r.fuel_type_name }}</td>
              <td class="font-mono">{{ Number(r.start_reading).toLocaleString() }}</td>
              <td class="font-mono">{{ r.end_reading ? Number(r.end_reading).toLocaleString() : '—' }}</td>
              <td class="font-mono font-bold">{{ r.liters_sold ? Number(r.liters_sold).toLocaleString() : '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-gray-400 text-sm text-center py-4">لا توجد قراءات</div>
      </div>

      <!-- Collections -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">التحصيل النقدي</h4>
          <div class="text-2xl font-bold text-green-600">{{ formatNum(shift.cash_total) }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">الكوبونات</h4>
          <div class="text-2xl font-bold text-blue-600">{{ formatNum(shift.vouchers_total) }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">POS</h4>
          <div class="text-2xl font-bold text-purple-600">{{ formatNum(shift.pos_total) }} د.ل</div>
        </div>
      </div>

      <!-- Reconciliation -->
      <div v-if="shift.reconciliation" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">التسوية المالية</h3>
        <div v-if="shift.reconciliation.fuel_summaries?.length" class="mb-4">
          <h4 class="text-sm font-medium text-gray-600 mb-2">مبيعات حسب نوع الوقود</h4>
          <table class="data-table">
            <thead><tr><th>النوع</th><th>اللترات</th><th>السعر</th><th>المبيعات المتوقعة</th></tr></thead>
            <tbody>
              <tr v-for="fs in shift.reconciliation.fuel_summaries" :key="fs.id">
                <td>{{ fs.fuel_type_name }}</td>
                <td class="font-mono">{{ Number(fs.liters_sold).toLocaleString() }}</td>
                <td class="font-mono">{{ fs.unit_price }}</td>
                <td class="font-mono font-bold">{{ Number(fs.expected_sales).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المبيعات المتوقعة:</span> <strong>{{ formatNum(shift.reconciliation.total_expected_sales) }}</strong></div>
          <div><span class="text-gray-500">إجمالي التحصيل:</span> <strong>{{ formatNum(shift.reconciliation.total_collected) }}</strong></div>
          <div><span class="text-gray-500">الفرق:</span> <strong :class="Number(shift.reconciliation.difference) >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatNum(shift.reconciliation.difference) }}</strong></div>
          <div><span class="text-gray-500">صافي النقدية:</span> <strong>{{ formatNum(shift.reconciliation.net_cash) }}</strong></div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
const route = useRoute(), router = useRouter()
const id = route.params.id
const shift = ref(null)
const formatNum = (v) => v ? Number(v).toLocaleString('ar-LY') : '0'
const load = async () => { const { data } = await api.get(`/shifts/${id}/`); shift.value = data }
onMounted(load)
const closeShift = async () => {
  if (!confirm('إقفال المناوبة وإنشاء التسوية؟')) return
  try { await api.post(`/shifts/${id}/close/`); await load() } catch (e) { alert(e.response?.data?.error || 'خطأ') }
}
</script>
