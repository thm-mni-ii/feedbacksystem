import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { appProviderApi } from '@/services/api'
import type { ApplicationProvider } from '@/types/app'

export const useAppsStore = defineStore('apps', () => {
  const apps = ref<ApplicationProvider[]>([])
  const activeAppId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const navbarApps = computed(() => {
    return apps.value
      .filter((app) => app.showInNavbar && app.isActive)
      .sort((a, b) => a.navbarPosition - b.navbarPosition)
  })

  const defaultApp = computed<ApplicationProvider | null>(() => {
    return apps.value.find((app) => app.isDefault && app.isActive) || navbarApps.value[0] || null
  })

  const activeApp = computed<ApplicationProvider | null>(() => {
    if (!activeAppId.value) return defaultApp.value
    return apps.value.find((app) => app.id === activeAppId.value) || null
  })

  async function fetchVisibleApps(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      apps.value = await appProviderApi.getVisibleProviders()
    } catch (e: any) {
      console.error('Failed to fetch visible applications:', e)
      error.value = e.message || 'Fehler beim Laden der Anwendungen'
    } finally {
      loading.value = false
    }
  }

  function setActiveApp(id: string | null) {
    activeAppId.value = id
  }

  return {
    apps,
    activeAppId,
    loading,
    error,
    navbarApps,
    defaultApp,
    activeApp,
    fetchVisibleApps,
    setActiveApp
  }
})
