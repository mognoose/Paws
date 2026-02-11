<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <span class="text-5xl">🐕</span>
        <h2 class="mt-4 text-3xl font-bold text-gray-900">Sign in to Paws</h2>
        <p class="mt-2 text-gray-600">
          Don't have an account? 
          <router-link to="/register" class="text-indigo-600 hover:text-indigo-500">Register</router-link>
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="bg-white shadow-lg rounded-xl px-8 py-10">
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="email">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="password">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/dashboard')
  }
}
</script>
