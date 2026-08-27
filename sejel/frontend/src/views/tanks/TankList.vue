<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الخزانات</h2>
      <router-link to="/tanks/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة خزان</router-link>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in items" :key="t.id"
        class="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:border-primary transition"
        @click="$router.push(`/tanks/${t.id}`)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold">{{ t.name }}</h3>
            <p class="text-sm text-gray-500">{{ t.fuel_type_name }} — {{ t.station_name }}</p>
          </div>
          <div class="text-lg font-bold" :class="levelColor(t.level_percent)">
            {{ t.level_percent }}%
          </div>
        </div>
        <div class="mt-3">
          <div class="tank-bar">
            <div class="tank-bar-fill" :style="{ width: t.level_percent + '%', background: barColor(t.level_percent) }"></div>
          </div>
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>ال.capacity: {{ Number(t.capacity).toLocaleString() }} لتر</span>
            <span>الحالي: {{ Number(t.current_level || 0).toLocaleString() }} لتر</span>
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <router-link :to="`/tanks/${t.id}/edit`" @click.stop class="text-primary text-sm">تعديل</router-link>
          <button @click.stop="remove(t)" class="text-red-500 text-sm">حذف</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/tanks/'); items.value = data.results || data })
const remove = async (t) => { if (!confirm('حذف؟')) return; await api.delete(`/tanks/${t.id}/`); items.value = items.value.filter(x => x.id !== t.id) }
const barColor = (pct) => pct <= 15 ? '#ef4444' : pct <= 30 ? '#f59e0b' : '#22c55e'
const levelColor = (pct) => pct <= 15 ? 'text-red-600' : pct <= 30 ? 'text-yellow-600' : 'text-green-600'
</script>
