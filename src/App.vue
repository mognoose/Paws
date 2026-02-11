<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import NavBar from './components/NavBar.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar v-if="!authStore.loading" />
    
    <!-- Loading Screen -->
    <div v-if="authStore.loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p class="text-gray-500">Loading...</p>
      </div>
    </div>
    
    <!-- Main Content -->
    <main v-else>
      <router-view />
    </main>
  </div>
</template>
