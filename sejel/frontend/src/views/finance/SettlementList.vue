<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">تسويات الكوبونات</h2>
      <router-link to="/finance/settlements/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تسوية</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المحطة</th><th>القيمة</th><th>المدفوع</th><th>المتبقي</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="s in items" :key="s.id" class="cursor-pointer" @click="$router.push(`/finance/settlements/${s.id}`)">
            <td>{{ s.station_name }}</td>
            <td class="font-mono">{{ Number(s.total_value).toLocaleString() }} د.ل</td>
            <td class="font-mono text-green-600">{{ Number(s.paid_amount).toLocaleString() }} د.ل</td>
            <td class="font-mono text-red-600">{{ Number(s.outstanding).toLocaleString() }} د.ل</td>
            <td>
              <span :class="statusBadge(s.status)" class="badge">{{ statusLabel(s.status) }}</span>
            </td>
            <td>
              <button @click.stop="remove(s)" v-if="s.status === 'submitted'" class="text-red-500 text-sm">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد تسويات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/voucher-settlements/'); items.value = data.results || data })
const remove = async (s) => { if (!confirm('حذف؟')) return; await api.delete(`/voucher-settlements/${s.id}/`); items.value = items.value.filter(x => x.id !== s.id) }
const statusLabel = (s) => ({ submitted: 'مقدمة', paid: 'مدفوعة', partial: 'جزئية', disputed: 'متعارضة', cancelled: 'ملغاة' }[s] || s)
const statusBadge = (s) => ({ submitted: 'badge-yellow', paid: 'badge-green', partial: 'badge-blue', disputed: 'badge-red', cancelled: 'badge-gray' }[s] || 'badge-gray')
</script>
