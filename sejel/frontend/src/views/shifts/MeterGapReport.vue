<template>
  <div>
    <h2 class="text-xl font-bold mb-6">فجوات العدادات</h2>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>العداد</th><th>المحطة</th><th>القراءة السابقة</th><th>القراءة الحالية</th><th>الفجوة (لتر)</th></tr></thead>
        <tbody>
          <tr v-for="g in gaps" :key="g.meter_id">
            <td class="font-mono">{{ g.meter_code }}</td>
            <td>{{ g.station_name }}</td>
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
onMounted(async () => {
  // Use the meter readings to calculate gaps
  try {
    const { data } = await api.get('/meters/')
    const meters = data.results || data
    // For each meter, find consecutive readings and calculate gaps
    for (const m of meters) {
      const { data: rData } = await api.get(`/meter-readings/?meter=${m.id}`)
      const readings = (rData.results || rData).sort((a, b) => a.start_reading - b.start_reading)
      for (let i = 1; i < readings.length; i++) {
        const prevClosing = readings[i - 1].end_reading
        const currOpening = readings[i].start_reading
        if (prevClosing && currOpening) {
          const gap = Number(currOpening) - Number(prevClosing)
          if (gap !== 0) {
            gaps.value.push({
              meter_id: m.id,
              meter_code: m.code,
              station_name: m.machine_name,
              previous_closing: prevClosing,
              new_opening: currOpening,
              gap: gap,
            })
          }
        }
      }
    }
  } catch (e) { console.error(e) }
})
</script>
