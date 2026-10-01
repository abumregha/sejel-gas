<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <router-link to="/stations" class="text-sm text-primary hover:underline mb-2 block">← المحطات</router-link>
        <h2 class="text-xl font-bold">{{ station?.station_name }}</h2>
      </div>
      <div class="flex items-center gap-2">
        <a :href="`/api/export/?view=station&name=${id}`" title="تصدير بيانات المحطة إلى Excel"
          class="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 flex items-center gap-1.5">
          ⬇ تصدير Excel
        </a>
        <router-link :to="`/stations/${id}/edit`" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">تعديل</router-link>
      </div>
    </div>
    <div v-if="station" class="space-y-6">
      <!-- Info -->
      <div class="bg-white rounded-xl shadow-sm border p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span class="text-gray-500">العنوان:</span> {{ station.address || '—' }}</div>
          <div><span class="text-gray-500">نوع العلاقة:</span> {{ label(RELATIONSHIP, station.relationship_type) }}</div>
          <div><span class="text-gray-500">الحالة:</span> {{ label(STATION_STATUS, station.status) }}</div>
        </div>
      </div>

      <!-- Tabs (Q2/Q8: infrastructure managed here instead of standalone pages) -->
      <div class="flex gap-1 border-b border-gray-200 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
          class="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition"
          :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'">
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <!-- Islands -->
      <div v-if="activeTab === 'islands'" class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">الجزر</h3>
          <router-link :to="`/islands/create?station=${id}`" class="text-sm text-primary">+ إضافة جزيرة</router-link>
        </div>
        <div v-if="islands.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="island in islands" :key="island.name"
            class="border rounded-lg p-3 hover:border-primary transition cursor-pointer"
            @click="$router.push(`/machines?island=${island.name}`)">
            <div class="flex items-center justify-between">
              <div class="font-medium">{{ island.island_name || island.name }}</div>
              <span class="badge badge-gray text-xs">{{ label(ISLAND_STATUS, island.status) }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">رقم {{ island.number }} — {{ machines.filter(m => m.island === island.name).length }} مضخة</div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا توجد جزر</div>
      </div>

      <!-- Machines -->
      <div v-if="activeTab === 'machines'" class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">المضخات</h3>
          <router-link :to="`/machines/create?island=${islands[0]?.name || ''}&station=${id}`" class="text-sm text-primary">+ إضافة مضخة</router-link>
        </div>
        <div v-if="machines.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="m in machines" :key="m.name" class="border rounded-lg p-3">
            <div class="font-medium">{{ m.machine_name || m.name }}</div>
            <div class="text-xs text-gray-500 mt-1">
              {{ islandMap[m.island] || m.island }} — {{ meters.filter(x => x.machine === m.name).length }} عداد
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا توجد مضخات</div>
      </div>

      <!-- Meters -->
      <div v-if="activeTab === 'meters'" class="bg-white rounded-xl shadow-sm border p-4 overflow-x-auto">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">العدادات</h3>
          <router-link :to="`/meters/create?station=${id}`" class="text-sm text-primary">+ إضافة عداد</router-link>
        </div>
        <table v-if="meters.length" class="data-table">
          <thead><tr><th>الكود</th><th>نوع الوقود</th><th>المضخة</th><th>الخزان</th><th>القراءة الحالية</th><th>الحالة</th></tr></thead>
          <tbody>
            <tr v-for="m in meters" :key="m.name">
              <td class="font-mono font-medium">{{ m.meter_code }}</td>
              <td>{{ fuelMap[m.fuel_type] || m.fuel_type }}</td>
              <td>{{ machineMap[m.machine] || m.machine }}</td>
              <td>{{ tankMap[m.tank] || '—' }}</td>
              <td>{{ Number(m.current_reading || 0).toLocaleString('en-US') }}</td>
              <td><span class="badge badge-gray">{{ label(METER_STATUS, m.status) }}</span></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="text-gray-400 text-sm">لا توجد عدادات</div>
      </div>

      <!-- Tanks -->
      <div v-if="activeTab === 'tanks'" class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">الخزانات</h3>
          <router-link :to="`/tanks/create?station=${id}`" class="text-sm text-primary">+ إضافة خزان</router-link>
        </div>
        <div v-if="tanks.length" class="space-y-2">
          <div v-for="tank in tanks" :key="tank.name"
            class="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div class="font-medium">{{ tank.tank_name || tank.name }}</div>
              <div class="text-xs text-gray-500">{{ fuelMap[tank.fuel_type] || tank.fuel_type }} — {{ Number(tank.capacity).toLocaleString('en-US') }} لتر</div>
            </div>
            <div class="w-24">
              <div class="tank-bar">
                <div class="tank-bar-fill" :style="{ width: levelPercent(tank) + '%', background: tankColor(levelPercent(tank)) }"></div>
              </div>
              <div class="text-xs text-center mt-1">{{ levelPercent(tank) }}%</div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا توجد خزانات</div>
      </div>

      <!-- Employees -->
      <div v-if="activeTab === 'employees'" class="bg-white rounded-xl shadow-sm border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold">الموظفون</h3>
          <router-link :to="`/employees/create?station=${id}`" class="text-sm text-primary">+ إضافة موظف</router-link>
        </div>
        <div v-if="employees.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="e in employees" :key="e.name" class="border rounded-lg p-3">
            <div class="font-medium">{{ e.employee_name }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ e.phone || '—' }} — {{ label(EMPLOYEE_STATUS, e.status) }}</div>
          </div>
        </div>
        <div v-else class="text-gray-400 text-sm">لا يوجد موظفون</div>
      </div>
    </div>
    <div v-else class="text-center py-12 text-gray-400">جاري التحميل...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import { label, STATION_STATUS, RELATIONSHIP, ISLAND_STATUS, METER_STATUS, EMPLOYEE_STATUS } from '../../utils/labels'

