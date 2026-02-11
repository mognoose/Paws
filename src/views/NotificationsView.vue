<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
      <button
        v-if="notificationStore.unreadCount > 0"
        @click="notificationStore.markAllAsRead()"
        class="text-sm text-indigo-600 hover:text-indigo-700"
      >
        Mark all as read
      </button>
    </div>

    <!-- Loading -->
    <div v-if="notificationStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="notificationStore.notifications.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
      <span class="text-4xl">🔔</span>
      <p class="mt-2 text-gray-500">No notifications yet</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        @click="handleNotificationClick(notification)"
        :class="[
          'bg-white rounded-xl shadow-sm p-4 cursor-pointer transition',
          !notification.read && 'border-l-4 border-indigo-600'
        ]"
      >
        <div class="flex items-start gap-4">
          <div :class="[
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            getNotificationIconBg(notification.type)
          ]">
            <span>{{ getNotificationIcon(notification.type) }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <h3 :class="['font-medium', notification.read ? 'text-gray-600' : 'text-gray-900']">
                {{ notification.title }}
              </h3>
              <span class="text-xs text-gray-400">
                {{ formatTime(notification.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              {{ notification.message }}
            </p>
          </div>
          <div v-if="!notification.read" class="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'
import type { Notification } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

onMounted(() => {
  if (authStore.profile) {
    notificationStore.subscribeToNotifications(authStore.profile.uid)
  }
})

onUnmounted(() => {
  notificationStore.unsubscribeFromNotifications()
})

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    booking_request: '📬',
    booking_approved: '✅',
    booking_rejected: '❌',
    booking_cancelled: '🚫'
  }
  return icons[type] || '🔔'
}

const getNotificationIconBg = (type: string) => {
  const bgs: Record<string, string> = {
    booking_request: 'bg-blue-100',
    booking_approved: 'bg-green-100',
    booking_rejected: 'bg-red-100',
    booking_cancelled: 'bg-gray-100'
  }
  return bgs[type] || 'bg-gray-100'
}

const formatTime = (date: Date | { seconds: number }) => {
  if (!date) return ''
  
  const d = 'seconds' in date ? new Date(date.seconds * 1000) : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  
  return d.toLocaleDateString()
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id)
  }
  
  if (notification.bookingId) {
    router.push('/bookings')
  }
}
</script>
