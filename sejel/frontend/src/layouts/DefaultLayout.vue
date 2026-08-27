<template>
  <div class="min-h-screen flex" dir="rtl">
    <!-- Desktop Sidebar -->
    <aside
      :class="[
        'fixed top-0 right-0 h-full bg-gray-900 text-white z-40 transition-all duration-300 overflow-y-auto',
        sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
      ]"
    >
      <div class="p-4">
        <!-- Logo -->
        <div class="flex items-center gap-2 mb-6" v-show="sidebarOpen">
          <span class="text-xl font-bold">سجل</span>
        </div>
        <!-- Nav links -->
        <nav class="space-y-1" v-show="sidebarOpen">
          <router-link v-for="item in navItems" :key="item.to" :to="item.to"
            class="sidebar-link" :class="{ active: isActive(item.to) }"
            @click="sidebarOpen = false"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
          <div class="sidebar-section-title">التقارير</div>
          <router-link v-for="item in reportItems" :key="item.to" :to="item.to"
            class="sidebar-link" :class="{ active: isActive(item.to) }"
            @click="sidebarOpen = false"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
          <div class="sidebar-section-title">الإعدادات</div>
          <router-link v-for="item in settingItems" :key="item.to" :to="item.to"
            class="sidebar-link" :class="{ active: isActive(item.to) }"
            @click="sidebarOpen = false"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-30 lg:hidden" @click="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 min-h-screen" :class="sidebarOpen ? 'lg:mr-64' : 'lg:mr-16'">
      <!-- Top Bar -->
      <header class="sticky top-0 bg-white border-b border-gray-200 z-20 h-14 flex items-center px-4 justify-between">
        <div class="flex items-center gap-3">
          <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const roleLabel = computed(() => {
  const labels = { admin: 'مدير النظام', owner: 'مالك', supervisor: 'مشرف', finance: 'مالي' }
  return labels[auth.role] || auth.role
})

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const navItems = [
  { to: '/', icon: '🏠', label: 'الرئيسية' },
  { to: '/stations', icon: '⛽', label: 'المحطات' },
  { to: '/islands', icon: '🏝️', label: 'الجزر' },
  { to: '/machines', icon: '🔧', label: 'المضخات' },
  { to: '/meters', icon: '📊', label: 'العدادات' },
  { to: '/tanks', icon: '🛢️', label: 'الخزانات' },
  { to: '/employees', icon: '👥', label: 'الموظفين' },
  { to: '/shifts/definitions', icon: '📋', label: 'تعريفات المناوبات' },
  { to: '/shifts', icon: '🔄', label: 'المناوبات' },
  { to: '/finance/cash', icon: '💰', label: 'التحصيل النقدي' },
  { to: '/finance/vouchers', icon: '🎫', label: 'الكوبونات' },
  { to: '/finance/pos', icon: '💳', label: 'واصلات POS' },
  { to: '/finance/expenses', icon: '📤', label: 'المصروفات' },
  { to: '/finance/settlements', icon: '📑', label: 'تسويات الكوبونات' },
  { to: '/finance/reconciliations', icon: '⚖️', label: 'التسويات المالية' },
  { to: '/inventory/deliveries', icon: '🚚', label: 'الشحنات' },
  { to: '/inventory/tank-readings', icon: '📖', label: 'قراءات الخزانات' },
  { to: '/inventory/transfers', icon: '🔄', label: 'التحويلات' },
  { to: '/inventory/shortages', icon: '⚠️', label: 'النقص' },
  { to: '/inventory/fuel-reconciliation', icon: '📉', label: 'تسوية الوقود' },
  { to: '/inventory/requests', icon: '📝', label: 'طلبات التوريد' },
]

const reportItems = [
  { to: '/reports/daily', icon: '📅', label: 'التقرير اليومي' },
  { to: '/reports/monthly', icon: '📆', label: 'التقرير الشهري' },
  { to: '/reports/inventory', icon: '📦', label: 'المخزون والتوريد' },
  { to: '/shifts/gaps', icon: '🔍', label: 'فجوات العدادات' },
]

const settingItems = [
  { to: '/settings/users', icon: '👤', label: 'إدارة المستخدمين' },
  { to: '/guide', icon: '📖', label: 'دليل الاستخدام' },
]

const mobileNavItems = [
  { to: '/', icon: '🏠', label: 'الرئيسية' },
  { to: '/shifts', icon: '🔄', label: 'المناوبات' },
  { to: '/finance/cash', icon: '💰', label: 'المالية' },
  { to: '/inventory/deliveries', icon: '📦', label: 'المخزون' },
  { to: '/reports/daily', icon: '📊', label: 'التقارير' },
]

const handleLogout = () => {
  auth.logout()
  router.push('/login/')
}
</script>
