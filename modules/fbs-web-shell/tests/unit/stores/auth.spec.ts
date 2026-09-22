import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock oidc service
vi.mock('@/services/oidc', () => ({
  userManager: {
    signinSilent: vi.fn(),
    events: {
      addUserLoaded: vi.fn(),
      addUserUnloaded: vi.fn()
    }
  },
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

// Helper to create a fake JWT token
function createFakeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with default unauthenticated state', () => {
    const authStore = useAuthStore()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.isAdmin).toBe(false)
    expect(authStore.isModerator).toBe(false)
    expect(authStore.globalRole).toBe('USER')
    expect(authStore.displayName).toBe('Benutzer')
    expect(authStore.email).toBe('')
  })

  it('should set session and decode admin claims correctly', () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '123',
      preferred_username: 'admin',
      email: 'admin@example.org',
      given_name: 'Ada',
      family_name: 'Admin',
      global_role: 'ADMIN'
    })

    const fakeOidcUser: any = {
      access_token: token,
      expired: false,
      profile: { sub: '123' }
    }

    authStore.setSession(fakeOidcUser)

    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isAdmin).toBe(true)
    expect(authStore.isModerator).toBe(true)
    expect(authStore.globalRole).toBe('ADMIN')
    expect(authStore.displayName).toBe('Ada Admin')
    expect(authStore.email).toBe('admin@example.org')
    expect(authStore.getToken()).toBe(token)
  })

  it('should decode moderator claims correctly', () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '456',
      preferred_username: 'mod_user',
      email: 'mod@example.org',
      given_name: 'Max',
      family_name: 'Mod',
      global_role: 'MODERATOR'
    })

    const fakeOidcUser: any = {
      access_token: token,
      expired: false,
      profile: { sub: '456' }
    }

    authStore.setSession(fakeOidcUser)

    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isAdmin).toBe(false)
    expect(authStore.isModerator).toBe(true)
    expect(authStore.globalRole).toBe('MODERATOR')
    expect(authStore.displayName).toBe('Max Mod')
  })

  it('should clear session on logout', async () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '123',
      preferred_username: 'admin',
      global_role: 'ADMIN'
    })

    authStore.setSession({ access_token: token, expired: false } as any)
    expect(authStore.isAuthenticated).toBe(true)

    await authStore.logout()
    expect(authStore.isAuthenticated).toBe(false)
    expect(authStore.getToken()).toBeNull()
    expect(authStore.claims).toBeNull()
  })

  it('should fall back to preferred_username when given_name/family_name are missing', () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '789',
      preferred_username: 'student42',
      global_role: 'USER'
    })

    authStore.setSession({ access_token: token, expired: false } as any)
    expect(authStore.displayName).toBe('student42')
    expect(authStore.globalRole).toBe('USER')
    expect(authStore.isAdmin).toBe(false)
  })

  it('should decode camelCase globalRole claim from identity service', () => {
    const authStore = useAuthStore()
    const token = createFakeJwt({
      sub: '1',
      username: 'admin',
      preferred_username: 'admin',
      name: 'System Admin',
      globalRole: 'ADMIN'
    })

    authStore.setSession({ access_token: token, expired: false } as any)
    expect(authStore.globalRole).toBe('ADMIN')
    expect(authStore.isAdmin).toBe(true)
    expect(authStore.displayName).toBe('System Admin')
    expect(authStore.preferredUsername).toBe('admin')
  })

  it('should forward redirectUrl when calling login', async () => {
    const authStore = useAuthStore()
    const { login: mockOidcLogin } = await import('@/services/oidc')

    await authStore.login('/apps/sql-playground')
    expect(mockOidcLogin).toHaveBeenCalledWith('/apps/sql-playground')
  })
})
