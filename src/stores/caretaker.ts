import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../services/firebase'
import type { CaretakerProfile, AvailabilitySlot } from '../types'

export const useCaretakerStore = defineStore('caretaker', () => {
  const caretakers = ref<CaretakerProfile[]>([])
  const selectedCaretaker = ref<CaretakerProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all caretakers
  const fetchCaretakers = async () => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'caretaker'))
      const querySnapshot = await getDocs(q)
      caretakers.value = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as CaretakerProfile[]
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch caretakers'
    } finally {
      loading.value = false
    }
  }

  // Fetch single caretaker by ID
  const fetchCaretakerById = async (uid: string) => {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'caretaker'))
      const querySnapshot = await getDocs(q)
      const caretaker = querySnapshot.docs.find(doc => doc.id === uid)
      if (caretaker) {
        selectedCaretaker.value = {
          uid: caretaker.id,
          ...caretaker.data()
        } as CaretakerProfile
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch caretaker'
    } finally {
      loading.value = false
    }
  }

  // Add availability slot (for caretakers)
  const addAvailability = async (uid: string, slot: AvailabilitySlot) => {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        availability: arrayUnion(slot),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to add availability'
      return false
    }
  }

  // Remove availability slot
  const removeAvailability = async (uid: string, slot: AvailabilitySlot) => {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        availability: arrayRemove(slot),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to remove availability'
      return false
    }
  }

  // Search caretakers by location
  const searchByLocation = async (location: string) => {
    loading.value = true
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'caretaker'),
        where('location', '==', location)
      )
      const querySnapshot = await getDocs(q)
      caretakers.value = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as CaretakerProfile[]
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Search failed'
    } finally {
      loading.value = false
    }
  }

  return {
    caretakers,
    selectedCaretaker,
    loading,
    error,
    fetchCaretakers,
    fetchCaretakerById,
    addAvailability,
    removeAvailability,
    searchByLocation
  }
})