const route = useRoute()
const id = route.params.id
const station = ref(null)
const islands = ref([])
const machines = ref([])
const meters = ref([])
const tanks = ref([])
const employees = ref([])
const fuelMap = ref({})
const islandMap = ref({})
const machineMap = ref({})
const tankMap = ref({})
const activeTab = ref('islands')

const tabs = computed(() => [
  { key: 'islands', label: 'الجزر', count: islands.value.length },
  { key: 'machines', label: 'المضخات', count: machines.value.length },
  { key: 'meters', label: 'العدادات', count: meters.value.length },
  { key: 'tanks', label: 'الخزانات', count: tanks.value.length },
  { key: 'employees', label: 'الموظفون', count: employees.value.length },
])

const levelPercent = (tank) => Math.round((Number(tank.current_level || 0) / Math.max(1, Number(tank.capacity || 1))) * 100)
const tankColor = (pct) => {
  if (pct <= 15) return '#ef4444'
  if (pct <= 30) return '#f59e0b'
  return '#22c55e'
}

onMounted(async () => {
  const [sRes, iRes, mRes, mtRes, tRes, eRes, fRes] = await Promise.all([
    api.get(`/stations/${id}/`),
    api.get('/islands/', { params: { station: id } }),
    api.get('/machines/', { params: { station: id } }),
    api.get('/meters/'),
    api.get('/tanks/', { params: { station: id } }),
    api.get('/employees/', { params: { station: id } }),
    api.get('/fuel-types/'),
  ])
  station.value = sRes.data
  islands.value = iRes.data.results || iRes.data
  machines.value = mRes.data.results || mRes.data
  // Meter has no station field — filter by this station's machines (with their island names)
  const allMeters = mtRes.data.results || mtRes.data
  const islandNames = islands.value.map(i => i.name)
  meters.value = allMeters.filter(m => {
    const mach = machines.value.find(x => x.name === m.machine)
    return mach && islandNames.includes(mach.island)
  })
  tanks.value = tRes.data.results || tRes.data
  employees.value = eRes.data.results || eRes.data
  const fuels = fRes.data.results || fRes.data
  fuelMap.value = Object.fromEntries(fuels.map(f => [f.name, f.fuel_name]))
  islandMap.value = Object.fromEntries(islands.value.map(i => [i.name, i.island_name || i.name]))
  machineMap.value = Object.fromEntries(machines.value.map(m => [m.name, m.machine_name || m.name]))
  tankMap.value = Object.fromEntries(tanks.value.map(t => [t.name, t.tank_name || t.name]))
})
</script>
