<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المحطات</h2>
      <router-link to="/stations/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition">
        + إضافة محطة
      </router-link>
    </div>
    <div v-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
    <div v-else-if="!stations.length" class="text-center py-12 text-gray-400">لا توجد محطات</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="s in stations" :key="s.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-primary transition cursor-pointer"
        @click="$router.push(`/stations/${s.id}`)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-lg">{{ s.name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ s.address }}</p>
          </div>
          <span class="badge badge-blue">{{ s.relationship_type }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-500">
          <div>🏝️ {{ s.islands_count }} جزيرة</div>
          <div>🔧 {{ s.meters_count }} عداد</div>
          <div>👥 {{ s.employees_count }} موظف</div>
          <div>🛢️ {{ s.tanks_count }} خزان</div>
        </div>
        <div class="flex gap-2 mt-4">
          <router-link :to="`/stations/${s.id}/edit`" @click.stop
            class="text-sm text-primary hover:underline">تعديل</router-link>
          <button @click.stop="deleteStation(s)" class="text-sm text-red-500 hover:underline">حذف</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'

const stations = ref([])
const loading = ref(true)

const fetchStations = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/stations/')
    stations.value = data.results || data
  } finally { loading.value = false }
}

const deleteStation = async (s) => {
  if (!confirm(`هل أنت متأكد من حذف "${s.name}"؟`)) return
  try {
    await api.delete(`/stations/${s.id}/`)
    stations.value = stations.value.filter(x => x.id !== s.id)
  } catch (e) {
    alert(e.response?.data?.detail || 'لا يمكن حذف المحطة')
  }
}

onMounted(fetchStations)
</script>
