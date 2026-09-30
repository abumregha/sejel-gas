<script setup>
// Quick actions (prompt §18): role-gated — an action not authorized for the
// current role is simply not rendered. Deep-links into existing routes.
import { useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  stationId: { type: String, default: null },
})

const router = useRouter()
const auth = useAuthStore()

// can(roles): admin sees everything (same logic as the sidebar's can()).
const can = (roles) => !roles || auth.isAdmin || roles.includes(auth.role)

const actions = [
  { label: 'قراءات المضخات', icon: 'gauge', to: '/readings' },
  { label: 'قراءة عداد', icon: 'meter', to: '/shifts', roles: ['supervisor', 'manager'] },
  { label: 'إقفال مناوبة', icon: 'clock', to: '/shifts', roles: ['supervisor', 'manager'] },
  { label: 'قراءة خزان', icon: 'tank', to: '/inventory/tank-readings', roles: ['supervisor', 'manager'] },
  { label: 'تسجيل شحنة', icon: 'island', to: '/inventory/deliveries/create', roles: ['supervisor', 'manager'] },
  { label: 'إضافة تحصيل', icon: 'banknote', to: '/finance/income', roles: ['finance', 'manager'] },
  { label: 'إضافة مصروف', icon: 'wallet', to: '/finance/expenses/create', roles: ['finance', 'manager'] },
  { label: 'مطابقة مناوبة', icon: 'scale', to: '/finance/reconciliations', roles: ['finance', 'manager'] },
  { label: 'عرض التقارير', icon: 'layers', to: '/reports/daily', roles: ['finance', 'manager'] },
  { label: 'إدارة المحطات', icon: 'station', to: '/stations', roles: ['manager'] },
]
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 class="font-bold flex items-center gap-2 mb-3"><Icon name="arrowright" :size="17" class="text-gray-400" /> إجراءات سريعة</h3>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="a in actions.filter((x) => can(x.roles))"
        :key="a.label"
        class="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-800 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="router.push(a.to)"
      >
        <Icon :name="a.icon" :size="15" class="text-gray-500" />
        {{ a.label }}
      </button>
    </div>
  </div>
</template>
