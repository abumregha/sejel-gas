<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الجزر</h2>
      <router-link to="/islands/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة جزيرة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>المحطة</th><th>الحالة</th><th>المضخات</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="i in items" :key="i.name">
            <td class="font-medium">{{ i.island_name }}</td>
            <td>
              <router-link :to="`/stations/${i.station}`" class="text-primary hover:underline">{{ stationMap[i.station] || i.station }}</router-link>
            </td>
            <td><span class="badge badge-gray">{{ label(ISLAND_STATUS, i.status) }}</span></td>
            <td>{{ i.machines_count }}</td>
            <td class="flex gap-2">
              <router-link :to="`/islands/${i.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(i)" class="text-red-500 text-sm">حذف</button>
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
import { label, ISLAND_STATUS } from '../../utils/labels'

const items = ref([])
const stationMap = ref({})
const dlg = ref(null)

onMounted(async () => {
  const [iRes, sRes] = await Promise.all([api.get('/islands/'), api.get('/stations/')])
  items.value = iRes.data.results || iRes.data
  const stations = sRes.data.results || sRes.data
  stationMap.value = Object.fromEntries(stations.map(s => [s.name, s.station_name]))
})

const remove = async (i) => {
  const ok = await dlg.value.open({
    title: 'حذف الجزيرة',
    message: `هل أنت متأكد من حذف "${i.island_name}"؟ ستُحذف مضخاتها وعداداتها أيضاً.`,
    confirmText: 'حذف',
  })
  if (!ok) return
  await api.delete(`/islands/${i.name}/`)
  items.value = items.value.filter(x => x.name !== i.name)
}
</script>
