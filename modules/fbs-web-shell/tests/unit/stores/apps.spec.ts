import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppsStore } from '@/stores/apps'
import { appProviderApi } from '@/services/api'
import type { ApplicationProvider } from '@/types/app'

vi.mock('@/services/api', () => ({
  appProviderApi: {
    getVisibleProviders: vi.fn(),
    getAllProviders: vi.fn(),
    createProvider: vi.fn(),
    updateProvider: vi.fn(),
    deleteProvider: vi.fn()
  }
}))

const mockApps: ApplicationProvider[] = [
  {
    id: 'course-management',
    title: 'Kurse & Aufgaben',
    description: 'Course management',
    icon: 'school',
    url: 'http://localhost:8082',
    embedMode: 'IFRAME',
    requiredGlobalRole: 'USER',
    navbarPosition: 10,
    showInNavbar: true,
    isDefault: true,
    isActive: true
  },
  {
    id: 'sql-playground',
    title: 'SQL Playground',
    description: 'SQL sandbox',
    icon: 'terminal',
    url: 'http://localhost:3001',
    embedMode: 'IFRAME',
    requiredGlobalRole: 'USER',
    navbarPosition: 20,
    showInNavbar: true,
    isDefault: false,
    isActive: true
  },
  {
    id: 'hidden-tool',
    title: 'Hidden Tool',
    description: 'Hidden from navbar',
    icon: 'build',
    url: 'http://localhost:9999',
    embedMode: 'EXTERNAL',
    requiredGlobalRole: 'ADMIN',
    navbarPosition: 50,
    showInNavbar: false,
    isDefault: false,
    isActive: true
  }
]

describe('Apps Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with empty apps list', () => {
    const appsStore = useAppsStore()
    expect(appsStore.apps).toEqual([])
    expect(appsStore.navbarApps).toEqual([])
    expect(appsStore.defaultApp).toBeNull()
    expect(appsStore.activeApp).toBeNull()
  })

  it('should fetch visible apps and filter navbar apps sorted by position', async () => {
    vi.mocked(appProviderApi.getVisibleProviders).mockResolvedValue(mockApps)
    const appsStore = useAppsStore()

    await appsStore.fetchVisibleApps()

    expect(appsStore.apps.length).toBe(3)
    expect(appsStore.navbarApps.length).toBe(2)
    expect(appsStore.navbarApps[0].id).toBe('course-management')
    expect(appsStore.navbarApps[1].id).toBe('sql-playground')
    expect(appsStore.defaultApp?.id).toBe('course-management')
  })

  it('should set active app by id', async () => {
    vi.mocked(appProviderApi.getVisibleProviders).mockResolvedValue(mockApps)
    const appsStore = useAppsStore()
    await appsStore.fetchVisibleApps()

    appsStore.setActiveApp('sql-playground')
    expect(appsStore.activeApp?.id).toBe('sql-playground')
    expect(appsStore.activeApp?.title).toBe('SQL Playground')

    appsStore.setActiveApp(null)
    expect(appsStore.activeApp?.id).toBe('course-management') // falls back to defaultApp
  })

  it('should handle API error gracefully', async () => {
    vi.mocked(appProviderApi.getVisibleProviders).mockRejectedValue(new Error('Network Error'))
    const appsStore = useAppsStore()

    await appsStore.fetchVisibleApps()

    expect(appsStore.apps).toEqual([])
    expect(appsStore.error).toBe('Network Error')
    expect(appsStore.loading).toBe(false)
  })
})
