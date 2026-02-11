export type UserRole = 'owner' | 'caretaker'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  photoURL?: string
  phone?: string
  location?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface DogOwnerProfile extends UserProfile {
  role: 'owner'
  dogs: Dog[]
}

export interface CaretakerProfile extends UserProfile {
  role: 'caretaker'
  experience?: string
  hourlyRate?: number
  services: string[]
  rating?: number
  reviewCount?: number
  availability: AvailabilitySlot[]
}

export interface Dog {
  id: string
  name: string
  breed: string
  age: number
  size: 'small' | 'medium' | 'large'
  notes?: string
  photoURL?: string
}

export interface AvailabilitySlot {
  id: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  isAvailable: boolean
}

export interface Booking {
  id: string
  ownerId: string
  ownerName: string
  caretakerId: string
  caretakerName: string
  dogId: string
  dogName: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'booking_request' | 'booking_approved' | 'booking_rejected' | 'booking_cancelled'
  title: string
  message: string
  bookingId?: string
  read: boolean
  createdAt: Date
}
