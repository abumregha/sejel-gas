<template>
  <div>
    <router-link to="/finance/reconciliations" class="text-sm text-primary hover:underline mb-2 block">← التسويات</router-link>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">التسوية المالية</h2>
      <a :href="`/api/export/?view=reconciliation&name=${route.params.id}`" title="تصدير التسوية إلى Excel"
        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">⬇ تصدير Excel</a>
    </div>
    <div v-if="rec" class="space-y-6">
      <!-- Per-fuel-type breakdown -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">المبيعات حسب نوع الوقود</h3>
        <table v-if="fuelSummaries.length" class="data-table">
          <thead><tr><th>النوع</th><th>اللترات</th><th>السعر</th><th>المبيعات المتوقعة</th></tr></thead>
          <tbody>
            <tr v-for="fs in fuelSummaries" :key="fs.name">
              <td>{{ fuelMap[fs.fuel_type] || fs.fuel_type }}</td>
              <td class="font-mono">{{ Number(fs.liters_sold || 0).toLocaleString() }}</td>
              <td class="font-mono">{{ fs.unit_price }}</td>
              <td class="font-mono font-bold">{{ Number(fs.expected_sales || 0).toLocaleString() }} د.ل</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-gray-400 text-sm text-center py-4">لا توجد ملخصات وقود</div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h3 class="font-bold mb-3">المبيعات المتوقعة</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>إجمالي اللترات:</span><strong>{{ Number(rec.total_liters || 0).toLocaleString() }}</strong></div>
            <div class="flex justify-between border-t pt-2"><span>المبيعات المتوقعة:</span><strong>{{ Number(rec.expected_sales || 0).toLocaleString() }} د.ل</strong></div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h3 class="font-bold mb-3">التحصيل</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between"><span>نقد:</span><strong>{{ Number(rec.total_cash || 0).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between"><span>كوبونات:</span><strong>{{ Number(rec.total_vouchers || 0).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between"><span>POS:</span><strong>{{ Number(rec.total_pos || 0).toLocaleString() }} د.ل</strong></div>
            <div class="flex justify-between border-t pt-2"><span>إجمالي التحصيل:</span><strong>{{ Number(rec.total_collection || 0).toLocaleString() }} د.ل</strong></div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-500">فرق المبيعات</div>
            <div class="text-lg font-bold" :class="Number(rec.difference) >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ Number(rec.difference || 0).toLocaleString() }} د.ل
            </div>
            <div class="text-xs text-gray-400">{{ diffTypeLabel(rec.difference_type) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">المصروفات</div>
            <div class="text-lg font-bold text-orange-600">{{ Number(rec.total_expenses || 0).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">صافي النقدية</div>
            <div class="text-lg font-bold text-primary">{{ Number(rec.net_cash || 0).toLocaleString() }} د.ل</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">الحالة</div>
            <div class="text-lg font-bold">
              <span :class="rec.status === 'confirmed' ? 'badge-green' : 'badge-yellow'" class="badge">
                {{ statusLabel(rec.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute()
const id = route.params.id
const rec = ref(null)
const fuelMap = ref({})
const fuelSummaries = ref([])
const statusLabel = (s) => ({ confirmed: 'موثقة', draft: 'مسودة' }[s] || s || '—')
const diffTypeLabel = (t) => ({ matched: 'مطابق', surplus: 'فائض', shortage: 'عجز' }[t] || t || '—')

onMounted(async () => {
  const [recRes, fRes] = await Promise.all([api.get(`/reconciliations/${id}/`), api.get('/fuel-types/')])
  rec.value = recRes.data
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))

  // Fuel summaries live in a separate Shift Fuel Summary doctype, linked by reconciliation
  try {
    const sRes = await api.get('/shift-fuel-summaries/', { params: { reconciliation: id } })
    fuelSummaries.value = sRes.data.results || sRes.data || []
  } catch (e) { fuelSummaries.value = [] }
})
</script>
