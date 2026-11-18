<template>
  <div>
    <h2 class="text-xl font-bold mb-6">التقارير</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link v-for="r in visible" :key="r.to" :to="r.to"
        class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">{{ r.icon }}</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">{{ r.label }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ r.desc }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { canSee } from '../../utils/roles'

// Reports triage: the sidebar used to carry all of these as 8 flat entries;
// they now live behind this one hub. Routes are unchanged — direct URLs and
// deep links keep working. Role gate is shared with the other hubs via
// utils/roles.js — `owner` counts as manager-level everywhere.
const auth = useAuthStore()

const REPORTS = [
  { to: '/reports/daily', icon: '📅', label: 'التقرير اليومي', desc: 'مبيعات وتحصيلات اليوم لكل مناوبة' },
  { to: '/reports/daily-statement', icon: '📒', label: 'كشف الحساب اليومي', roles: ['admin', 'manager', 'finance'], desc: 'كشف مفصل بحركة اليوم المالية' },
  { to: '/reports/monthly', icon: '📆', label: 'التقرير الشهري', roles: ['admin', 'manager', 'finance'], desc: 'ملخص شهري لكل محطة' },
  { to: '/reports/inventory', icon: '📦', label: 'المخزون والتوريد', desc: 'أرصدة الخزانات وحركة التوريد' },
  { to: '/reports/balance', icon: '⚖️', label: 'تقرير الرصيد', roles: ['admin', 'manager', 'finance'], desc: 'مطابقة الإيرادات مع المبيعات' },
  { to: '/reports/shipments', icon: '📋', label: 'تقرير الشحنات الشهري', roles: ['admin', 'manager', 'finance'], desc: 'الشحنات المستلمة خلال شهر' },
  { to: '/reports/delivery-print', icon: '🖨️', label: 'تقرير التسليم للطباعة', roles: ['admin', 'manager', 'finance'], desc: 'نسخة قابلة للطباعة لتسليم الوقود' },
]

const visible = computed(() => REPORTS.filter((r) => canSee(auth.user, r.roles)))
</script>
