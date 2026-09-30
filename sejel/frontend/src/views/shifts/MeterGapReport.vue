<template>
  <div>
    <h2 class="text-xl font-bold mb-6">فجوات العدادات</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>العداد</th><th>المحطة</th><th>القراءة السابقة</th><th>القراءة الحالية</th><th>الفجوة (لتر)</th></tr></thead>
        <tbody>
          <tr v-for="g in gaps" :key="g.meter_name + '-' + g.idx">
            <td class="font-mono">{{ meterMap[g.meter_name] || g.meter_name }}</td>
            <td>{{ stationMap[meterStationMap[g.meter_name]] || '—' }}</td>
            <td class="font-mono">{{ Number(g.previous_closing).toLocaleString() }}</td>
            <td class="font-mono">{{ Number(g.new_opening).toLocaleString() }}</td>
            <td class="font-mono font-bold" :class="g.gap > 0 ? 'text-red-600' : 'text-green-600'">
              {{ g.gap > 0 ? '+' : '' }}{{ Number(g.gap).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!gaps.length" class="text-gray-400 text-center py-8">لا توجد فجوات</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const gaps = ref([])
const meterMap = ref({})
const stationMap = ref({})
const meterStationMap = ref({})

onMounted(async () => {
  try {
    const [mRes, sRes] = await Promise.all([api.get('/meters/'), api.get('/stations/')])
    const meters = mRes.data.results || mRes.data
    stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))

    for (const m of meters) {
      const { data: rData } = await api.get(`/meter-readings/?meter=${m.name}`)
      const readings = (rData.results || rData).sort((a, b) => a.start_reading - b.start_reading)
      for (let i = 1; i < readings.length; i++) {
        const prevClosing = readings[i - 1].end_reading
        const currOpening = readings[i].start_reading
        if (prevClosing && currOpening) {
          const gap = Number(currOpening) - Number(prevClosing)
          if (gap !== 0) {
            gaps.value.push({
              meter_name: m.name,
              previous_closing: prevClosing,
              new_opening: currOpening,
              gap: gap,
            })
          }
        }
      }
    }
    meterMap.value = Object.fromEntries(meters.map(m => [m.name, m.meter_code]))
    meterStationMap.value = Object.fromEntries(meters.map(m => [m.name, m.station]))
  } catch (e) { console.error(e) }
})
</script>
