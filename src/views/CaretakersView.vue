<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Find a Caretaker</h1>

    <!-- Search/Filter -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or location..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          v-model="filterService"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Services</option>
          <option value="Dog Walking">Dog Walking</option>
          <option value="Dog Sitting">Dog Sitting</option>
          <option value="Overnight Stay">Overnight Stay</option>
          <option value="Grooming">Grooming</option>
          <option value="Training">Training</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="caretakerStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Loading caretakers...</p>
    </div>

    <!-- No Results -->
    <div v-else-if="filteredCaretakers.length === 0" class="text-center py-12">
      <span class="text-4xl">🔍</span>
      <p class="mt-2 text-gray-500">No caretakers found</p>
    </div>

    <!-- Caretaker Grid -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="caretaker in filteredCaretakers" 
        :key="caretaker.uid"
        class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
      >
        <div class="p-6">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <span class="text-2xl">👤</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ caretaker.displayName }}</h3>
              <p class="text-sm text-gray-500">{{ caretaker.location || 'Location not set' }}</p>
            </div>
          </div>

          <p class="text-gray-600 text-sm mb-4 line-clamp-2">
            {{ caretaker.bio || 'No bio available' }}
          </p>

          <!-- Services -->
          <div class="flex flex-wrap gap-1 mb-4">
            <span 
              v-for="service in caretaker.services?.slice(0, 3)" 
              :key="service"
              class="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
            >
              {{ service }}
            </span>
            <span 
              v-if="caretaker.services?.length > 3" 
              class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              +{{ caretaker.services.length - 3 }} more
            </span>
          </div>

          <!-- Stats -->
          <div class="flex items-center justify-between text-sm mb-4">
            <div class="flex items-center gap-1 text-yellow-500">
              <span>⭐</span>
              <span>{{ caretaker.rating?.toFixed(1) || 'New' }}</span>
              <span class="text-gray-400">({{ caretaker.reviewCount || 0 }})</span>
            </div>
            <div class="font-semibold text-gray-900">
              ${{ caretaker.hourlyRate || '?' }}/hr
            </div>
          </div>

          <div class="flex gap-2">
            <router-link 
              :to="`/caretakers/${caretaker.uid}`"
              class="flex-1 text-center border border-indigo-600 text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition"
            >
              View Profile
            </router-link>
            <router-link 
              :to="`/caretakers/${caretaker.uid}?book=true`"
              class="flex-1 text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Book Now
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCaretakerStore } from '../stores/caretaker'

const caretakerStore = useCaretakerStore()

const searchQuery = ref('')
const filterService = ref('')

onMounted(() => {
  caretakerStore.fetchCaretakers()
})

const filteredCaretakers = computed(() => {
  return caretakerStore.caretakers.filter(caretaker => {
    const matchesSearch = !searchQuery.value || 
      caretaker.displayName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      caretaker.location?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesService = !filterService.value ||
      caretaker.services?.includes(filterService.value)
    
    return matchesSearch && matchesService
  })
})
</script>
