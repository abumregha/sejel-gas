<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold">إدارة المستخدمين</h2>
      <router-link to="/settings/users/create" class="bg-primary text-white px-4 py-2 rounded-xl text-sm">+ إضافة مستخدم</router-link>
    </div>
    <div class="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table class="data-table">
        <thead><tr><th>المستخدم</th><th>الاسم</th><th>الدور</th><th>المحطة</th><th>إجراءات</th></tr></thead>
        <tbody>
          <tr v-for="u in items" :key="u.id">
            <td class="font-mono">{{ u.username }}</td>
            <td>{{ u.first_name }} {{ u.last_name }}</td>
            <td>
              <span :class="roleBadge(u.role)" class="badge">{{ roleLabel(u.role) }}</span>
            </td>
            <td>{{ u.station_name || 'الكل' }}</td>
            <td>
              <router-link :to="`/settings/users/${u.id}/edit`" class="text-primary text-sm">تعديل</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import api from '../../api'
const items = ref([])
onMounted(async () => { const { data } = await api.get('/users/'); items.value = data.results || data })
const roleLabel = (r) => ({ admin: 'مدير النظام', owner: 'مالك', supervisor: 'مشرف', finance: 'مالي' }[r] || r)
const roleBadge = (r) => ({ admin: 'badge-red', owner: 'badge-blue', supervisor: 'badge-green', finance: 'badge-yellow' }[r] || 'badge-gray')
</script>
