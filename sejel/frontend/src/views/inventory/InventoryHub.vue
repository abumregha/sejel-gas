<template>
  <div>
    <h2 class="text-xl font-bold mb-6">المخزون والتوريد</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link v-for="c in visible" :key="c.to" :to="c.to"
        class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition group">
        <div class="text-3xl mb-3">{{ c.icon }}</div>
        <h3 class="font-bold text-lg group-hover:text-primary transition">{{ c.label }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ c.desc }}</p>
      </router-link>
    </div>
    <p v-if="!visible.length" class="text-sm text-gray-400 mt-6">
      لا توجد وظيفات مخزون متاحة لدورك — تواصل مع المدير لتفعيل صلاحية.
    </p>
  </div>
</template>

<script setup>
// Inventory hub: one sidebar entry instead of 7. Role-gated per the DocType
// matrix (UX_REVIEW.md §5.3) — a supervisor sees deliveries, tank readings and
// supply requests, but not transfers/shortages/reconciliation/schedules. The
// gate lives in utils/roles.js so every hub shares one definition of "who may
// see this" instead of each one re-typing the list.
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { canSee } from '../../utils/roles'

const auth = useAuthStore()

const CARDS = [
  { to: '/inventory/deliveries', icon: '🚚', label: 'الشحنات', desc: 'توريد الوقود وتسليمه للمحطة' },
  { to: '/inventory/tank-readings', icon: '📖', label: 'قراءات الخزانات', desc: 'سجل قراءات مستوى الوقود' },
  { to: '/inventory/transfers', icon: '🔁', label: 'التحويلات', desc: 'نقل الوقود بين الخزانات', roles: ['admin', 'manager'] },
  { to: '/inventory/shortages', icon: '⚠️', label: 'النقص', desc: 'تسجيل النواقص والفرق', roles: ['admin', 'manager'] },
  { to: '/inventory/fuel-reconciliation', icon: '📉', label: 'تسوية الوقود', desc: 'مطابقة التوريد مع القراءات', roles: ['admin', 'manager', 'finance'] },
  { to: '/inventory/requests', icon: '📝', label: 'طلبات التوريد', desc: 'طلب وقود إضافي' },
  { to: '/inventory/shipment-schedules', icon: '📅', label: 'جدول الشحنات', desc: 'جدولة التوريد القادم', roles: ['admin', 'manager', 'finance'] },
]

const visible = computed(() => CARDS.filter((c) => canSee(auth.user, c.roles)))
</script>
