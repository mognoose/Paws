<template>
  <nav class="bg-white shadow-sm sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <span class="text-2xl">🐕</span>
          <span class="font-bold text-xl text-gray-900">Paws</span>
        </router-link>

        <!-- Mobile menu button -->
        <button 
          @click="showMobileMenu = !showMobileMenu"
          class="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Desktop Navigation Links -->
        <div class="hidden md:flex items-center gap-4">
          <template v-if="authStore.isAuthenticated">
            <router-link 
              to="/dashboard" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Dashboard
            </router-link>
            
            <router-link 
              v-if="authStore.isOwner"
              to="/caretakers" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Find Caretakers
            </router-link>
            
            <router-link 
              v-if="authStore.isCaretaker"
              to="/availability" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Availability
            </router-link>
            
            <router-link 
              to="/bookings" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              Bookings
            </router-link>

            <!-- Notifications -->
            <router-link 
              to="/notifications" 
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <span class="text-xl">🔔</span>
              <span 
                v-if="notificationStore.unreadCount > 0"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
              >
                {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
              </span>
            </router-link>

            <!-- Profile Dropdown -->
            <div class="relative">
              <button 
                @click="showDropdown = !showDropdown"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
              >
                <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-sm">👤</span>
                </div>
                <span class="text-sm text-gray-700">
                  {{ authStore.profile?.displayName }}
                </span>
              </button>

              <div 
                v-if="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border"
              >
                <router-link 
                  to="/profile" 
                  @click="showDropdown = false"
                  class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </router-link>
                <hr class="my-2">
                <button 
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </template>

          <template v-else>
            <router-link 
              to="/login" 
              class="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Sign In
            </router-link>
            <router-link 
              to="/register" 
              class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Get Started
            </router-link>
          </template>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <div 
        v-if="showMobileMenu"
        class="md:hidden border-t py-4 space-y-2"
      >
        <template v-if="authStore.isAuthenticated">
          <router-link 
            to="/dashboard" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Dashboard
          </router-link>
          
          <router-link 
            v-if="authStore.isOwner"
            to="/caretakers" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Find Caretakers
          </router-link>
          
          <router-link 
            v-if="authStore.isCaretaker"
            to="/availability" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Availability
          </router-link>
          
          <router-link 
            to="/bookings" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Bookings
          </router-link>

          <router-link 
            to="/notifications" 
            @click="showMobileMenu = false"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <span>Notifications</span>
            <span 
              v-if="notificationStore.unreadCount > 0"
              class="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
            </span>
          </router-link>

          <router-link 
            to="/profile" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            My Profile
          </router-link>

          <hr class="my-2">

          <button 
            @click="handleLogout; showMobileMenu = false"
            class="w-full text-left text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign Out
          </button>
        </template>

        <template v-else>
          <router-link 
            to="/login" 
            @click="showMobileMenu = false"
            class="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            @click="showMobileMenu = false"
            class="block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center"
          >
            Get Started
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const showDropdown = ref(false)
const showMobileMenu = ref(false)

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Subscribe to notifications when authenticated
watch(() => authStore.profile, (profile) => {
  if (profile) {
    notificationStore.subscribeToNotifications(profile.uid)
  } else {
    notificationStore.unsubscribeFromNotifications()
  }
}, { immediate: true })

const handleLogout = async () => {
  showDropdown.value = false
  showMobileMenu.value = false
  await authStore.logout()
  router.push('/')
}
</script>
