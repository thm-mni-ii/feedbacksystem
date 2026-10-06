import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ReLoginDialog from '@/components/auth/ReLoginDialog.vue'
import { useAuthStore } from '@/stores/auth'

const mockRouter = {
  currentRoute: {
    value: { fullPath: '/apps/course-management/task/42' }
  }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

function createFakeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

vi.mock('@/services/oidc', () => ({
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
  reloginPopup: vi.fn().mockImplementation(() =>
    Promise.resolve({
      access_token: createFakeJwt({ sub: '123', preferred_username: 'relog_user' }),
      expired: false
    })
  ),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

describe('ReLoginDialog Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('should trigger in-place re-login on button click', async () => {
    const authStore = useAuthStore()
    authStore.isSessionExpired = true

    mount(ReLoginDialog)
    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Sitzung abgelaufen')
    })

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const popupBtn = buttons.find((b) => b.textContent?.includes('Jetzt neu anmelden'))
    expect(popupBtn).toBeDefined()

    popupBtn?.click()
    await vi.waitFor(() => {
      expect(authStore.isSessionExpired).toBe(false)
    })
  })

  it('should trigger full redirect login on secondary button click', async () => {
    const authStore = useAuthStore()
    authStore.isSessionExpired = true
    const loginSpy = vi.spyOn(authStore, 'login').mockResolvedValue()

    mount(ReLoginDialog)
    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Sitzung abgelaufen')
    })

    const buttons = Array.from(document.body.querySelectorAll('button'))
    const redirectBtn = buttons.find((b) => b.textContent?.includes('Vollständige Weiterleitung'))
    expect(redirectBtn).toBeDefined()

    redirectBtn?.click()
    expect(loginSpy).toHaveBeenCalledWith('/apps/course-management/task/42')
  })
})
