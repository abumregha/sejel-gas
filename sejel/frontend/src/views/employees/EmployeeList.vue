<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الموظفين</h2>
      <router-link to="/employees/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة موظف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>الهاتف</th><th>المحطة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="e in items" :key="e.name">
            <td class="font-medium">{{ e.employee_name }}</td>
            <td>{{ e.phone || '—' }}</td>
            <td>{{ stationMap[e.station] || e.station }}</td>
            <td class="flex gap-2">
              <router-link :to="`/employees/${e.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(e)" class="text-red-500 text-sm">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stationMap = ref({})
onMounted(async () => {
  const [eRes, sRes] = await Promise.all([api.get('/employees/'), api.get('/stations/')])
  items.value = eRes.data.results || eRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
})
const remove = async (e) => { if (!confirm('حذف؟')) return; await api.delete(`/employees/${e.name}/`); items.value = items.value.filter(x => x.name !== e.name) }
</script>
