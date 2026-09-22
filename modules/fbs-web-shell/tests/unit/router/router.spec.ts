import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'

vi.mock('@/services/oidc', () => ({
  userManager: {
    signinSilent: vi.fn(),
    signinRedirect: vi.fn(),
    signinCallback: vi.fn(),
    events: {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn()
    }
  },
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

vi.mock('@/services/api', () => ({
  setAuthTokenGetter: vi.fn(),
  appProviderApi: {
    getVisibleProviders: vi.fn().mockResolvedValue([
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
      }
    ]),
    getAllProvidersAdmin: vi.fn().mockResolvedValue([])
  }
}))

vi.mock('@/services/graphql', () => ({
  setGraphQlTokenGetter: vi.fn()
}))

function createFakeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('Router Navigation Guards', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    await router.push('/oauth2/callback') // reset router to a neutral state
  })

  it('should automatically redirect unauthenticated user to login when visiting /', async () => {
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')

    await router.push('/')

    // Route / redirects to default app /apps/course-management which triggers login
    expect(loginSpy).toHaveBeenCalledWith('/apps/course-management')
  })

  it('should automatically redirect unauthenticated user to login when visiting /apps/course-management', async () => {
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')

    await router.push('/apps/course-management')

    expect(loginSpy).toHaveBeenCalledWith('/apps/course-management')
  })

  it('should automatically redirect unauthenticated user to login when visiting /admin/apps', async () => {
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')

    await router.push('/admin/apps')

    expect(loginSpy).toHaveBeenCalledWith('/admin/apps')
  })

  it('should allow unauthenticated access to /oauth2/callback without triggering login', async () => {
    const authStore = useAuthStore()
    const loginSpy = vi.spyOn(authStore, 'login')

    await router.push('/oauth2/callback')

    expect(router.currentRoute.value.name).toBe('oidc-callback')
    expect(loginSpy).not.toHaveBeenCalled()
  })

  it('should redirect authenticated non-admin user from /admin/apps to /', async () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '2',
      preferred_username: 'student',
      global_role: 'USER'
    })
    authStore.setSession({ access_token: token, expired: false } as any)

    await router.push('/admin/apps')

    // / redirects to default app /apps/course-management
    expect(router.currentRoute.value.path).toBe('/apps/course-management')
  })

  it('should allow authenticated admin user to access /admin/apps', async () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '1',
      preferred_username: 'admin',
      global_role: 'ADMIN'
    })
    authStore.setSession({ access_token: token, expired: false } as any)

    await router.push('/admin/apps')

    expect(router.currentRoute.value.path).toBe('/admin/apps')
  })

  it('should allow authenticated user to access /apps/course-management', async () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '2',
      preferred_username: 'student',
      global_role: 'USER'
    })
    authStore.setSession({ access_token: token, expired: false } as any)

    await router.push('/apps/course-management')

    expect(router.currentRoute.value.path).toBe('/apps/course-management')
  })
})
