<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">المحطات</h2>
      <div class="flex gap-2">
        <router-link to="/stations/setup-wizard" class="bg-primary text-white px-4 py-2 rounded-xl text-sm hover:bg-primary/90 transition">
          ⚡ إعداد محطة جديدة
        </router-link>
        <router-link to="/stations/create" class="px-4 py-2 rounded-xl text-sm border border-gray-300 hover:bg-gray-50 transition">
          + إضافة بسيطة
        </router-link>
      </div>
    </div>
    <div v-if="loading" class="text-center py-12 text-gray-400">جاري التحميل...</div>
    <div v-else-if="!stations.length" class="text-center py-12 text-gray-400">
      لا توجد محطات
      <div class="mt-4">
        <router-link to="/stations/setup-wizard" class="text-primary hover:underline">ابدأ بإعداد محطتك الأولى ←</router-link>
      </div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="s in stations" :key="s.name"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-primary transition cursor-pointer"
        @click="$router.push(`/stations/${s.name}`)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold text-lg">{{ s.station_name }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ s.address }}</p>
          </div>
          <span class="badge badge-blue">{{ label(RELATIONSHIP, s.relationship_type) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-4 text-sm text-gray-500">
          <div>🏝️ {{ s.islands_count }} جزيرة</div>
          <div>🔧 {{ s.meters_count }} عداد</div>
          <div>👥 {{ s.employees_count }} موظف</div>
          <div>🛢️ {{ s.tanks_count }} خزان</div>
        </div>
        <div class="flex gap-2 mt-4">
          <router-link :to="`/stations/${s.name}/edit`" @click.stop
            class="text-sm text-primary hover:underline">تعديل</router-link>
          <button @click.stop="deleteStation(s)" class="text-sm text-red-500 hover:underline">حذف</button>
        </div>
      </div>
    </div>
    <ConfirmDialog ref="dlg" />
    <Toast ref="toast" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import Toast from '../../components/Toast.vue'
import { label, RELATIONSHIP } from '../../utils/labels'

const stations = ref([])
const loading = ref(true)
const dlg = ref(null)
const toast = ref(null)

const fetchStations = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/stations/')
    stations.value = data.results || data
  } finally { loading.value = false }
}

const deleteStation = async (s) => {
  const ok = await dlg.value.open({
    title: 'حذف المحطة',
    message: `هل أنت متأكد من حذف "${s.station_name}"؟ لا يمكن التراجع عن هذه العملية.`,
    confirmText: 'حذف',
  })
  if (!ok) return
  try {
    await api.delete(`/stations/${s.name}/`)
    stations.value = stations.value.filter(x => x.name !== s.name)
    toast.value.show('تم حذف المحطة')
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.exc || 'لا يمكن حذف المحطة'
    toast.value.show(typeof msg === 'string' ? msg.replace(/<[^>]+>/g, '').split('\n')[0].substring(0, 200) : 'لا يمكن حذف المحطة', 'error')
  }
}

onMounted(fetchStations)
</script>
