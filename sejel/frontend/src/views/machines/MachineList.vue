<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المضخات</h2>
      <router-link to="/machines/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مضخة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>الجزيرة</th><th>المحطة</th><th>العدادات</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="m in items" :key="m.name">
            <td class="font-medium">{{ m.machine_name }}</td>
            <td>{{ islandMap[m.island] || m.island }}</td>
            <td>{{ stationMap[m.station] || m.station }}</td>
            <td>{{ m.meters_count }}</td>
            <td class="flex gap-2">
              <router-link :to="`/machines/${m.name}/edit`" class="text-primary text-sm">تعديل</router-link>
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
const items = ref([])
const islandMap = ref({})
const stationMap = ref({})
const dlg = ref(null)
onMounted(async () => {
  const [mRes, iRes, sRes] = await Promise.all([api.get('/machines/'), api.get('/islands/'), api.get('/stations/')])
  items.value = mRes.data.results || mRes.data
  islandMap.value = Object.fromEntries((iRes.data.results || iRes.data).map(i => [i.name, i.island_name]))
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
})
const remove = async (m) => {
  const ok = await dlg.value.open({ title: 'حذف المضخة', message: `هل أنت متأكد من حذف "${m.machine_name}"؟`, confirmText: 'حذف' })
  if (!ok) return
  await api.delete(`/machines/${m.name}/`)
  items.value = items.value.filter(x => x.name !== m.name)
}
</script>
