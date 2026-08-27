<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  if (localStorage.getItem('access_token')) {
    auth.fetchUser()
  }
})
</script>
