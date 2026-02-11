<template>
  <div class="p-6">
    <router-link to="/caretakers" class="text-indigo-600 hover:text-indigo-700 mb-4 inline-block">
      ← Back to Caretakers
    </router-link>

    <div v-if="caretakerStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
    </div>

    <div v-else-if="!caretaker" class="text-center py-12">
      <p class="text-gray-500">Caretaker not found</p>
    </div>

    <div v-else class="max-w-4xl">
      <!-- Profile Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-4xl">👤</span>
          </div>
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900">{{ caretaker.displayName }}</h1>
            <p class="text-gray-500 mb-2">{{ caretaker.location || 'Location not set' }}</p>
            
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-1 text-yellow-500">
                <span>⭐</span>
                <span class="font-medium">{{ caretaker.rating?.toFixed(1) || 'New' }}</span>
                <span class="text-gray-400">({{ caretaker.reviewCount || 0 }} reviews)</span>
              </div>
              <div class="text-lg font-semibold text-indigo-600">
                ${{ caretaker.hourlyRate || '?' }}/hr
              </div>
            </div>

            <p class="text-gray-600">{{ caretaker.bio || 'No bio available' }}</p>
          </div>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Services & Experience -->
        <div class="md:col-span-1 space-y-6">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="font-semibold text-gray-900 mb-4">Services</h2>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="service in caretaker.services" 
                :key="service"
                class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
              >
                {{ service }}
              </span>
              <span v-if="!caretaker.services?.length" class="text-gray-500 text-sm">
                No services listed
              </span>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="font-semibold text-gray-900 mb-4">Experience</h2>
            <p class="text-gray-600 text-sm">
              {{ caretaker.experience || 'No experience description provided' }}
            </p>
          </div>
        </div>

        <!-- Calendar & Booking -->
        <div class="md:col-span-2">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="font-semibold text-gray-900 mb-4">Available Dates</h2>
            
            <!-- Simple Calendar -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <button 
                  @click="changeMonth(-1)"
                  class="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
                <span class="font-medium">{{ currentMonthName }} {{ currentYear }}</span>
                <button 
                  @click="changeMonth(1)"
                  class="p-2 hover:bg-gray-100 rounded-lg"
                >
                  →
                </button>
              </div>

              <div class="grid grid-cols-7 gap-1 text-center text-sm">
                <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="py-2 text-gray-500 font-medium">
                  {{ day }}
                </div>
                <div 
                  v-for="(day, index) in calendarDays" 
                  :key="index"
                  @click="day.date && selectDate(day)"
                  :class="[
                    'py-2 rounded-lg cursor-pointer transition',
                    !day.date && 'invisible',
                    day.isToday && 'ring-2 ring-indigo-300',
                    day.isAvailable && 'bg-green-100 text-green-800 hover:bg-green-200',
                    !day.isAvailable && day.date && 'text-gray-400',
                    selectedDate === day.dateString && 'ring-2 ring-indigo-600'
                  ]"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>

            <!-- Available Slots for Selected Date -->
            <div v-if="selectedDate" class="border-t pt-4">
              <h3 class="font-medium text-gray-900 mb-3">
                Available times for {{ selectedDate }}
              </h3>
              
              <div v-if="availableSlots.length === 0" class="text-gray-500 text-sm">
                No available slots for this date
              </div>
              
              <div v-else class="grid grid-cols-2 gap-2 mb-4">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.id"
                  @click="selectSlot(slot)"
                  :class="[
                    'p-3 border rounded-lg text-sm transition',
                    selectedSlot?.id === slot.id 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  {{ slot.startTime }} - {{ slot.endTime }}
                </button>
              </div>

              <!-- Booking Form -->
              <div v-if="selectedSlot" class="border-t pt-4">
                <h3 class="font-medium text-gray-900 mb-3">Book this time</h3>
                
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select your dog</label>
                  <select
                    v-model="selectedDogId"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Choose a dog</option>
                    <option v-for="dog in ownerDogs" :key="dog.id" :value="dog.id">
                      {{ dog.name }} ({{ dog.breed }})
                    </option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    v-model="bookingNotes"
                    rows="2"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Any special instructions..."
                  ></textarea>
                </div>

                <button
                  @click="handleBooking"
                  :disabled="!selectedDogId || bookingStore.loading"
                  class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {{ bookingStore.loading ? 'Booking...' : 'Request Booking' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-full max-w-md m-4 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h3 class="text-lg font-semibold mb-2">Booking Request Sent!</h3>
        <p class="text-gray-500 mb-4">
          The caretaker will review your request and get back to you soon.
        </p>
        <button
          @click="showSuccessModal = false; router.push('/bookings')"
          class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          View My Bookings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCaretakerStore } from '../stores/caretaker'
import { useBookingStore } from '../stores/booking'
import { useAuthStore } from '../stores/auth'
import type { AvailabilitySlot, Dog, DogOwnerProfile } from '../types'

const route = useRoute()
const router = useRouter()
const caretakerStore = useCaretakerStore()
const bookingStore = useBookingStore()
const authStore = useAuthStore()

const currentDate = ref(new Date())
const selectedDate = ref<string | null>(null)
const selectedSlot = ref<AvailabilitySlot | null>(null)
const selectedDogId = ref('')
const bookingNotes = ref('')
const showSuccessModal = ref(false)

const caretaker = computed(() => caretakerStore.selectedCaretaker)

const ownerDogs = computed(() => {
  if (authStore.profile && 'dogs' in authStore.profile) {
    return (authStore.profile as DogOwnerProfile).dogs || []
  }
  return []
})

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('default', { month: 'long' })
})

