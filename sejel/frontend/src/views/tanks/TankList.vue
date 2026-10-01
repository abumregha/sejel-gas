<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">الخزانات</h2>
      <router-link to="/tanks/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة خزان</router-link>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in items" :key="t.name"
        class="bg-white rounded-xl shadow-sm border p-4 cursor-pointer hover:border-primary transition"
        @click="$router.push(`/tanks/${t.name}`)">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-bold">{{ t.tank_name }}</h3>
            <p class="text-sm text-gray-500">{{ fuelMap[t.fuel_type] || t.fuel_type }} — {{ stationMap[t.station] || t.station }}</p>
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
            <span>السعة: {{ Number(t.capacity).toLocaleString('en-US') }} لتر</span>
            <span>الحالي: {{ Number(t.current_level || 0).toLocaleString('en-US') }} لتر</span>
          </div>
        </div>
        <div class="flex gap-2 mt-3">
          <router-link :to="`/tanks/${t.name}/edit`" @click.stop class="text-primary text-sm">تعديل</router-link>
          <button @click.stop="remove(t)" class="text-red-500 text-sm">حذف</button>
        </div>
      </div>
    </div>
    <ConfirmDialog ref="dlg" />
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
const items = ref([])
const fuelMap = ref({})
const stationMap = ref({})
const dlg = ref(null)
onMounted(async () => {
  const [tRes, fRes, sRes] = await Promise.all([api.get('/tanks/'), api.get('/fuel-types/'), api.get('/stations/')])
  items.value = tRes.data.results || tRes.data
  fuelMap.value = Object.fromEntries((fRes.data.results || fRes.data).map(f => [f.name, f.fuel_name]))
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
})
const remove = async (t) => {
  const ok = await dlg.value.open({ title: 'حذف الخزان', message: `هل أنت متأكد من حذف "${t.tank_name}"؟`, confirmText: 'حذف' })
  if (!ok) return
  await api.delete(`/tanks/${t.name}/`)
  items.value = items.value.filter(x => x.name !== t.name)
}
const barColor = (pct) => pct <= 15 ? '#ef4444' : pct <= 30 ? '#f59e0b' : '#22c55e'
const levelColor = (pct) => pct <= 15 ? 'text-red-600' : pct <= 30 ? 'text-yellow-600' : 'text-green-600'
</script>
