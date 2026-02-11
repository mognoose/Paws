<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="activeTab = tab.value"
        :class="[
          'px-4 py-2 rounded-lg font-medium transition',
          activeTab === tab.value 
            ? 'bg-indigo-600 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-50'
        ]"
      >
        {{ tab.label }}
        <span 
          v-if="getTabCount(tab.value) > 0"
          :class="[
            'ml-2 px-2 py-0.5 text-xs rounded-full',
            activeTab === tab.value ? 'bg-white/20' : 'bg-gray-200'
          ]"
        >
          {{ getTabCount(tab.value) }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="bookingStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBookings.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <span class="text-4xl">📅</span>
      <p class="mt-2 text-gray-500">No {{ activeTab }} bookings</p>
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <div 
        v-for="booking in filteredBookings" 
        :key="booking.id"
        class="bg-white rounded-xl shadow-sm p-6"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xl">🐶</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-gray-900">
                  {{ authStore.isOwner ? booking.caretakerName : booking.ownerName }}
                </h3>
                <span :class="getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </div>
              <p class="text-gray-500">
                {{ booking.dogName }} • {{ formatDate(booking.date) }}
              </p>
              <p class="text-sm text-gray-400">
                {{ booking.startTime }} - {{ booking.endTime }}
              </p>
              <p v-if="booking.notes" class="mt-2 text-sm text-gray-600">
                {{ booking.notes }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <!-- Owner actions -->
            <template v-if="authStore.isOwner">
              <button
                v-if="booking.status === 'pending'"
                @click="handleCancel(booking)"
                class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm"
              >
                Cancel
              </button>
            </template>

            <!-- Caretaker actions -->
            <template v-if="authStore.isCaretaker">
              <template v-if="booking.status === 'pending'">
                <button
                  @click="handleApprove(booking)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Approve
                </button>
                <button
                  @click="handleReject(booking)"
                  class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 text-sm"
                >
                  Reject
                </button>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBookingStore } from '../stores/booking'
import type { Booking } from '../types'

const authStore = useAuthStore()
const bookingStore = useBookingStore()

const activeTab = ref('all')

const tabs = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Completed', value: 'completed' }
]

onMounted(async () => {
  if (authStore.profile) {
    if (authStore.isOwner) {
      await bookingStore.fetchOwnerBookings(authStore.profile.uid)
    } else {
      await bookingStore.fetchCaretakerBookings(authStore.profile.uid)
    }
  }
})

const filteredBookings = computed(() => {
  if (activeTab.value === 'all') {
    return bookingStore.bookings
  }
  return bookingStore.bookings.filter(b => b.status === activeTab.value)
})

const getTabCount = (tab: string) => {
  if (tab === 'all') return bookingStore.bookings.length
  return bookingStore.bookings.filter(b => b.status === tab).length
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full',
    approved: 'px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full',
    rejected: 'px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full',
    cancelled: 'px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full',
    completed: 'px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full'
  }
  return classes[status] || classes.pending
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })
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

const handleCancel = async (booking: Booking) => {
  await bookingStore.cancelBooking(booking.id, booking.caretakerId)
  if (authStore.profile) {
    await bookingStore.fetchOwnerBookings(authStore.profile.uid)
  }
}
</script>
