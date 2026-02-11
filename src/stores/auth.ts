import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import type { UserProfile, UserRole, DogOwnerProfile, CaretakerProfile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | DogOwnerProfile | CaretakerProfile | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isOwner = computed(() => profile.value?.role === 'owner')
  const isCaretaker = computed(() => profile.value?.role === 'caretaker')

  // Initialize auth state listener
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        user.value = firebaseUser
        if (firebaseUser) {
          await fetchProfile(firebaseUser.uid)
        } else {
          profile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  // Fetch user profile from Firestore
  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        profile.value = { uid, ...docSnap.data() } as UserProfile
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  // Register new user
  const register = async (
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole
  ) => {
    error.value = null
    loading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const baseProfile: Omit<UserProfile, 'uid'> = {
        email,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      let profileData: Record<string, unknown>
      if (role === 'owner') {
        profileData = { ...baseProfile, dogs: [] }
      } else {
        profileData = { 
          ...baseProfile, 
          services: [],
          availability: [],
          rating: 0,
          reviewCount: 0
        }
      }

      await setDoc(doc(db, 'users', uid), {
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      profile.value = { uid, ...profileData } as UserProfile
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Login user
  const login = async (email: string, password: string) => {
    error.value = null
    loading.value = true
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      profile.value = null
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isCaretaker,
    initAuth,
    fetchProfile,
    register,
    login,
    logout
  }
})
