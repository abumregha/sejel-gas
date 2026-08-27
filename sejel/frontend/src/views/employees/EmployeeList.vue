<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الموظفين</h2>
      <router-link to="/employees/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة موظف</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>المنصب</th><th>المحطة</th><th>الهاتف</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="e in items" :key="e.id">
            <td class="font-medium">{{ e.name }}</td>
            <td>{{ e.position }}</td>
            <td>{{ e.station_name }}</td>
            <td>{{ e.phone || '—' }}</td>
            <td class="flex gap-2">
              <router-link :to="`/employees/${e.id}/edit`" class="text-primary text-sm">تعديل</router-link>
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
onMounted(async () => { const { data } = await api.get('/employees/'); items.value = data.results || data })
const remove = async (e) => { if (!confirm('حذف؟')) return; await api.delete(`/employees/${e.id}/`); items.value = items.value.filter(x => x.id !== e.id) }
</script>
