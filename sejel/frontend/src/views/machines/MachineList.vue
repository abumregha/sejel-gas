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
          <tr v-for="m in items" :key="m.id">
            <td class="font-medium">{{ m.name }}</td>
            <td>{{ m.island_name }}</td>
            <td>{{ m.station_name }}</td>
            <td>{{ m.meters_count }}</td>
            <td class="flex gap-2">
              <router-link :to="`/machines/${m.id}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(m)" class="text-red-500 text-sm">حذف</button>
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
onMounted(async () => { const { data } = await api.get('/machines/'); items.value = data.results || data })
const remove = async (m) => { if (!confirm('حذف؟')) return; await api.delete(`/machines/${m.id}/`); items.value = items.value.filter(x => x.id !== m.id) }
</script>
