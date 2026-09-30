<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">إدارة المستخدمين</h2>
      <router-link to="/settings/users/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مستخدم</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المستخدم</th><th>الاسم</th><th>الدور</th><th>المحطة</th><th>الحالة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="u in items" :key="u.name">
            <td class="font-mono">{{ u.username }}</td>
            <td>{{ u.first_name }} {{ u.last_name }}</td>
            <td>
              <span :class="roleBadge(u.role)" class="badge">{{ roleLabel(u.role) }}</span>
            </td>
            <td>{{ stationName(u.sejel_station) }}</td>
            <td>
              <span :class="u.enabled === 0 ? 'badge-gray' : 'badge-green'" class="badge">
                {{ u.enabled === 0 ? 'معطّل' : 'نشط' }}
              </span>
            </td>
            <td class="space-x-2 whitespace-nowrap">
              <router-link :to="`/settings/users/${u.name}/edit`" class="text-primary text-sm">تعديل</router-link>
              <button @click="resetPassword(u)" class="text-blue-600 text-sm hover:underline">كلمة مرور جديدة</button>
              <button v-if="u.enabled === 0" @click="setEnabled(u, true)" class="text-green-600 text-sm hover:underline">تفعيل</button>
              <button v-else @click="setEnabled(u, false)" class="text-red-500 text-sm hover:underline">تعطيل</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- password modal -->
    <div v-if="pwTarget" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="pwTarget = null">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm space-y-4" dir="rtl">
        <h3 class="font-bold">كلمة مرور جديدة — {{ pwTarget.username }}</h3>
        <p class="text-xs text-gray-500">أعطِ كلمة المرور الجديدة للموظف مباشرة. الحد الأدنى 6 أحرف.</p>
        <input v-model="newPassword" type="text" class="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="كلمة المرور الجديدة" />
        <p v-if="pwError" class="text-xs text-red-600">{{ pwError }}</p>
        <div class="flex gap-2 justify-end">
          <button @click="pwTarget = null" class="px-4 py-2 border border-gray-300 rounded-lg text-sm">إلغاء</button>
          <button @click="savePassword" :disabled="saving" class="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
            {{ saving ? '...' : 'حفظ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
const stations = ref({})
const pwTarget = ref(null)
const newPassword = ref('')
const pwError = ref('')
const saving = ref(false)

const roleLabel = (r) => ({ admin: 'مدير النظام', manager: 'مالك/مدير', supervisor: 'مشرف', finance: 'مالي' }[r] || r || '—')
const roleBadge = (r) => ({ admin: 'badge-red', manager: 'badge-blue', supervisor: 'badge-green', finance: 'badge-yellow' }[r] || 'badge-gray')
const stationName = (id) => stations.value[id] || 'الكل'

const load = async () => {
  const [{ data }, sRes] = await Promise.all([api.get('/users/'), api.get('/stations/')])
  items.value = data.results || data
  stations.value = Object.fromEntries((sRes.data.results || sRes.data).map(s => [s.name, s.station_name || s.name]))
}
onMounted(load)

const resetPassword = (u) => {
  pwTarget.value = u
  newPassword.value = ''
  pwError.value = ''
}
const savePassword = async () => {
  saving.value = true
  pwError.value = ''
  try {
    await api.post('/auth/set-user-password/', { username: pwTarget.value.username, new_password: newPassword.value })
    pwTarget.value = null
  } catch (e) {
    const raw = e.response?.data?.message || e.response?.data?.exc || e.message
    pwError.value = typeof raw === 'string' ? raw.replace(/<[^>]+>/g, '').split('\n')[0].slice(0, 140) : 'خطأ'
  } finally { saving.value = false }
}
const setEnabled = async (u, enabled) => {
  try {
    await api.post('/auth/set-user-password/', { username: u.username, enabled })
    await load()
  } catch (e) { alert('تعذر تنفيذ العملية') }
}
</script>
