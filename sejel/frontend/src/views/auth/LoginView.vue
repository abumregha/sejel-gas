<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">سجل</h1>
        <p class="text-gray-400">نظام إدارة محطات الوقود</p>
      </div>
      <form @submit.prevent="handleLogin" class="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
          <input v-model="username" type="text" required autofocus
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
          <input v-model="password" type="password" required
            class="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition" />
        </div>
        <div v-if="error" class="bg-red-50 text-red-600 text-sm rounded-lg p-3">{{ error }}</div>
        <button type="submit" :disabled="auth.loading"
          class="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition">
          {{ auth.loading ? 'جاري الدخول...' : 'دخول' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'خطأ في بيانات الدخول'
  }
}
</script>
