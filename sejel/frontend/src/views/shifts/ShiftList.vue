<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المناوبات</h2>
      <router-link to="/shifts/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مناوبة</router-link>
    </div>
    <!-- Filters -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="f in statusFilters" :key="f.value" @click="statusFilter = f.value"
        :class="['px-3 py-1.5 rounded-lg text-sm border transition', statusFilter === f.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50']">
        {{ f.label }}
      </button>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>التاريخ</th><th>المحطة</th><th>الجزيرة</th><th>المناوب</th><th>من</th><th>إلى</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id" class="cursor-pointer" @click="$router.push(`/shifts/${s.id}`)">
            <td>{{ s.date }}</td>
            <td>{{ s.station_name }}</td>
            <td>{{ s.island_name || '—' }}</td>
            <td>{{ s.employee_name || '—' }}</td>
            <td>{{ s.start_time || '—' }}</td>
            <td>{{ s.end_time || '—' }}</td>
            <td>
              <span :class="s.status === 'closed' ? 'badge-green' : s.status === 'reconciled' ? 'badge-blue' : 'badge-yellow'" class="badge">
                {{ { open: 'نشطة', closed: 'مغلقة', reconciled: 'موسّاة' }[s.status] || s.status }}
              </span>
            </td>
            <td>
              <button v-if="s.status === 'open'" @click.stop="closeShift(s)" class="text-primary text-sm">إقفال</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filtered.length" class="text-gray-400 text-center py-8">لا توجد مناوبات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const items = ref([])
const statusFilter = ref('all')
const statusFilters = [
  { label: 'الكل', value: 'all' },
  { label: 'نشطة', value: 'open' },
  { label: 'مغلقة', value: 'closed' },
  { label: 'موسّاة', value: 'reconciled' },
]
const filtered = computed(() => statusFilter.value === 'all' ? items.value : items.value.filter(s => s.status === statusFilter.value))
onMounted(async () => { const { data } = await api.get('/shifts/'); items.value = data.results || data })
const closeShift = async (s) => {
  if (!confirm('إقفال المناوبة وإنشاء التسوية؟')) return
  try {
    await api.post(`/shifts/${s.id}/close/`)
    alert('تم الإقفال والتسوية بنجاح')
    router.push(`/shifts/${s.id}`)
  } catch (e) { alert(e.response?.data?.error || 'خطأ في الإقفال') }
}
</script>