interface CalendarDay {
  date: number | null
  dateString: string
  isToday: boolean
  isAvailable: boolean
}

const calendarDays = computed((): CalendarDay[] => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  
  const days: CalendarDay[] = []
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, dateString: '', isToday: false, isAvailable: false })
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
    const isAvailable = caretaker.value?.availability?.some(
      (slot: AvailabilitySlot) => slot.date === dateString && slot.isAvailable
    ) || false
    
    days.push({ date: day, dateString, isToday, isAvailable })
  }
  
  return days
})

const availableSlots = computed(() => {
  if (!selectedDate.value || !caretaker.value?.availability) return []
  return caretaker.value.availability.filter(
    (slot: AvailabilitySlot) => slot.date === selectedDate.value && slot.isAvailable
  )
})

onMounted(() => {
  const id = route.params.id as string
  caretakerStore.fetchCaretakerById(id)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    caretakerStore.fetchCaretakerById(newId as string)
  }
})

const changeMonth = (delta: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const selectDate = (day: CalendarDay) => {
  if (!day.isAvailable) return
  selectedDate.value = day.dateString
  selectedSlot.value = null
}

const selectSlot = (slot: AvailabilitySlot) => {
  selectedSlot.value = slot
}

const handleBooking = async () => {
  if (!selectedSlot.value || !selectedDogId.value || !caretaker.value || !authStore.profile) return
  
  const selectedDog = ownerDogs.value.find((d: Dog) => d.id === selectedDogId.value)
  if (!selectedDog) return
  
  const bookingId = await bookingStore.createBooking({
    ownerId: authStore.profile.uid,
    ownerName: authStore.profile.displayName,
    caretakerId: caretaker.value.uid,
    caretakerName: caretaker.value.displayName,
    dogId: selectedDog.id,
    dogName: selectedDog.name,
    date: selectedSlot.value.date,
    startTime: selectedSlot.value.startTime,
    endTime: selectedSlot.value.endTime,
    status: 'pending',
    notes: bookingNotes.value
  })
  
  if (bookingId) {
    showSuccessModal.value = true
    selectedDate.value = null
    selectedSlot.value = null
    selectedDogId.value = ''
    bookingNotes.value = ''
  }
}
</script>
