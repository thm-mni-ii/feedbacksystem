import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'

import AppHostView from '@/views/AppHostView.vue'
import OidcCallbackView from '@/views/OidcCallbackView.vue'
import ProfileView from '@/views/ProfileView.vue'
import AppManagementView from '@/views/admin/AppManagementView.vue'
import UserManagementView from '@/views/admin/UserManagementView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    redirect: () => {
      const appsStore = useAppsStore()
      if (appsStore.defaultApp) {
        return `/apps/${appsStore.defaultApp.id}`
      }
      return '/apps/course-management'
    }
  },
  {
    path: '/apps/:providerId/:subPath(.*)*',
    name: 'app-host',
    component: AppHostView
  },
  {
    path: '/admin/apps',
    name: 'admin-apps',
    component: AppManagementView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: UserManagementView,
    meta: { requiresAdmin: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/oauth2/callback',
    name: 'oidc-callback',
    component: OidcCallbackView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()
  const appsStore = useAppsStore()

  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  // Always allow the OIDC callback route through
  if (to.name === 'oidc-callback' || to.path === '/oauth2/callback') {
    return true
  }

  // If not signed in at all (initial unauthenticated visitor), automatically redirect to login
  if (!authStore.isAuthenticated) {
    if (!authStore.token && !authStore.oidcUser) {
      await authStore.login(to.fullPath)
      return false
    }
    // If session expired in-place during active usage, do not hard redirect/reload the page.
    // The ReLoginDialog will allow seamless in-place re-authentication.
    return true
  }

  // Ensure visible applications are loaded for the authenticated user
  if (appsStore.apps.length === 0 && !appsStore.loading) {
    await appsStore.fetchVisibleApps()
  }

  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      return '/'
    }
  }

  return true
})

export default router
