<template>
  <div>
    <router-link to="/finance/settlements" class="text-sm text-primary hover:underline mb-2 block">← التسويات</router-link>
    <h2 class="text-xl font-bold mb-6">تفاصيل التسوية #{{ id }}</h2>
    <div v-if="s" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المحطة:</span> {{ s.station_name }}</div>
          <div><span class="text-gray-500">القيمة:</span> <strong>{{ Number(s.total_value).toLocaleString() }} د.ل</strong></div>
          <div><span class="text-gray-500">المدفوع:</span> <strong class="text-green-600">{{ Number(s.paid_amount).toLocaleString() }} د.ل</strong></div>
          <div><span class="text-gray-500">المتبقي:</span> <strong class="text-red-600">{{ Number(s.outstanding).toLocaleString() }} د.ل</strong></div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">التفاصيل</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div><div class="text-2xl font-bold">{{ s.count_5 || 0 }}</div><div class="text-sm text-gray-500">كوبون 5 د.ل</div></div>
          <div><div class="text-2xl font-bold">{{ s.count_6 || 0 }}</div><div class="text-sm text-gray-500">كوبون 6 د.ل</div></div>
          <div><div class="text-2xl font-bold">{{ s.count_8 || 0 }}</div><div class="text-sm text-gray-500">كوبون 8 د.ل</div></div>
        </div>
      </div>
      <div v-if="s.status === 'submitted'" class="flex gap-2">
        <button @click="markPaid" class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">تحديد كمدفوع</button>
        <button @click="markPartial" class="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">دفع جزئي</button>
        <button @click="markDisputed" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">متعارضة</button>
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
const s = ref(null)
const load = async () => { const { data } = await api.get(`/voucher-settlements/${id}/`); s.value = data }
onMounted(load)
const markPaid = async () => { await api.patch(`/voucher-settlements/${id}/`, { status: 'paid', paid_amount: s.value.total_value }); await load() }
const markPartial = async () => { const amt = prompt('المبلغ المدفوع:'); if (amt) { await api.patch(`/voucher-settlements/${id}/`, { status: 'partial', paid_amount: amt }); await load() } }
const markDisputed = async () => { await api.patch(`/voucher-settlements/${id}/`, { status: 'disputed' }); await load() }
</script>
