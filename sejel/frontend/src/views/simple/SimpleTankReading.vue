<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">قراءة خزان</h2>

    <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
      <label class="block">
        <span class="text-xs text-gray-500">الخزان</span>
        <select v-model="tank" data-testid="simple-tank-select"
          class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-base bg-white">
          <option value="" disabled>اختر الخزان…</option>
          <option v-for="t in tanks" :key="t.name" :value="t.name">
            {{ t.tank_name || t.name }} — {{ t.fuel_type_name || t.fuel_type }}
          </option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-gray-500">القراءة (لتر)</span>
        <input v-model.number="reading" data-testid="simple-tank-reading" type="number" min="0" step="0.001" inputmode="decimal"
          class="mt-1 w-full min-h-[52px] border border-gray-300 rounded-xl px-4 py-2.5 text-lg font-bold tabular-nums" />
      </label>
    </section>

    <button data-testid="simple-save-tank" @click="save" :disabled="saving"
      class="w-full min-h-[60px] rounded-xl bg-blue-600 text-white font-bold text-lg disabled:opacity-50">
      {{ saving ? 'جاري الحفظ…' : 'حفظ القراءة' }}
    </button>
  </div>
</template>

<script setup>
// Simple Mode tank dip — tank + one number + save. Reading type is fixed to
// the existing "daily" value; recorded_at is stamped at save time, exactly as
// the Manager Mode list does.
import { ref, onMounted } from 'vue'
import api from '../../api'
import friendlyError from '../../errors'
import { useStationStore } from '../../stores/station'
import { useToast } from '../../composables/useToast'

const stationStore = useStationStore()
const { show } = useToast()

const tanks = ref([])
const tank = ref('')
const reading = ref('')
const saving = ref(false)

async function load() {
  if (!stationStore.currentStation) return
  try {
    const { data } = await api.get('/tanks/')
    tanks.value = data.results || data || []
    if (tanks.value.length === 1) tank.value = tanks.value[0].name
  } catch (e) {
    show(friendlyError(e), 'error')
  }
}

async function save() {
  if (saving.value) return
  if (!tank.value) { show('اختر الخزان أولاً', 'error'); return }
  if (reading.value === '' || !Number.isFinite(Number(reading.value)) || Number(reading.value) < 0) {
    show('أدخل القراءة برقم صحيح غير سالب', 'error')
    return
  }
  saving.value = true
  try {
    // backend fields: reading_level (Float, required) + recorded_at (Datetime) —
    // same contract as TankReadingList.vue
    await api.post('/tank-readings/', {
      tank: tank.value,
      reading_level: Number(reading.value),
      reading_type: 'daily',
      recorded_at: new Date().toISOString(),
    })
    show('تم حفظ قراءة الخزان بنجاح')
    reading.value = ''
  } catch (e) {
    show(friendlyError(e), 'error')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
