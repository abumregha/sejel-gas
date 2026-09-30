<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المبيعات المالية اليومية</h2>
      <div class="flex items-center gap-3">
        <input v-model="reportDate" type="date" class="border border-gray-300 rounded-lg px-4 py-2" />
        <button @click="loadReport" class="bg-primary text-white px-4 py-2 rounded-lg text-sm">عرض</button>
        <button @click="printReport" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm">طباعة</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>

    <div v-else-if="report" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="kpi-card">
          <div class="kpi-label">المبيعات النقدية</div>
          <div class="kpi-value text-green-600">{{ formatNum(report.cash_sales) }} د.ل</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">مبيعات الكوبونات</div>
          <div class="kpi-value text-blue-600">{{ formatNum(report.coupon_sales) }} د.ل</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">المبيعات الإلكترونية</div>
          <div class="kpi-value text-purple-600">{{ formatNum(report.epayment_sales) }} د.ل</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">إجمالي التحصيل</div>
          <div class="kpi-value text-primary">{{ formatNum(report.total_collection) }} د.ل</div>
        </div>
      </div>

      <!-- Coupon Breakdown -->
      <div v-if="report.coupon_details?.length" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">تفاصيل الكوبونات</h3>
        <table class="data-table">
          <thead><tr><th>الفئة</th><th>العدد</th><th>القيمة</th></tr></thead>
          <tbody>
            <tr v-for="c in report.coupon_details" :key="c.category">
              <td>{{ c.category }} د.ل</td>
              <td class="font-mono">{{ c.count }}</td>
              <td class="font-mono font-bold">{{ formatNum(c.total) }} د.ل</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="font-bold border-t">
              <td>الإجمالي</td>
              <td class="font-mono">{{ report.coupon_details.reduce((s, c) => s + c.count, 0) }}</td>
              <td class="font-mono text-primary">{{ formatNum(report.coupon_sales) }} د.ل</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Expenses -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">المصروفات</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-gray-500 text-sm">إجمالي المصروفات:</span>
            <span class="text-lg font-bold text-red-600 mr-2">{{ formatNum(report.total_expenses) }} د.ل</span>
          </div>
          <div>
            <span class="text-gray-500 text-sm">صافي الإيرادات:</span>
            <span class="text-lg font-bold text-primary mr-2">{{ formatNum(report.net_income) }} د.ل</span>
          </div>
        </div>
      </div>

      <!-- Station Comparison -->
      <div v-if="report.stations?.length" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">مقارنة المحطات</h3>
        <table class="data-table">
          <thead><tr><th>المحطة</th><th>نقد</th><th>كوبونات</th><th>إلكتروني</th><th>الإجمالي</th></tr></thead>
          <tbody>
            <tr v-for="s in report.stations" :key="s.id">
              <td class="font-medium">{{ s.name }}</td>
              <td class="font-mono">{{ formatNum(s.cash) }}</td>
              <td class="font-mono">{{ formatNum(s.coupons) }}</td>
              <td class="font-mono">{{ formatNum(s.epayment) }}</td>
              <td class="font-mono font-bold text-primary">{{ formatNum(s.total) }} د.ل</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-400">اختر تاريخاً لعرض التقرير</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
const route = useRoute()
const reportDate = ref(route.query.date || new Date().toISOString().split('T')[0])
const report = ref(null)
const loading = ref(false)
const formatNum = (v) => v ? Number(v).toLocaleString('ar-LY') : '0'
const loadReport = async () => {
  loading.value = true
  try {
    const { data: res } = await api.get(`/reports/daily-sales/?date=${reportDate.value}`)
    report.value = res
  } catch (e) { report.value = null }
  loading.value = false
}
const printReport = () => window.print()
onMounted(loadReport)
</script>
