<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">العدادات</h2>
      <router-link to="/meters/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة عداد</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الكود</th><th>النوع</th><th>المضخة</th><th>الجزيرة</th><th>الخزان</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="m in items" :key="m.name">
            <td class="font-mono font-medium">{{ m.meter_code }}</td>
            <td>{{ fuelMap[m.fuel_type] || m.fuel_type }}</td>
            <td>{{ machineMap[m.machine] || m.machine }}</td>
            <td>{{ islandMap[machines.find(x => x.name === m.machine)?.island] || '—' }}</td>
            <td>{{ tankMap[m.tank] || '—' }}</td>
            <td><span class="badge badge-gray">{{ label(METER_STATUS, m.status) }}</span></td>
            <td class="flex gap-2">
              <router-link :to="`/meters/${m.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(m)" class="text-red-500 text-sm">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ConfirmDialog ref="dlg" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import { label, METER_STATUS } from '../../utils/labels'

const items = ref([])
const machines = ref([])
const fuelMap = ref({})
const machineMap = ref({})
const islandMap = ref({})
const tankMap = ref({})
const dlg = ref(null)

onMounted(async () => {
  const [mRes, machRes, fRes, iRes, tRes] = await Promise.all([
    api.get('/meters/'), api.get('/machines/'), api.get('/fuel-types/'), api.get('/islands/'), api.get('/tanks/')
  ])
  items.value = mRes.data.results || mRes.data
  machines.value = machRes.data.results || machRes.data
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
  machineMap.value = Object.fromEntries(machines.value.map(m => [m.name, m.machine_name]))
  islandMap.value = Object.fromEntries((iRes.data.results || iRes.data).map(i => [i.name, i.island_name]))
  tankMap.value = Object.fromEntries((tRes.data.results || tRes.data).map(t => [t.name, t.tank_name]))
})

const remove = async (m) => {
  const ok = await dlg.value.open({
    title: 'حذف العداد',
    message: `هل أنت متأكد من حذف العداد "${m.meter_code}"؟`,
    confirmText: 'حذف',
  })
  if (!ok) return
  await api.delete(`/meters/${m.name}/`)
  items.value = items.value.filter(x => x.name !== m.name)
}
</script>
