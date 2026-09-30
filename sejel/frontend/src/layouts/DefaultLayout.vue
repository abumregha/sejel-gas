<template>
  <div class="min-h-screen flex" dir="rtl">
    <!-- Desktop Sidebar — always open (client request: the collapsed icon rail
         was confusing). `sidebarOpen` now only controls the mobile drawer. -->
    <aside
      :class="[
        'fixed top-0 right-0 h-full bg-gray-900 text-white z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden',
        sidebarOpen ? 'w-64' : 'w-0 lg:w-64'
      ]"
    >
      <div class="p-2">
        <!-- Logo -->
        <div class="flex items-center gap-2 mb-6 px-2">
          <span class="text-xl font-bold">سجل</span>
        </div>
        <!-- Nav links (grouped + role-filtered, Q1/Q3) — icons AND labels always visible -->
        <nav class="space-y-1">
          <template v-for="(group, gi) in navGroups" :key="gi">
            <div v-if="group.title" class="sidebar-section-title">{{ group.title }}</div>
            <router-link v-for="item in group.items" :key="item.to" :to="item.to"
              class="sidebar-link" :class="{ active: isActive(item.to) }"
              :title="item.label"
              @click="onNavClick"
            >
              <span class="w-6 text-center shrink-0">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </router-link>
          </template>
        </nav>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="sidebarOpen = false" />

    <!-- Main content -->
    <!-- overflow-x-clip: one long unbreakable token (e.g. a stretched meter
         code) must never widen the whole page on phones. `clip` (not hidden)
         keeps position:sticky/-fixed working since no scroll container is created. -->
    <div class="flex-1 min-h-screen overflow-x-clip lg:mr-64">
      <!-- Top Bar -->
      <header class="sticky top-0 bg-white border-b border-gray-200 z-20 h-14 flex items-center px-4 justify-between">
        <div class="flex items-center gap-3">
          <!-- Hamburger: mobile drawer toggle only (desktop menu never collapses) -->
          <button @click="sidebarOpen = !sidebarOpen" :title="sidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'" class="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <!-- Back button (client request) — hidden on the home page -->
          <button v-if="canGoBack" @click="router.back()" title="رجوع"
            class="p-2 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center gap-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span class="text-sm hidden sm:inline">رجوع</span>
          </button>
          <h1 class="text-lg font-bold text-gray-800">سجل — نظام إدارة محطات الوقود</h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:block">{{ auth.user?.first_name || auth.user?.username }}</span>
          <span class="badge badge-blue text-xs">{{ roleLabel }}</span>
          <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <router-view />
      </main>
    </div>

    <!-- Mobile Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden h-16 flex items-center justify-around">
      <router-link v-for="item in mobileNavItems" :key="item.to" :to="item.to"
        class="bottom-nav-item" :class="{ active: isActive(item.to) }"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Client-experience feedback widget (bottom corner) -->
    <UxFeedbackWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import UxFeedbackWidget from '../components/UxFeedbackWidget.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

// History-aware back button: only meaningful if there is in-app history
// beyond the current entry (vue-router tracks position in history.state).
const canGoBack = computed(() => {
  const pos = history.state?.position ?? router.options?.history?.state?.position
  return route.path !== '/' && (pos === undefined || pos > 0)
})
const onNavClick = () => {
  // collapse only on mobile (icon rail stays on desktop)
  if (window.innerWidth < 1024) sidebarOpen.value = false
}

const roleLabel = computed(() => {
  const labels = { admin: 'مدير النظام', owner: 'مالك', supervisor: 'مشرف', finance: 'مالي' }
  return labels[auth.role] || auth.role
})

const isActive = (path) => {
  // The setup wizard is its own page — don't double-highlight "المحطات"
  if (path === '/stations' && route.path.startsWith('/stations/setup-wizard')) return false
  return route.path === path || route.path.startsWith(path + '/')
}

// Role-based visibility (Q3). `roles` omitted = everyone. Admin sees all.
// Infrastructure lists (islands/machines/meters/tanks) are managed inside the
// station page tabs + wizard, so they're no longer in the nav (Q2).
const can = (roles) => !roles || auth.isAdmin || roles.includes(auth.role)

