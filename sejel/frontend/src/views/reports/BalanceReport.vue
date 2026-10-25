<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">تقرير الرصيد الشهري</h2>
      <div class="flex gap-2">
        <input v-model.number="year" type="number" class="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center" placeholder="السنة" />
        <input v-model.number="month" type="number" min="1" max="12" class="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center" placeholder="الشهر" />
        <button @click="load" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
      </div>
    </div>
    <div v-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
    <div v-else-if="data" class="space-y-6">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div class="text-sm text-gray-500">الدفعات المقدمة</div>
          <div class="text-lg font-bold text-green-600">{{ totals.deposits.toLocaleString('en-US') }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div class="text-sm text-gray-500">تكاليف الشحنات</div>
          <div class="text-lg font-bold text-red-600">{{ totals.shipment_costs.toLocaleString('en-US') }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div class="text-sm text-gray-500">الإيجار</div>
          <div class="text-lg font-bold text-red-600">{{ totals.rent.toLocaleString('en-US') }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div class="text-sm text-gray-500">التسويات</div>
          <div class="text-lg font-bold text-yellow-600">{{ totals.adjustments.toLocaleString('en-US') }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4 text-center">
          <div class="text-sm text-gray-500">الرصيد</div>
          <div class="text-lg font-bold" :class="totals.balance < 0 ? 'text-red-600' : 'text-green-600'">{{ totals.balance.toLocaleString('en-US') }} د.ل</div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>المحطة</th><th>الدفعات</th><th>الشحنات</th><th>الإيجار</th><th>التسويات</th><th>الرصيد</th></tr></thead>
          <tbody>
            <tr v-for="s in data.stations" :key="s.station">
              <td>{{ s.station_name }}</td>
              <td class="font-mono text-green-600">{{ s.deposits.toLocaleString('en-US') }}</td>
              <td class="font-mono text-red-600">{{ s.shipment_costs.toLocaleString('en-US') }}</td>
              <td class="font-mono">{{ s.rent_hidden ? 'مخفي' : s.rent.toLocaleString('en-US') }}</td>
              <td class="font-mono">{{ s.adjustments.toLocaleString('en-US') }}</td>
              <td class="font-mono font-bold" :class="s.running_balance < 0 ? 'text-red-600' : 'text-green-600'">{{ s.running_balance.toLocaleString('en-US') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">اختر السنة والشهر لعرض التقرير</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const year = ref(new Date().getFullYear())
const month = ref(new Date().getMonth() + 1)
const data = ref(null)
const loading = ref(false)
const totals = ref({})
const load = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get(`/reports/balance/?year=${year.value}&month=${month.value}`)
    data.value = res
    totals.value = res.totals || {}
  } catch (e) {
    data.value = null
  } finally { loading.value = false }
}
onMounted(load)
</script>
