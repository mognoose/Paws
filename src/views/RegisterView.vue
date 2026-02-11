<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <span class="text-5xl">🐕</span>
        <h2 class="mt-4 text-3xl font-bold text-gray-900">Create your account</h2>
        <p class="mt-2 text-gray-600">
          Already have an account? 
          <router-link to="/login" class="text-indigo-600 hover:text-indigo-500">Sign in</router-link>
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="bg-white shadow-lg rounded-xl px-8 py-10">
        <div v-if="authStore.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ authStore.error }}
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-2" for="displayName">
            Full Name
          </label>
          <input
            id="displayName"
            v-model="displayName"
            type="text"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="John Doe"
          />
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
            minlength="6"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="••••••••"
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-medium mb-3">
            I want to:
          </label>
          <div class="grid grid-cols-2 gap-4">
            <button
              type="button"
              @click="role = 'owner'"
              :class="[
                'p-4 border-2 rounded-lg text-center transition',
                role === 'owner' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <span class="text-2xl block mb-1">🐶</span>
              <span class="font-medium">Find a caretaker</span>
              <span class="text-xs text-gray-500 block">(Dog Owner)</span>
            </button>
            <button
              type="button"
              @click="role = 'caretaker'"
              :class="[
                'p-4 border-2 rounded-lg text-center transition',
                role === 'caretaker' 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <span class="text-2xl block mb-1">💼</span>
              <span class="font-medium">Care for dogs</span>
              <span class="text-xs text-gray-500 block">(Caretaker)</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading || !role"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import type { UserRole } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole | null>(null)

const handleRegister = async () => {
  if (!role.value) return
  
  const success = await authStore.register(
    email.value, 
    password.value, 
    displayName.value, 
    role.value
  )
  
  if (success) {
    router.push('/dashboard')
  }
}
</script>
