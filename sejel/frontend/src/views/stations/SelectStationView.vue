<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
    <div class="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">⛽</span>
        <h1 class="text-xl font-bold text-gray-800">اختر المحطة</h1>
      </div>
      <p class="text-sm text-gray-500 mb-6">اختر المحطة التي تريد إدارتها وعرض بياناتها. كل الوظائف ستعمل ضمن المحطة المحددة.</p>

      <div v-if="stationStore.loading" class="text-center py-10 text-gray-400">جاري تحميل المحطات...</div>
      <div v-else-if="!stations.length" class="text-center py-10 text-gray-500">
        لا توجد محطات متاحة.
        <router-link v-if="auth.isAdmin || auth.role === 'manager'" to="/stations/setup-wizard" class="text-primary hover:underline mr-1">إعداد محطة جديدة</router-link>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          v-for="s in stations"
          :key="s.name"
          @click="select(s.name)"
          class="text-right border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition group"
          :class="stationStore.currentStation === s.name ? 'border-primary bg-primary/5' : 'border-gray-200'"
        >
          <div class="font-bold text-gray-800 group-hover:text-primary">{{ s.station_name || s.name }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ s.address || '—' }}</div>
          <div class="mt-2 flex items-center gap-2 text-xs">
            <span class="px-2 py-0.5 rounded-full" :class="s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
              {{ s.status === 'active' ? 'نشطة' : s.status === 'maintenance' ? 'صيانة' : 'غير نشطة' }}
            </span>
            <span v-if="stationStore.currentStation === s.name" class="text-primary font-semibold">المحددة حالياً</span>
          </div>
        </button>
      </div>

      <div class="mt-6 flex items-center justify-between text-sm">
        <span class="text-gray-400">{{ auth.user?.first_name || auth.user?.username }}</span>
        <button @click="logout" class="text-gray-500 hover:text-red-600">تسجيل خروج</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStationStore } from '../../stores/station'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const stationStore = useStationStore()
const auth = useAuthStore()

const stations = computed(() => stationStore.stations)

function select(id) {
  stationStore.setCurrent(id)
  const redirect = route.query.redirect && String(route.query.redirect).startsWith('/') ? String(route.query.redirect) : '/'
  router.replace(redirect)
}

async function logout() {
  await auth.logout()
  stationStore.clear()
  router.push('/login/')
}

onMounted(async () => {
  if (!stationStore.loaded) await stationStore.loadStations()
  // If bound or already selected, no need to stay here
  if (stationStore.currentStation) {
    const redirect = route.query.redirect && String(route.query.redirect).startsWith('/') ? String(route.query.redirect) : '/'
    router.replace(redirect)
  }
})
</script>
