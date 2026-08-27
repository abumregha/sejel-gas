<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المحطة' : 'إضافة محطة' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المحطة</label>
        <input v-model="form.name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
        <input v-model="form.address" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع العلاقة</label>
        <select v-model="form.relationship_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="owned">ملكية</option>
          <option value="agency">وكالة</option>
          <option value="franchise">تنازل</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" :disabled="saving"
          class="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
        <router-link to="/stations" class="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">إلغاء</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const form = ref({ name: '', address: '', relationship_type: 'owned' })

onMounted(async () => {
  if (isEdit.value) {
    const { data } = await api.get(`/stations/${route.params.id}/`)
    form.value = { name: data.name, address: data.address, relationship_type: data.relationship_type }
  }
})

const save = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/stations/${route.params.id}/`, form.value)
    } else {
      await api.post('/stations/', form.value)
    }
    router.push('/stations')
  } catch (e) {
    alert('خطأ في الحفظ: ' + JSON.stringify(e.response?.data || e.message))
  } finally { saving.value = false }
}
</script>
