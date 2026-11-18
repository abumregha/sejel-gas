<template>
  <div class="min-h-screen flex flex-col bg-gray-50" dir="rtl">
    <!-- Minimal top bar: app name, station, user, logout. No menus, no back
         stack — Simple Mode is four buttons deep, navigation is always forward. -->
    <header class="sticky top-0 bg-gray-900 text-white z-20">
      <div class="mx-auto max-w-lg px-4 py-3 flex items-center gap-3">
        <span class="text-lg font-bold">سجل</span>
        <span class="text-xs text-gray-300 truncate">{{ stationName }}</span>
        <span class="mr-auto text-xs text-gray-300">{{ userName }}</span>
        <button @click="logout" aria-label="تسجيل خروج" title="تسجيل خروج"
          class="grid place-items-center w-11 h-11 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-red-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-lg px-4 py-5 pb-16">
      <router-view />
    </main>

    <!-- Same layout-level toast contract as Manager Mode -->
    <Transition name="toast">
      <div v-if="toast.visible" data-testid="global-toast"
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 border"
        :class="toast.type === 'error'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
        <span>{{ toast.message }}</span>
        <button v-if="toast.type === 'error'" class="mr-1 text-current opacity-70 hover:opacity-100"
          aria-label="إغلاق" @click="dismiss">✕</button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useStationStore } from '../stores/station'
import { useToast } from '../composables/useToast'

const auth = useAuthStore()
const stationStore = useStationStore()
const router = useRouter()
const { toast, dismiss, show } = useToast()

const stationName = computed(() => stationStore.currentStationName || 'المحطة')
const userName = computed(() => auth.user?.first_name || auth.user?.username || '')

onMounted(async () => {
  if (!auth.user) await auth.restore()
  if (!stationStore.loaded) await stationStore.init()
})

async function logout() {
  await auth.logout()
  router.push('/login/')
}
</script>
