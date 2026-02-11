<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center text-white">
        <div class="mb-8">
          <span class="text-6xl">🐕</span>
        </div>
        <h1 class="text-5xl font-bold mb-4">Welcome to Paws</h1>
        <p class="text-xl mb-8 opacity-90">
          Connecting dog owners with trusted caretakers
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link 
            to="/register" 
            class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </router-link>
          <router-link 
            to="/login" 
            class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
          >
            Sign In
          </router-link>
        </div>
      </div>

      <!-- Features -->
      <div class="mt-20 grid md:grid-cols-3 gap-8">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <div class="text-4xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold mb-2">Find Caretakers</h3>
          <p class="opacity-80">
            Browse through verified dog caretakers in your area and check their availability
          </p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <div class="text-4xl mb-4">📅</div>
          <h3 class="text-xl font-semibold mb-2">Easy Booking</h3>
          <p class="opacity-80">
            Reserve dates directly from the caretaker's calendar with just a few clicks
          </p>
        </div>
        
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <div class="text-4xl mb-4">🔔</div>
          <h3 class="text-xl font-semibold mb-2">Stay Notified</h3>
          <p class="opacity-80">
            Get instant notifications for booking requests and approvals
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>
