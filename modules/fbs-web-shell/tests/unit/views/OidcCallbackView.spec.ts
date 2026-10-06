import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OidcCallbackView from '@/views/OidcCallbackView.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { appProviderApi } from '@/services/api'

const mockRouter = {
  replace: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

vi.mock('@/services/api', () => ({
  setAuthTokenGetter: vi.fn(),
  appProviderApi: {
    getVisibleProviders: vi.fn().mockResolvedValue([
      {
        id: 'course-management',
        title: 'Kurse',
        url: 'http://localhost:8082',
        embedMode: 'IFRAME',
        navbarPosition: 1,
        isDefault: true,
        isActive: true,
        requiredGlobalRole: 'USER'
      }
    ])
  }
}))

const mockHandleCallback = vi.fn()
const mockHandleSilentCallback = vi.fn()
const mockHandlePopupCallback = vi.fn()

vi.mock('@/services/oidc', () => ({
  handleCallback: () => mockHandleCallback(),
  handleSilentCallback: () => mockHandleSilentCallback(),
  handlePopupCallback: () => mockHandlePopupCallback(),
  userManager: {
    events: {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn(),
      addAccessTokenExpiring: vi.fn(),
      addSilentRenewError: vi.fn(),
      addAccessTokenExpired: vi.fn()
    }
  },
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

function createFakeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('OidcCallbackView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle standard main window redirect callback and navigate', async () => {
    const validJwt = createFakeJwt({ sub: '123', preferred_username: 'test' })
    const mockUser = {
      access_token: validJwt,
      expired: false,
      state: { redirectUrl: '/apps/course-management' }
    }
    mockHandleCallback.mockResolvedValueOnce(mockUser)

    mount(OidcCallbackView)
    await flushPromises()

    const authStore = useAuthStore()
    expect(mockHandleCallback).toHaveBeenCalled()
    expect(authStore.token).toBe(validJwt)
    expect(mockRouter.replace).toHaveBeenCalledWith('/apps/course-management')
  })

  it('should display error card and not redirect in loop when handleCallback throws error', async () => {
    mockHandleCallback.mockRejectedValueOnce(new Error('Network error during token exchange'))

    const wrapper = mount(OidcCallbackView)
    await flushPromises()

    expect(mockRouter.replace).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Anmeldung fehlgeschlagen')
    expect(wrapper.text()).toContain('Network error during token exchange')
    expect(wrapper.text()).toContain('Erneut anmelden')
  })

  it('should call handleSilentCallback without store navigation when inside an iframe', async () => {
    const originalTop = window.top
    try {
      Object.defineProperty(window, 'top', {
        value: {},
        writable: true,
        configurable: true
      })

      mount(OidcCallbackView)
      await flushPromises()

      expect(mockHandleSilentCallback).toHaveBeenCalled()
      expect(mockRouter.replace).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(window, 'top', {
        value: originalTop,
        writable: true,
        configurable: true
      })
    }
  })

  it('should call handlePopupCallback and close window when inside a popup', async () => {
    const originalOpener = window.opener
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {})
    try {
      Object.defineProperty(window, 'opener', {
        value: {},
        writable: true,
        configurable: true
      })

      mount(OidcCallbackView)
      await flushPromises()

      expect(mockHandlePopupCallback).toHaveBeenCalled()
      expect(closeSpy).toHaveBeenCalled()
      expect(mockRouter.replace).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(window, 'opener', {
        value: originalOpener,
        writable: true,
        configurable: true
      })
    }
  })
})
