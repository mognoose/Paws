import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  orderBy
} from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Notification } from '../types'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let unsubscribe: Unsubscribe | null = null

  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  // Subscribe to real-time notifications
  const subscribeToNotifications = (userId: string) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        notifications.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notification[]
        loading.value = false
      })
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to subscribe to notifications'
      loading.value = false
    }
  }

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    notifications.value = []
  }

  // Fetch notifications (one-time)
  const fetchNotifications = async (userId: string) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      notifications.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[]
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, 'notifications', notificationId)
      await updateDoc(notifRef, { read: true })
      
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1 && notifications.value[index]) {
        notifications.value[index].read = true
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to mark as read'
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.value.filter(n => !n.read)
      for (const notif of unreadNotifs) {
        const notifRef = doc(db, 'notifications', notif.id)
        await updateDoc(notifRef, { read: true })
      }
      notifications.value.forEach(n => n.read = true)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
})
