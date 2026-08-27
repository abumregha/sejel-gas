<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل الخزان' : 'إضافة خزان' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم الخزان</label>
        <input v-model="form.name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع الوقود</label>
        <select v-model="form.fuel_type" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="f in fuelTypes" :key="f.id" :value="f.id">{{ f.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">السعة (لتر)</label>
        <input v-model="form.capacity" type="number" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ال_level الحالي</label>
        <input v-model="form.current_level" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/tanks" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const form = ref({ name: '', station: '', fuel_type: '', capacity: '', current_level: '' })
const stations = ref([])
const fuelTypes = ref([])
onMounted(async () => {
  const [sRes, fRes] = await Promise.all([api.get('/stations/'), api.get('/fuel-types/')])
  stations.value = sRes.data.results || sRes.data
  fuelTypes.value = fRes.data.results || fRes.data
  if (isEdit.value) {
    const { data: d } = await api.get(`/tanks/${route.params.id}/`)
    form.value = { name: d.name, station: d.station, fuel_type: d.fuel_type, capacity: d.capacity, current_level: d.current_level }
  }
})
const save = async () => {
  if (isEdit.value) await api.put(`/tanks/${route.params.id}/`, form.value)
  else await api.post('/tanks/', form.value)
  router.push('/tanks')
}
</script>
