import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'
import { db } from '../services/firebase'
import type { Booking } from '../types'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref<Booking[]>([])
  const pendingBookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Create a new booking request
  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Create notification for caretaker
      await addDoc(collection(db, 'notifications'), {
        userId: bookingData.caretakerId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${bookingData.ownerName} wants to book ${bookingData.dogName} for ${bookingData.date}`,
        bookingId: docRef.id,
        read: false,
        createdAt: serverTimestamp()
      })

      return docRef.id
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create booking'
      return null
    } finally {
      loading.value = false
    }
  }

  // Fetch bookings for owner
  const fetchOwnerBookings = async (ownerId: string) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      bookings.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[]
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch bookings'
    } finally {
      loading.value = false
    }
  }

  // Fetch bookings for caretaker
  const fetchCaretakerBookings = async (caretakerId: string) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'bookings'), 
        where('caretakerId', '==', caretakerId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      bookings.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[]
      
      pendingBookings.value = bookings.value.filter(b => b.status === 'pending')
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch bookings'
    } finally {
      loading.value = false
    }
  }

  // Update booking status (approve/reject)
  const updateBookingStatus = async (
    bookingId: string, 
    status: 'approved' | 'rejected',
    ownerId: string,
    _ownerName: string
  ) => {
    loading.value = true
    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status,
        updatedAt: serverTimestamp()
      })

      // Notify owner about the decision
      const notificationType = status === 'approved' ? 'booking_approved' : 'booking_rejected'
      const message = status === 'approved' 
        ? 'Your booking has been approved!' 
        : 'Your booking has been rejected'

      await addDoc(collection(db, 'notifications'), {
        userId: ownerId,
        type: notificationType,
        title: status === 'approved' ? 'Booking Approved' : 'Booking Rejected',
        message,
        bookingId,
        read: false,
        createdAt: serverTimestamp()
      })

      // Update local state
      const index = bookings.value.findIndex(b => b.id === bookingId)
      if (index !== -1 && bookings.value[index]) {
        bookings.value[index].status = status
      }
      pendingBookings.value = bookings.value.filter(b => b.status === 'pending')

      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update booking'
      return false
    } finally {
      loading.value = false
    }
  }

  // Cancel booking (by owner)
  const cancelBooking = async (bookingId: string, caretakerId: string) => {
    loading.value = true
    try {
      const bookingRef = doc(db, 'bookings', bookingId)
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      })

      // Notify caretaker
      await addDoc(collection(db, 'notifications'), {
        userId: caretakerId,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: 'A booking has been cancelled by the owner',
        bookingId,
        read: false,
        createdAt: serverTimestamp()
      })

      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel booking'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    bookings,
    pendingBookings,
    loading,
    error,
    createBooking,
    fetchOwnerBookings,
    fetchCaretakerBookings,
    updateBookingStatus,
    cancelBooking
  }
})
