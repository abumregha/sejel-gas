<template>
  <div>
    <router-link to="/finance/reconciliations" class="text-sm text-primary hover:underline mb-2 block">← التسويات</router-link>
    <h2 class="text-xl font-bold mb-6">التسوية المالية #{{ id }}</h2>
    <div v-if="rec" class="space-y-6">
      <!-- Fuel Summary -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">المبيعات حسب نوع الوقود</h3>
        <table class="data-table">
          <thead><tr><th>النوع</th><th>اللترات</th><th>السعر</th><th>المبيعات المتوقعة</th></tr></thead>
          <tbody>
            <tr v-for="fs in rec.fuel_summaries" :key="fs.id">
              <td>{{ fs.fuel_type_name }}</td>
              <td class="font-mono">{{ Number(fs.liters_sold).toLocaleString() }}</td>
              <td class="font-mono">{{ fs.unit_price }}</td>
              <td class="font-mono font-bold">{{ Number(fs.expected_sales).toLocaleString() }} د.ل</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h3 class="font-bold mb-3">المبيعات</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>المبيعات المتوقعة:</span><strong>{{ Number(rec.total_expected_sales).toLocaleString() }} د.ل</strong></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h3 class="font-bold mb-3">التحصيل</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>نقد:</span><strong>{{ Number(rec.cash_collected).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between"><span>كوبونات:</span><strong>{{ Number(rec.voucher_total).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between"><span>POS:</span><strong>{{ Number(rec.pos_total).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between border-t pt-2"><span>إجمالي التحصيل:</span><strong>{{ Number(rec.total_collected).toLocaleString() }} د.ل</strong></div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-500">فرق المبيعات</div>
            <div class="text-lg font-bold" :class="Number(rec.difference) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ Number(rec.difference).toLocaleString() }} د.ل
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-500">المصروفات</div>
            <div class="text-lg font-bold text-orange-600">{{ Number(rec.total_expenses || 0).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">صافي النقدية</div>
            <div class="text-lg font-bold text-primary">{{ Number(rec.net_cash || 0).toLocaleString() }} د.ل</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute()
const id = route.params.id
const rec = ref(null)
onMounted(async () => { const { data } = await api.get(`/reconciliations/${id}/`); rec.value = data })
</script>
