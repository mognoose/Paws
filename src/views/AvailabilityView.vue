<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Manage Availability</h1>

    <div class="max-w-4xl">
      <div class="grid md:grid-cols-2 gap-6">
        <!-- Add Availability -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Add Available Time</h2>
          
          <form @submit.prevent="handleAddSlot" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                v-model="newSlot.date"
                type="date"
                :min="minDate"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  v-model="newSlot.startTime"
                  type="time"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  v-model="newSlot.endTime"
                  type="time"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="adding"
              class="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {{ adding ? 'Adding...' : 'Add Availability' }}
            </button>
          </form>

          <!-- Quick Add -->
          <div class="mt-6 pt-6 border-t">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Quick Add</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="preset in presets"
                :key="preset.label"
                @click="applyPreset(preset)"
                class="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div class="bg-white rounded-xl shadow-sm p-6">
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
            <div v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="day" class="py-2 text-gray-500 font-medium">
              {{ day }}
            </div>
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              :class="[
                'py-2 rounded-lg text-sm',
                !day.date && 'invisible',
                day.hasSlots && 'bg-green-100 text-green-800',
                day.isToday && 'ring-2 ring-indigo-300'
              ]"
            >
              {{ day.date }}
            </div>
          </div>
        </div>
      </div>

      <!-- Current Availability List -->
      <div class="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Your Available Slots</h2>
        
        <div v-if="sortedSlots.length === 0" class="text-gray-500 text-center py-8">
          No availability set. Add some time slots above!
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="slot in sortedSlots" 
            :key="slot.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p class="font-medium text-gray-900">{{ formatDate(slot.date) }}</p>
              <p class="text-sm text-gray-500">{{ slot.startTime }} - {{ slot.endTime }}</p>
            </div>
            <button
              @click="handleRemoveSlot(slot)"
              class="text-red-600 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCaretakerStore } from '../stores/caretaker'
import type { AvailabilitySlot, CaretakerProfile } from '../types'

const authStore = useAuthStore()
const caretakerStore = useCaretakerStore()

const currentDate = ref(new Date())
const adding = ref(false)

const minDate = computed(() => {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  return dateStr as string
})

const newSlot = reactive({
  date: new Date().toISOString().split('T')[0] as string,
  startTime: '09:00',
  endTime: '17:00'
})

const presets = [
  { label: 'Morning (9-12)', startTime: '09:00', endTime: '12:00' },
  { label: 'Afternoon (12-17)', startTime: '12:00', endTime: '17:00' },
  { label: 'Evening (17-20)', startTime: '17:00', endTime: '20:00' },
  { label: 'Full Day (9-17)', startTime: '09:00', endTime: '17:00' }
]

const availability = computed(() => {
  if (authStore.profile && authStore.isCaretaker) {
    return (authStore.profile as CaretakerProfile).availability || []
  }
  return []
})

const sortedSlots = computed(() => {
  return [...availability.value].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.startTime.localeCompare(b.startTime)
  })
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
  hasSlots: boolean
}

const calendarDays = computed((): CalendarDay[] => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  
  const days: CalendarDay[] = []
  
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null, dateString: '', isToday: false, hasSlots: false })
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
    const hasSlots = availability.value.some((slot: AvailabilitySlot) => slot.date === dateString)
    
    days.push({ date: day, dateString, isToday, hasSlots })
  }
  
  return days
})

onMounted(() => {
  // Set default date to today
  newSlot.date = minDate.value
})

const changeMonth = (delta: number) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const applyPreset = (preset: { startTime: string, endTime: string }) => {
  newSlot.startTime = preset.startTime
  newSlot.endTime = preset.endTime
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

const handleAddSlot = async () => {
  if (!authStore.profile) return
  
  adding.value = true
  
  const slot: AvailabilitySlot = {
    id: Date.now().toString(),
    date: newSlot.date,
    startTime: newSlot.startTime,
    endTime: newSlot.endTime,
    isAvailable: true
  }
  
  const success = await caretakerStore.addAvailability(authStore.profile.uid, slot)
  
  if (success) {
    await authStore.fetchProfile(authStore.profile.uid)
    // Move date to next day
    const nextDate = new Date(newSlot.date)
    nextDate.setDate(nextDate.getDate() + 1)
    const nextDateStr = nextDate.toISOString().split('T')[0]
    newSlot.date = nextDateStr || newSlot.date
  }
  
  adding.value = false
}

const handleRemoveSlot = async (slot: AvailabilitySlot) => {
  if (!authStore.profile) return
  
  const success = await caretakerStore.removeAvailability(authStore.profile.uid, slot)
  
  if (success) {
    await authStore.fetchProfile(authStore.profile.uid)
  }
}
</script>
