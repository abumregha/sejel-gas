<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المناوبات</h2>
      <router-link to="/shifts/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مناوبة</router-link>
    </div>
    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="f in statusFilters" :key="f.value" @click="statusFilter = f.value"
        :class="['px-3 py-1.5 rounded-lg text-sm border transition', statusFilter === f.value ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-50']">
        {{ f.label }}
      </button>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>التاريخ</th><th>المحطة</th><th>الجزيرة</th><th>المناوب</th><th>من</th><th>إلى</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.name" class="cursor-pointer" @click="$router.push(`/shifts/${s.name}`)">
            <td class="font-medium">
              {{ s.shift_name }}
              <!-- day-close rows are the reading/closing cycle, not a working shift -->
              <span v-if="s.is_day_close" class="badge badge-gray mr-1" data-testid="day-close-badge">إقفال اليوم</span>
            </td>
            <td>{{ s.date }}</td>
            <td>{{ stationMap[s.station] || s.station }}</td>
            <td>{{ islandMap[s.island] || '—' }}</td>
            <td>{{ employeeMap[s.employee] || '—' }}</td>
            <td>{{ s.start_time || '—' }}</td>
            <td>{{ s.end_time || '—' }}</td>
            <td>
              <span :class="statusClass(s.status)" class="badge">{{ statusLabel(s.status) }}</span>
            </td>
            <td class="flex gap-2">
              <button v-if="s.status === 'scheduled'" @click.stop="activateShift(s)" class="text-blue-600 text-sm">بدء</button>
              <button v-if="s.status === 'open'" @click.stop="submitShift(s)" class="text-yellow-600 text-sm">تقديم</button>
              <button v-if="s.status === 'submitted'" @click.stop="closeShift(s)" class="text-primary text-sm">إقفال</button>
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
import { SHIFT_STATUS_PRIMARY, SHIFT_BADGE } from '../../utils/labels'
import { friendlyError } from '../../errors'
const router = useRouter()
const items = ref([])
const stationMap = ref({})
const islandMap = ref({})
const employeeMap = ref({})
const statusFilter = ref('all')
const statusFilters = [
  { label: 'الكل', value: 'all' },
  { label: 'مجدولة', value: 'scheduled' },
  { label: 'نشطة', value: 'open' },
  { label: 'مقدمة', value: 'submitted' },
  { label: 'مغلقة', value: 'closed' },
  { label: 'موسّاة', value: 'reconciled' },
]
const filtered = computed(() => statusFilter.value === 'all' ? items.value : items.value.filter(s => s.status === statusFilter.value))
// Q6: statuses presented as 4 primary states via shared labels
const statusLabel = (s) => SHIFT_STATUS_PRIMARY[s] || s
const statusClass = (s) => SHIFT_BADGE[s] || 'badge-gray'

onMounted(async () => {
  const [shRes, sRes, iRes, eRes] = await Promise.all([
    api.get('/shifts/'), api.get('/stations/'), api.get('/islands/'), api.get('/employees/')
  ])
  items.value = shRes.data.results || shRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  islandMap.value = Object.fromEntries((iRes.data.results || iRes.data).map(i => [i.name, i.island_name]))
  employeeMap.value = Object.fromEntries((eRes.data.results || eRes.data).map(e => [e.name, e.employee_name]))
})

const closeShift = async (s) => {
  if (!confirm('إقفال المناوبة وإنشاء التسوية المالية؟')) return
  try {
    await api.post(`/shifts/${s.name}/close/`)
    s.status = 'closed'
  } catch (e) {
    alert(friendlyError(e))
  }
}
const activateShift = async (s) => {
  try { await api.put(`/shifts/${s.name}/`, { status: 'open' }); s.status = 'open' } catch (e) { alert(friendlyError(e)) }
}
const submitShift = async (s) => {
  if (!confirm('إنهاء المناوبة وتقديمها للإقفال؟')) return
  try { await api.put(`/shifts/${s.name}/`, { status: 'submitted' }); s.status = 'submitted' } catch (e) { alert(friendlyError(e)) }
}
</script>
