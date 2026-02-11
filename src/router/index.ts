import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/caretakers',
    name: 'Caretakers',
    component: () => import('../views/CaretakersView.vue'),
    meta: { requiresAuth: true, ownerOnly: true }
  },
  {
    path: '/caretakers/:id',
    name: 'CaretakerDetail',
    component: () => import('../views/CaretakerDetailView.vue'),
    meta: { requiresAuth: true, ownerOnly: true }
  },
  {
    path: '/availability',
    name: 'Availability',
    component: () => import('../views/AvailabilityView.vue'),
    meta: { requiresAuth: true, caretakerOnly: true }
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('../views/BookingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationsView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  if (authStore.loading) {
    await authStore.initAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const isOwner = authStore.isOwner
  const isCaretaker = authStore.isCaretaker

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' })
    return
  }

  // Check if route is for guests only
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  // Check role-based access
  if (to.meta.ownerOnly && !isOwner) {
    next({ name: 'Dashboard' })
    return
  }

  if (to.meta.caretakerOnly && !isCaretaker) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
