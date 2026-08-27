<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الجزر</h2>
      <router-link to="/islands/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة جزيرة</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>المحطة</th><th>المضخات</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="i in items" :key="i.id">
            <td class="font-medium">{{ i.name }}</td>
            <td>{{ i.station_name }}</td>
            <td>{{ i.machines_count }}</td>
            <td class="flex gap-2">
              <router-link :to="`/islands/${i.id}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="remove(i)" class="text-red-500 text-sm">حذف</button>
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
onMounted(async () => { const { data } = await api.get('/islands/'); items.value = data.results || data })
const remove = async (i) => { if (!confirm('حذف؟')) return; await api.delete(`/islands/${i.id}/`); items.value = items.value.filter(x => x.id !== i.id) }
</script>
