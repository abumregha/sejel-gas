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
// `owner` counts as manager-level (role-mismatch fix — utils/roles.js).
const can = (roles) => !roles || auth.isAdmin || roles.includes(auth.role)
  || (auth.role === 'owner' && roles.includes('manager'))

// The four things an operator does every day. Delivery is manager-level only
// (B1): hidden, never an error state, for everyone else.
const dailyTasks = [
  { label: 'اقرات المضخنات', icon: 'gauge', to: '/readings' },
  { label: 'إيرادات', icon: 'banknote', to: '/finance/income' },
  { label: 'اقراة خزان', icon: 'tank', to: '/inventory/tank-readings' },
  { label: 'توريد وقود', icon: 'island', to: '/inventory/shipments/create?type=delivery', roles: ['admin', 'manager', 'owner', 'finance'] },
]

const actions = [
  { label: 'قراءات المضخات', icon: 'gauge', to: '/readings' },
  { label: 'قراءة عداد', icon: 'meter', to: '/shifts', roles: ['supervisor', 'manager'] },
  { label: 'إقفال مناوبة', icon: 'clock', to: '/shifts', roles: ['supervisor', 'manager'] },
  { label: 'قراءة خزان', icon: 'tank', to: '/inventory/tank-readings', roles: ['supervisor', 'manager'] },
  { label: 'تعبئة خزان', icon: 'tank', to: '/inventory/tank-readings', roles: ['supervisor', 'manager'] },
  { label: 'إضافة شحنة', icon: 'island', to: '/inventory/shipments/create?type=delivery', roles: ['supervisor', 'manager'] },
  { label: 'إضافة تحصيل', icon: 'banknote', to: '/finance/income', roles: ['finance', 'manager'] },
  { label: 'إضافة مصروف', icon: 'wallet', to: '/finance/expenses/create', roles: ['finance', 'manager'] },
  { label: 'مطابقة مناوبة', icon: 'scale', to: '/finance/reconciliations', roles: ['finance', 'manager'] },
  { label: 'عرض التقارير', icon: 'layers', to: '/reports/daily', roles: ['finance', 'manager'] },
  { label: 'إدارة المحطات', icon: 'station', to: '/stations', roles: ['manager'] },
]

const getActionUrl = (a) => {
  if (props.stationId) {
    if (a.to.startsWith('/inventory/shipments/create')) return `${a.to}&station=${props.stationId}`
    if (a.to === '/inventory/tank-readings') return `${a.to}?station=${props.stationId}`
  }
  return a.to
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h3 class="font-bold flex items-center gap-2 mb-3"><Icon name="arrowright" :size="17" class="text-gray-400" /> إجراءات سريعة</h3>

    <!-- The four daily tasks, as one prominent row. -->
    <div class="grid grid-cols-2 gap-2 mb-4">
      <button
        v-for="a in dailyTasks.filter((x) => can(x.roles))"
        :key="a.label"
        class="flex flex-col items-center justify-center gap-1 min-h-[84px] rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="router.push(getActionUrl(a))"
      >
        <Icon :name="a.icon" :size="26" class="text-blue-600" />
        <span class="text-sm font-bold text-blue-900">{{ a.label }}</span>
      </button>
    </div>

    <!-- The wider toolset, as before. -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="a in actions.filter((x) => can(x.roles))"
        :key="a.label"
        class="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-800 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
        @click="router.push(getActionUrl(a))"
      >
        <Icon :name="a.icon" :size="15" class="text-gray-500" />
        {{ a.label }}
      </button>
    </div>
  </div>
</template>
