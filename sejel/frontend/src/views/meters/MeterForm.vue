<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل العداد' : 'إضافة عداد' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">كود العداد</label>
        <input v-model="form.code" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المضخة</label>
        <select v-model="form.machine" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="m in machines" :key="m.id" :value="m.id">{{ m.name }} ({{ m.island_name }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
        <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الخزان</label>
        <select v-model="form.tank" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">بدون</option>
          <option v-for="t in tanks" :key="t.id" :value="t.id">{{ t.name }} ({{ t.fuel_type_name }})</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/meters" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
const router = useRouter(), route = useRoute()
const isEdit = computed(() => !!route.params.id)
const form = ref({ code: '', machine: '', fuel_type: '', tank: '' })
const machines = ref([])
const fuelTypes = ref([])
const tanks = ref([])
onMounted(async () => {
  const [mRes, fRes, tRes] = await Promise.all([api.get('/machines/'), api.get('/fuel-types/'), api.get('/tanks/')])
  machines.value = mRes.data.results || mRes.data
  fuelTypes.value = fRes.data.results || fRes.data
  tanks.value = tRes.data.results || tRes.data
  if (isEdit.value) {
    const { data: d } = await api.get(`/meters/${route.params.id}/`)
    form.value = { code: d.code, machine: d.machine, fuel_type: d.fuel_type, tank: d.tank || '' }
  }
})
const save = async () => {
  const payload = { ...form.value }
  if (!payload.tank) payload.tank = null
  if (isEdit.value) await api.put(`/meters/${route.params.id}/`, payload)
  else await api.post('/meters/', payload)
  router.push('/meters')
}
</script>
