<template>
  <div>
    <router-link to="/shifts" class="text-sm text-primary hover:underline mb-2 block">← المناوبات</router-link>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">مناوبة {{ shift?.shift_name || shift?.date }}</h2>
      <div class="flex gap-2">
        <a v-if="shift" :href="`/api/export/?view=shift&name=${id}`" title="تصدير المناوبة إلى Excel"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">⬇ Excel</a>
        <button v-if="shift?.status === 'scheduled'" @click="activateShift"
          class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm">▶ بدء المناوبة</button>
        <router-link v-if="shift?.status === 'open'" :to="`/shifts/${id}/readings`"
          class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm">+ إضافة قراءات</router-link>
        <button v-if="shift?.status === 'open'" @click="submitShift"
          class="bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm">إنهاء وتقديم</button>
        <button v-if="shift?.status === 'submitted'" @click="closeShift"
          class="bg-primary text-white px-4 py-2 rounded-xl text-sm">إقفال المناوبة وإنشاء التسوية</button>
      </div>
    </div>
    <div v-if="shift" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المحطة:</span> {{ stationMap[shift.station] || shift.station }}</div>
          <div><span class="text-gray-500">الجزيرة:</span> {{ islandMap[shift.island] || '—' }}</div>
          <div><span class="text-gray-500">المناوب:</span> {{ employeeMap[shift.employee] || '—' }}</div>
          <div><span class="text-gray-500">الحالة:</span>
            <span :class="statusClass(shift.status)" class="badge">{{ statusLabel(shift.status) }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">قراءات العدادات</h3>
        <table v-if="readings.length" class="data-table">
          <thead><tr><th>العداد</th><th>النوع</th><th>الافتتاحية</th><th>الختامية</th><th>اللترات</th></tr></thead>
          <tbody>
            <tr v-for="r in readings" :key="r.name">
              <td class="font-mono">{{ meterMap[r.meter] || r.meter }}</td>
              <td>{{ fuelMap[meterFuelMap[r.meter]] || '—' }}</td>
              <td class="font-mono">{{ Number(r.start_reading).toLocaleString('en-US') }}</td>
              <td class="font-mono">{{ r.end_reading ? Number(r.end_reading).toLocaleString('en-US') : '—' }}</td>
              <td class="font-mono font-bold">{{ r.liters_sold ? Number(r.liters_sold).toLocaleString('en-US') : '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-gray-400 text-sm text-center py-4">لا توجد قراءات</div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">التحصيل النقدي</h4>
          <div class="text-2xl font-bold text-green-600">{{ formatNum(cashTotal) }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">الكوبونات</h4>
          <div class="text-2xl font-bold text-blue-600">{{ formatNum(vouchersTotal) }} د.ل</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border p-4">
          <h4 class="font-bold text-sm mb-2">POS</h4>
          <div class="text-2xl font-bold text-purple-600">{{ formatNum(posTotal) }} د.ل</div>
        </div>
      </div>

      <div v-if="reconciliation" class="bg-white rounded-xl shadow-sm border p-4">
        <h3 class="font-bold mb-3">التسوية المالية</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">المبيعات المتوقعة:</span> <strong>{{ formatNum(reconciliation.expected_sales) }}</strong></div>
          <div><span class="text-gray-500">إجمالي التحصيل:</span> <strong>{{ formatNum(reconciliation.total_collection) }}</strong></div>
          <div><span class="text-gray-500">الفرق:</span> <strong :class="Number(reconciliation.difference) >= 0 ? 'text-green-600' : 'text-red-600'">{{ formatNum(reconciliation.difference) }}</strong></div>
          <div><span class="text-gray-500">صافي النقدية:</span> <strong>{{ formatNum(reconciliation.net_cash) }}</strong></div>
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
import { SHIFT_STATUS_PRIMARY, SHIFT_BADGE } from '../../utils/labels'
import { friendlyError } from '../../errors'
const route = useRoute(), router = useRouter()
const id = route.params.id
const shift = ref(null)
const readings = ref([])
const cashTotal = ref(0)
const vouchersTotal = ref(0)
const posTotal = ref(0)
const reconciliation = ref(null)
const stationMap = ref({})
const islandMap = ref({})
const employeeMap = ref({})
const meterMap = ref({})
const fuelMap = ref({})
const meterFuelMap = ref({})
const formatNum = (v) => v ? Number(v).toLocaleString('en-US') : '0'
// Q6: statuses presented as 4 primary states via shared labels
const statusLabel = (s) => SHIFT_STATUS_PRIMARY[s] || s
const statusClass = (s) => SHIFT_BADGE[s] || 'badge-gray'

const load = async () => {
  const { data } = await api.get(`/shifts/${id}/`)
  shift.value = data

  const [rRes, cRes, vRes, posRes, reconRes, sRes, iRes, eRes, mRes, fRes] = await Promise.all([
    api.get(`/meter-readings/?shift=${id}`),
    api.get('/cash-collections/'),
    api.get('/vouchers/'),
    api.get('/pos-records/'),
    api.get('/reconciliations/'),
    api.get('/stations/'), api.get('/islands/'), api.get('/employees/'),
    api.get('/meters/'), api.get('/fuel-types/')
  ])

  readings.value = rRes.data.results || rRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  islandMap.value = Object.fromEntries((iRes.data.results || iRes.data).map(i => [i.name, i.island_name]))
  employeeMap.value = Object.fromEntries((eRes.data.results || eRes.data).map(e => [e.name, e.employee_name]))
  meterMap.value = Object.fromEntries((mRes.data.results || mRes.data).map(m => [m.name, m.meter_code]))
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_type_name]))
  meterFuelMap.value = Object.fromEntries((mRes.data.results || mRes.data).map(m => [m.name, m.fuel_type]))

  const allCash = cRes.data.results || cRes.data
  const allVouchers = vRes.data.results || vRes.data
  const allPos = posRes.data.results || posRes.data
  const shiftCash = allCash.filter(c => String(c.shift) === String(id) && !c.is_cancelled)
  const shiftVouchers = allVouchers.filter(v => String(v.shift) === String(id) && !v.is_cancelled)
  const shiftPos = allPos.filter(p => String(p.shift) === String(id) && !p.is_cancelled)
  cashTotal.value = shiftCash.reduce((s, c) => s + Number(c.amount || 0), 0)
  vouchersTotal.value = shiftVouchers.reduce((s, v) => s + Number(v.total_value || 0), 0)
  posTotal.value = shiftPos.reduce((s, p) => s + Number(p.total_amount || 0), 0)

  const allRecons = reconRes.data.results || reconRes.data
  reconciliation.value = allRecons.find(r => String(r.shift) === String(id)) || null
}

onMounted(load)

const closeShift = async () => {
  if (!confirm('إقفال المناوبة وإنشاء التسوية المالية؟')) return
  try { await api.post(`/shifts/${id}/close/`); await load() } catch (e) { alert(friendlyError(e)) }
}
const activateShift = async () => {
  try { await api.put(`/shifts/${id}/`, { status: 'open' }); await load() } catch (e) { alert(friendlyError(e)) }
}
const submitShift = async () => {
  if (!confirm('إنهاء المناوبة وتقديمها للإقفال؟')) return
  try { await api.put(`/shifts/${id}/`, { status: 'submitted' }); await load() } catch (e) { alert(friendlyError(e)) }
}
</script>
