<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المحطة' : 'إضافة محطة' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المحطة</label>
        <input v-model="form.station_name" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
        <input v-model="form.address" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">وقت إقفال اليوم</label>
        <input v-model="form.day_close_time" type="time" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        <p class="text-xs text-gray-500 mt-1">موعد بدء دورة قراءات اليوم لهذه المحطة (مثال: 11:00 ← 11:00).</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نوع العلاقة</label>
        <select v-model="form.relationship_type" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="owned">ملكية</option>
          <option value="rented">إيجار</option>
          <option value="agency">وكالة</option>
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
import { useToast } from '../../composables/useToast'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
// Global toast: a per-component toast is unmounted by the redirect below and
// the operator never sees the confirmation.
const { show } = useToast()
const form = ref({ station_name: '', address: '', relationship_type: 'owned', day_close_time: '' })

onMounted(async () => {
  if (isEdit.value) {
    const { data } = await api.get(`/stations/${route.params.id}/`)
    form.value = {
      station_name: data.station_name,
      address: data.address,
      relationship_type: data.relationship_type,
      // Frappe returns a Time as HH:MM:SS; the <input type="time"> wants HH:MM
      day_close_time: (data.day_close_time || '').slice(0, 5),
    }
  }
})

const save = async () => {
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/stations/${route.params.id}/`, form.value)
    } else {
      const payload = { ...form.value }
      if (!payload.day_close_time) delete payload.day_close_time
      await api.post('/stations/', payload)
    }
    show('تم حفظ بيانات المحطة بنجاح')
    setTimeout(() => router.push('/stations'), 1200)
  } catch (e) {
    show('تعذر حفظ بيانات المحطة. راجع الحقول وحاول مرة أخرى.', 'error', 5000)
  } finally { saving.value = false }
}
</script>
