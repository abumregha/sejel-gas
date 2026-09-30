<template>
  <div class="max-w-3xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold">أسعار الوقود</h2>
        <p class="text-sm text-gray-500 mt-1">تُستخدم لحساب المبيعات المتوقعة عند إقفال المناوبات</p>
      </div>
      <button @click="showAdd = !showAdd" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة سعر</button>
    </div>

    <form v-if="showAdd" @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-4 mb-4">
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-3 text-sm">{{ error }}</div>
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label class="block text-xs text-gray-600 mb-1">نوع الوقود</label>
          <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">اختر</option>
            <option v-for="f in fuelTypes" :key="f.name" :value="f.name">{{ f.fuel_name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">سعر البيع (د.ل/لتر)</label>
          <input v-model.number="form.selling_price" type="number" step="0.001" min="0" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">التكلفة (د.ل/لتر)</label>
          <input v-model.number="form.cost_per_liter" type="number" step="0.001" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-xs text-gray-600 mb-1">تاريخ السريان</label>
          <input v-model="form.effective_date" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <button type="submit" :disabled="saving" class="bg-primary text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
      </div>
      <div class="text-xs text-gray-500 mt-2">
        هامش الربح المحسوب: {{ margin }} د.ل/لتر — عند الحفظ تُلغى أسعار هذا النوع السابقة تلقائياً
      </div>
    </form>

    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>نوع الوقود</th><th>سعر البيع</th><th>التكلفة</th><th>الهامش</th><th>تاريخ السريان</th><th>الحالة</th></tr></thead>
        <tbody>
          <tr v-for="p in items" :key="p.name">
            <td class="font-medium">{{ fuelMap[p.fuel_type] || p.fuel_type }}</td>
            <td class="font-mono font-bold">{{ p.selling_price }} د.ل</td>
            <td class="font-mono">{{ p.cost_per_liter || '—' }}</td>
            <td class="font-mono">{{ p.profit_margin || '—' }}</td>
            <td>{{ p.effective_date }}</td>
            <td>
              <span :class="p.is_active ? 'badge-green' : 'badge-gray'" class="badge">{{ p.is_active ? 'ساري' : 'ملغى' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!items.length" class="text-gray-400 text-center py-8">لا توجد أسعار</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import { friendlyError } from '../../errors'
const items = ref([])
const fuelTypes = ref([])
const fuelMap = ref({})
const showAdd = ref(false)
const saving = ref(false)
const error = ref('')
const today = new Date().toISOString().split('T')[0]
const form = ref({ fuel_type: '', selling_price: '', cost_per_liter: '', effective_date: today })
const margin = computed(() => {
  const s = Number(form.value.selling_price || 0), c = Number(form.value.cost_per_liter || 0)
  return (s && c) ? (s - c).toFixed(3) : '—'
})

const load = async () => {
  const [pRes, fRes] = await Promise.all([api.get('/fuel-prices/'), api.get('/fuel-types/')])
  items.value = pRes.data.results || pRes.data
  fuelTypes.value = fRes.data.results || fRes.data
  fuelMap.value = Object.fromEntries(fuelTypes.value.map(f => [f.name, f.fuel_name]))
}
onMounted(load)

const save = async () => {
  error.value = ''
  saving.value = true
  try {
    const payload = {
      fuel_type: form.value.fuel_type,
      selling_price: form.value.selling_price,
      cost_per_liter: form.value.cost_per_liter || undefined,
      profit_margin: (form.value.cost_per_liter && form.value.selling_price)
        ? Number((form.value.selling_price - form.value.cost_per_liter).toFixed(3))
        : undefined,
      effective_date: form.value.effective_date,
      is_active: 1,
    }
    await api.post('/fuel-prices/', payload)
    // deactivate older prices of the same fuel type so exactly one active price remains
    const older = items.value.filter(p => p.fuel_type === form.value.fuel_type && p.is_active)
    for (const p of older) {
      await api.put(`/fuel-prices/${p.name}/`, { is_active: 0 }).catch(() => {})
    }
    showAdd.value = false
    form.value = { fuel_type: '', selling_price: '', cost_per_liter: '', effective_date: today }
    await load()
  } catch (e) {
    error.value = friendlyError(e)
  } finally { saving.value = false }
}
</script>
