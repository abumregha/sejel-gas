<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">العدادات</h2>
      <router-link to="/meters/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة عداد</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>الكود</th><th>النوع</th><th>المضخة</th><th>الجزيرة</th><th>الخزان</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="m in items" :key="m.id">
            <td class="font-mono font-medium">{{ m.code }}</td>
            <td>{{ m.fuel_type_name }}</td>
            <td>{{ m.machine_name }}</td>
            <td>{{ m.island_name }}</td>
            <td>{{ m.tank_name || '—' }}</td>
            <td class="flex gap-2">
              <router-link :to="`/meters/${m.id}/edit`" class="text-primary text-sm">تعديل</router-link>
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
onMounted(async () => { const { data } = await api.get('/meters/'); items.value = data.results || data })
const remove = async (m) => { if (!confirm('حذف؟')) return; await api.delete(`/meters/${m.id}/`); items.value = items.value.filter(x => x.id !== m.id) }
</script>
