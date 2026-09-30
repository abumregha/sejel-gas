<template>
  <div class="max-w-2xl mx-auto">
    <h2 class="text-xl font-bold mb-6">{{ isEdit ? 'تعديل المستخدم' : 'إضافة مستخدم' }}</h2>
    <form @submit.prevent="save" class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
        <input v-model="form.username" required :disabled="isEdit" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div v-if="!isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
        <input v-model="form.password" type="password" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
          <input v-model="form.first_name" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">اسم العائلة</label>
          <input v-model="form.last_name" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
        <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">الدور</label>
        <select v-model="form.role" required class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="admin">مدير النظام</option>
          <option value="owner">مالك</option>
          <option value="supervisor">مشرف</option>
          <option value="finance">مالي</option>
        </select>
      </div>
      <div v-if="form.role !== 'admin'">
        <label class="block text-sm font-medium text-gray-700 mb-1">المحطة</label>
        <select v-model="form.station" class="w-full border border-gray-300 rounded-lg px-4 py-2.5">
          <option value="">اختر المحطة</option>
          <option v-for="s in stations" :key="s.name" :value="s.name">{{ s.station_name }}</option>
        </select>
      </div>
      <div class="flex gap-3 pt-4">
        <button type="submit" class="bg-primary text-white px-6 py-2.5 rounded-lg">حفظ</button>
        <router-link to="/settings/users" class="px-6 py-2.5 border border-gray-300 rounded-lg">إلغاء</router-link>
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
const form = ref({ username: '', password: '', first_name: '', last_name: '', email: '', role: 'supervisor', station: '' })
const stations = ref([])
onMounted(async () => {
  const { data } = await api.get('/stations/'); stations.value = data.results || data
  if (isEdit.value) {
    const { data: d } = await api.get(`/users/${route.params.id}/`)
    form.value = { username: d.username, password: '', first_name: d.first_name || '', last_name: d.last_name || '', email: d.email || '', role: d.role || 'supervisor', station: d.station_id || '' }
  }
})
const save = async () => {
  const payload = { ...form.value }
  if (!payload.station) payload.station = null
  if (isEdit.value) { delete payload.password; await api.put(`/users/${route.params.id}/`, payload) }
  else await api.post('/users/', payload)
  router.push('/settings/users')
}
</script>