const navGroups = computed(() => {
  const groups = [
    {
      title: null,
      items: [{ to: '/', icon: '🏠', label: 'الرئيسية' }],
    },
    {
      title: 'العمليات',
      items: [
        { to: '/readings', icon: '🎯', label: 'قراءات المضخات' },
        { to: '/shifts/day', icon: '🗓️', label: 'يوم المحطة' },
        { to: '/shifts', icon: '🔄', label: 'المناوبات' },
        { to: '/stations', icon: '⛽', label: 'المحطات', roles: ['admin', 'manager'] },
        { to: '/stations/setup-wizard', icon: '🧭', label: 'إعداد محطة', roles: ['admin', 'manager'] },
        { to: '/employees', icon: '👥', label: 'الموظفين', roles: ['admin', 'manager'] },
        { to: '/shifts/definitions', icon: '📋', label: 'تعريفات المناوبات', roles: ['admin', 'manager', 'supervisor'] },
      ],
    },
    {
      title: 'المالية',
      items: [
        { to: '/finance', icon: '💰', label: 'المالية', roles: ['admin', 'manager', 'finance'] },
        { to: '/finance/income', icon: '📥', label: 'إدخال إيرادات' },
        { to: '/finance/daily-sales', icon: '📊', label: 'المبيعات المالية' },
        { to: '/finance/fuel-prices', icon: '💲', label: 'أسعار الوقود', roles: ['admin', 'manager'] },
        { to: '/finance/cash', icon: '💵', label: 'النقدية', roles: ['admin', 'manager', 'finance'] },
        { to: '/finance/vouchers', icon: '🎫', label: 'القسائم', roles: ['admin', 'manager', 'finance'] },
        { to: '/finance/pos', icon: '🏧', label: 'الدفع الإلكتروني', roles: ['admin', 'manager', 'finance'] },
        { to: '/finance/expenses', icon: '🧾', label: 'المصروفات', roles: ['admin', 'manager', 'finance'] },
        { to: '/finance/settlements', icon: '📑', label: 'تسوية القسائم', roles: ['admin', 'manager', 'finance'] },
      ],
    },
    {
      title: 'المخزون',
      items: [
        { to: '/inventory/deliveries', icon: '🚚', label: 'الشحنات' },
        { to: '/inventory/tank-readings', icon: '📖', label: 'قراءات الخزانات' },
        { to: '/inventory/transfers', icon: '🔁', label: 'التحويلات', roles: ['admin', 'manager'] },
        { to: '/inventory/shortages', icon: '⚠️', label: 'النقص', roles: ['admin', 'manager'] },
        { to: '/inventory/fuel-reconciliation', icon: '📉', label: 'تسوية الوقود', roles: ['admin', 'manager', 'finance'] },
        { to: '/inventory/requests', icon: '📝', label: 'طلبات التوريد' },
      ],
    },
    {
      title: 'التقارير',
      items: [
        { to: '/reports/daily', icon: '📅', label: 'التقرير اليومي' },
        { to: '/reports/monthly', icon: '📆', label: 'التقرير الشهري', roles: ['admin', 'manager', 'finance'] },
        { to: '/reports/inventory', icon: '📦', label: 'المخزون والتوريد' },
        { to: '/shifts/gaps', icon: '🔍', label: 'فجوات العدادات', roles: ['admin', 'manager', 'supervisor'] },
      ],
    },
    {
      title: 'الإعدادات',
      items: [
        { to: '/settings/users', icon: '👤', label: 'إدارة المستخدمين', roles: ['admin'] },
        { to: '/guide', icon: '📖', label: 'دليل الاستخدام' },
      ],
    },
  ]
  return groups
    .map((g) => ({ ...g, items: g.items.filter((i) => can(i.roles)) }))
    .filter((g) => g.items.length)
})

const mobileNavItems = [
  { to: '/', icon: '🏠', label: 'الرئيسية' },
  { to: '/readings', icon: '🎯', label: 'القراءات' },
  { to: '/shifts', icon: '🔄', label: 'المناوبات' },
  { to: '/finance/income', icon: '💰', label: 'الإيرادات' },
  { to: '/reports/daily', icon: '📊', label: 'التقارير' },
]

const handleLogout = () => {
  auth.logout()
  router.push('/login/')
}
</script>
