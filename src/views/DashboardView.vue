<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      Welcome back, {{ authStore.profile?.displayName }}!
    </h1>

    <!-- Owner Dashboard -->
    <div v-if="authStore.isOwner" class="space-y-6">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-indigo-100 p-3 rounded-lg">
              <span class="text-2xl">🔍</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Find Caretakers</h3>
              <p class="text-sm text-gray-500">Browse available caretakers</p>
            </div>
          </div>
          <router-link 
            to="/caretakers" 
            class="mt-4 block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Browse
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-green-100 p-3 rounded-lg">
              <span class="text-2xl">📅</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">My Bookings</h3>
              <p class="text-sm text-gray-500">{{ bookingStore.bookings.length }} bookings</p>
            </div>
          </div>
          <router-link 
            to="/bookings" 
            class="mt-4 block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            View All
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-yellow-100 p-3 rounded-lg">
              <span class="text-2xl">🐶</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">My Dogs</h3>
              <p class="text-sm text-gray-500">Manage your pets</p>
            </div>
          </div>
          <router-link 
            to="/profile" 
            class="mt-4 block text-center bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            Manage
          </router-link>
        </div>
      </div>

      <!-- Recent Bookings -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <div v-if="bookingStore.bookings.length === 0" class="text-gray-500 text-center py-8">
          No bookings yet. Start by finding a caretaker!
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="booking in bookingStore.bookings.slice(0, 5)" 
            :key="booking.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ booking.caretakerName }}</p>
              <p class="text-sm text-gray-500">{{ booking.date }} • {{ booking.dogName }}</p>
            </div>
            <span :class="getStatusClass(booking.status)">
              {{ booking.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Caretaker Dashboard -->
    <div v-if="authStore.isCaretaker" class="space-y-6">
      <div class="grid md:grid-cols-3 gap-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-indigo-100 p-3 rounded-lg">
              <span class="text-2xl">📅</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Availability</h3>
              <p class="text-sm text-gray-500">Manage your schedule</p>
            </div>
          </div>
          <router-link 
            to="/availability" 
            class="mt-4 block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Set Hours
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-orange-100 p-3 rounded-lg">
              <span class="text-2xl">⏳</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Pending Requests</h3>
              <p class="text-sm text-gray-500">{{ bookingStore.pendingBookings.length }} waiting</p>
            </div>
          </div>
          <router-link 
            to="/bookings" 
            class="mt-4 block text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            Review
          </router-link>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center gap-4">
            <div class="bg-green-100 p-3 rounded-lg">
              <span class="text-2xl">✅</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Total Bookings</h3>
              <p class="text-sm text-gray-500">{{ bookingStore.bookings.length }} bookings</p>
            </div>
          </div>
          <router-link 
            to="/bookings" 
            class="mt-4 block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            View All
          </router-link>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h2>
        <div v-if="bookingStore.pendingBookings.length === 0" class="text-gray-500 text-center py-8">
          No pending requests
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="booking in bookingStore.pendingBookings" 
            :key="booking.id"
            class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div>
              <p class="font-medium text-gray-900">{{ booking.ownerName }}</p>
              <p class="text-sm text-gray-500">{{ booking.date }} • {{ booking.dogName }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="handleApprove(booking)"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button 
                @click="handleReject(booking)"
                class="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBookingStore } from '../stores/booking'
import type { Booking } from '../types'

const authStore = useAuthStore()
const bookingStore = useBookingStore()

onMounted(async () => {
  if (authStore.profile) {
    if (authStore.isOwner) {
      await bookingStore.fetchOwnerBookings(authStore.profile.uid)
    } else {
      await bookingStore.fetchCaretakerBookings(authStore.profile.uid)
    }
  }
})

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full',
    approved: 'px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full',
    rejected: 'px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full',
    cancelled: 'px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full',
    completed: 'px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
  }
  return classes[status] || classes.pending
}

const handleApprove = async (booking: Booking) => {
  await bookingStore.updateBookingStatus(
    booking.id, 
    'approved', 
    booking.ownerId, 
    booking.ownerName
  )
}

const handleReject = async (booking: Booking) => {
  await bookingStore.updateBookingStatus(
    booking.id, 
    'rejected', 
    booking.ownerId, 
    booking.ownerName
  )
}
</script>
