<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <router-link to="/stations" class="text-sm text-primary hover:underline mb-2 block">← المحطات</router-link>
        <h2 class="text-xl font-bold">{{ station?.name }}</h2>
      </div>
      <router-link :to="`/stations/${id}/edit`" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">تعديل</router-link>
    </div>
    <div v-if="station" class="space-y-6">
      <!-- Info -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">العنوان:</span> {{ station.address || '—' }}</div>
          <div><span class="text-gray-500">نوع العلاقة:</span> {{ station.relationship_type }}</div>
        </div>
      </div>
      <!-- Islands -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">الجزر</h3>
          <router-link to="/islands/create" class="text-sm text-primary">+ إضافة</router-link>
        </div>
        <div v-if="station.islands?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="island in station.islands" :key="island.id"
            class="border rounded-lg p-3 hover:border-primary transition">
            <div class="font-medium">{{ island.name }}</div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا توجد جزر</div>
      </div>
      <!-- Tanks -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">الخزانات</h3>
          <router-link to="/tanks/create" class="text-sm text-primary">+ إضافة</router-link>
        </div>
        <div v-if="station.tanks?.length" class="space-y-2">
          <div v-for="tank in station.tanks" :key="tank.id"
            class="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div class="font-medium">{{ tank.name }}</div>
              <div class="text-xs text-gray-500">{{ tank.fuel_type_name }} — {{ tank.capacity }} لتر</div>
            </div>
            <div class="w-24">
              <div class="tank-bar">
                <div class="tank-bar-fill" :style="{ width: tank.level_percent + '%', background: tankColor(tank.level_percent) }"></div>
              </div>
              <div class="text-xs text-center mt-1">{{ tank.level_percent }}%</div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا توجد خزانات</div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'

const route = useRoute()
const id = route.params.id
const station = ref(null)

const tankColor = (pct) => {
  if (pct <= 15) return '#ef4444'
  if (pct <= 30) return '#f59e0b'
  return '#22c55e'
}

onMounted(async () => {
  const { data } = await api.get(`/stations/${id}/`)
  station.value = data
})
</script>
