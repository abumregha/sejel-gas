<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">تعريفات المناوبات</h2>
      <router-link to="/shifts/definitions/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة تعريف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>من</th><th>إلى</th><th>الأيام</th><th>المحطة</th><th>الجزيرة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="d in items" :key="d.id">
            <td class="font-medium">{{ d.name }}</td>
            <td>{{ d.start_time }}</td>
            <td>{{ d.end_time }}</td>
            <td>{{ d.days_display }}</td>
            <td>{{ d.station_name }}</td>
            <td>{{ d.island_name || '—' }}</td>
            <td class="flex gap-2">
              <router-link :to="`/shifts/definitions/${d.id}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(d)" class="text-red-500 text-sm">حذف</button>
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
onMounted(async () => { const { data } = await api.get('/shift-definitions/'); items.value = data.results || data })
const remove = async (d) => { if (!confirm('حذف؟')) return; await api.delete(`/shift-definitions/${d.id}/`); items.value = items.value.filter(x => x.id !== d.id) }
</script>
