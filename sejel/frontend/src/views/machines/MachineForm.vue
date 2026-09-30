<template>
  <div class="max-w-2xl mx-auto">
    <Toast ref="toast" />
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المضخة' : 'إضافة مضخة' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الجزيرة</label>
        <select v-model="form.island" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="i in islands" :key="i.name" :value="i.name">{{ i.island_name }} ({{ stationMap[i.station] || i.station }})</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المضخة</label>
        <input v-model="form.machine_name" placeholder="اتركه فارغاً ليشيء تلقائياً (مضخة N)"
          class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <p class="text-xs text-gray-400">الرقم يُعيَّن تلقائياً بعد آخر مضخة في الجزيرة</p>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving" class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link :to="backTo" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'
import Toast from '../../components/Toast.vue'
import { useAuthStore } from '../../stores/auth'

const router = useRouter(), route = useRoute()
const auth = useAuthStore()
const isOwner = computed(() => auth.isOwner)
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const toast = ref(null)
const form = ref({ machine_name: '', island: '' })
const islands = ref([])
const stationMap = ref({})

const backTo = computed(() => {
  const isl = islands.value.find(i => i.name === form.value.island)
  return isl?.station ? `/stations/${isl.station}` : '/machines'
})

onMounted(async () => {
  const params = route.query.island ? { island: route.query.island }
    : route.query.station ? { station: route.query.station }
    : isOwner.value ? {} : { station: auth.stationId }
  const [iRes, sRes] = await Promise.all([api.get('/islands/', { params }), api.get('/stations/')])
  islands.value = iRes.data.results || iRes.data
  stationMap.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name]))
  if (isEdit.value) {
    const { data: d } = await api.get(`/machines/${route.params.id}/`)
    form.value = { machine_name: d.machine_name, island: d.island }
  }
})

const save = async () => {
  saving.value = true
  try {
    const payload = { machine_name: form.value.machine_name || null, island: form.value.island }
    if (isEdit.value) await api.put(`/machines/${route.params.id}/`, payload)
    else await api.post('/machines/', payload)
    toast.value.show('تم الحفظ بنجاح')
    setTimeout(() => router.push(backTo.value), 800)
  } catch (e) {
    const msg = e.response?.data?.message || e.response?.data?.exc || 'خطأ في الحفظ'
    toast.value.show(typeof msg === 'string' ? msg.replace(/<[^>]+>/g, '').split('\n')[0].substring(0, 200) : 'خطأ في الحفظ', 'error')
  } finally { saving.value = false }
}
</script>
