<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">إضافة تسوية كوبونات</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </div>
      <div class="border rounded-lg p-4">
        <h3 class="font-medium mb-3">عدد الكوبونات حسب الفئة</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">5 د.ل</label>
            <input v-model.number="form.count_5" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">6 د.ل</label>
            <input v-model.number="form.count_6" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm text-gray-600 mb-1">8 د.ل</label>
            <input v-model.number="form.count_8" type="number" min="0" class="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div class="mt-3 text-lg font-bold text-primary">الإجمالي: {{ calculatedTotal }} د.ل</div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">مرجع التسليم</label>
        <input v-model="form.submission_reference" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
        <textarea v-model="form.notes" rows="3" class="w-full border border-gray-300 rounded-lg px-4 py-2.5"></textarea>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/finance/settlements" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
const router = useRouter()
const form = ref({ station: '', count_5: 0, count_6: 0, count_8: 0, submission_reference: '', notes: '' })
const stations = ref([])
const calculatedTotal = computed(() => (form.value.count_5 * 5 + form.value.count_6 * 6 + form.value.count_8 * 8).toLocaleString())
onMounted(async () => { const { data } = await api.get('/stations/'); stations.value = data.results || data })
const save = async () => {
  await api.post('/voucher-settlements/', form.value)
  router.push('/finance/settlements')
}
</script>
