<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

    <div class="max-w-2xl">
      <form @submit.prevent="handleSave" class="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
          <input
            v-model="form.displayName"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            :value="authStore.profile?.email"
            type="email"
            disabled
            class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            v-model="form.location"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="City, State"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            v-model="form.bio"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>

        <!-- Caretaker-specific fields -->
        <template v-if="authStore.isCaretaker">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <textarea
              v-model="form.experience"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your experience with dogs..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Hourly Rate ($)</label>
            <input
              v-model.number="form.hourlyRate"
              type="number"
              min="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="25"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
            <div class="flex flex-wrap gap-2">
              <label 
                v-for="service in serviceOptions" 
                :key="service"
                class="inline-flex items-center"
              >
                <input
                  type="checkbox"
                  :value="service"
                  v-model="form.services"
                  class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ service }}</span>
              </label>
            </div>
          </div>
        </template>

        <button
          type="submit"
          :disabled="saving"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>

      <!-- Dog Owner: My Dogs Section -->
      <div v-if="authStore.isOwner" class="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">My Dogs</h2>
          <button 
            @click="showAddDog = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Add Dog
          </button>
        </div>

        <div v-if="dogs.length === 0" class="text-gray-500 text-center py-8">
          No dogs added yet. Add your furry friend!
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="dog in dogs" 
            :key="dog.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span class="text-xl">🐶</span>
              </div>
              <div>
                <p class="font-medium text-gray-900">{{ dog.name }}</p>
                <p class="text-sm text-gray-500">
                  {{ dog.breed }} • {{ dog.age }} years • {{ dog.size }}
                </p>
              </div>
            </div>
            <button 
              @click="removeDog(dog.id)"
              class="text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>

        <!-- Add Dog Modal -->
        <div v-if="showAddDog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl p-6 w-full max-w-md m-4">
            <h3 class="text-lg font-semibold mb-4">Add a Dog</h3>
            <form @submit.prevent="handleAddDog" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="newDog.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  v-model="newDog.breed"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
                  <input
                    v-model.number="newDog.age"
                    type="number"
                    min="0"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
                  <select
                    v-model="newDog.size"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  v-model="newDog.notes"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Special needs, temperament, etc."
                ></textarea>
              </div>
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="showAddDog = false"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Dog
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuthStore } from '../stores/auth'
import type { Dog, CaretakerProfile } from '../types'

const authStore = useAuthStore()

const serviceOptions = [
  'Dog Walking',
  'Dog Sitting',
  'Overnight Stay',
  'Grooming',
  'Training',
  'Pet Taxi'
]

const form = reactive({
  displayName: '',
  phone: '',
  location: '',
  bio: '',
  experience: '',
  hourlyRate: 0,
  services: [] as string[]
})

const dogs = ref<Dog[]>([])
const showAddDog = ref(false)
const newDog = reactive({
  name: '',
  breed: '',
  age: 0,
  size: 'medium' as 'small' | 'medium' | 'large',
  notes: ''
})
const saving = ref(false)

onMounted(() => {
  if (authStore.profile) {
    form.displayName = authStore.profile.displayName || ''
    form.phone = authStore.profile.phone || ''
    form.location = authStore.profile.location || ''
    form.bio = authStore.profile.bio || ''
    
    if (authStore.isCaretaker) {
      const caretakerProfile = authStore.profile as CaretakerProfile
      form.experience = caretakerProfile.experience || ''
      form.hourlyRate = caretakerProfile.hourlyRate || 0
      form.services = caretakerProfile.services || []
    }
    
    if (authStore.isOwner && 'dogs' in authStore.profile) {
      dogs.value = authStore.profile.dogs || []
    }
  }
})

const handleSave = async () => {
  if (!authStore.profile) return
  
  saving.value = true
  try {
    const userRef = doc(db, 'users', authStore.profile.uid)
    const updateData: Record<string, unknown> = {
      displayName: form.displayName,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      updatedAt: serverTimestamp()
    }
    
    if (authStore.isCaretaker) {
      updateData.experience = form.experience
      updateData.hourlyRate = form.hourlyRate
      updateData.services = form.services
    }
    
    await updateDoc(userRef, updateData)
    await authStore.fetchProfile(authStore.profile.uid)
  } catch (err) {
    console.error('Error saving profile:', err)
  } finally {
    saving.value = false
  }
}

const handleAddDog = async () => {
  if (!authStore.profile) return
  
  const dog: Dog = {
    id: Date.now().toString(),
    name: newDog.name,
    breed: newDog.breed,
    age: newDog.age,
    size: newDog.size,
    notes: newDog.notes
  }
  
  dogs.value.push(dog)
  
  try {
    const userRef = doc(db, 'users', authStore.profile.uid)
    await updateDoc(userRef, {
      dogs: dogs.value,
      updatedAt: serverTimestamp()
    })
  } catch (err) {
    console.error('Error adding dog:', err)
    dogs.value.pop()
  }
  
  // Reset form
  newDog.name = ''
  newDog.breed = ''
  newDog.age = 0
  newDog.size = 'medium'
  newDog.notes = ''
  showAddDog.value = false
}

const removeDog = async (dogId: string) => {
  if (!authStore.profile) return
  
  const index = dogs.value.findIndex(d => d.id === dogId)
  if (index === -1) return
  
  const removed = dogs.value.splice(index, 1)
  
  try {
    const userRef = doc(db, 'users', authStore.profile.uid)
    await updateDoc(userRef, {
      dogs: dogs.value,
      updatedAt: serverTimestamp()
    })
  } catch (err) {
    console.error('Error removing dog:', err)
    dogs.value.splice(index, 0, ...removed)
  }
}
</script>
