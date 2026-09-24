import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ProfileView from '@/views/ProfileView.vue'
import { useAuthStore } from '@/stores/auth'
import { userGraphQlApi } from '@/services/graphql'

vi.mock('@/services/graphql', () => ({
  setGraphQlTokenGetter: vi.fn(),
  userGraphQlApi: {
    getCurrentUser: vi.fn(),
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    changeOwnPassword: vi.fn(),
    changeUserPassword: vi.fn(),
    updateGlobalRole: vi.fn(),
    deactivateUser: vi.fn()
  }
}))

const mockCurrentUser = {
  id: '1',
  username: 'admin',
  prename: 'Ada',
  surname: 'Admin',
  displayName: 'Ada Admin',
  email: 'admin@example.org',
  alias: 'lead',
  globalRole: 'ADMIN' as const,
  source: 'INTERNAL' as const,
  hasPassword: true,
  deleted: false
}

describe('ProfileView Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(userGraphQlApi.getCurrentUser).mockResolvedValue(mockCurrentUser)
  })

  it('should render user details from GraphQL currentUser', async () => {
    const authStore = useAuthStore()
    authStore.token = 'fake-token'

    const wrapper = mount(ProfileView)
    expect(wrapper.text()).toContain('Mein Benutzerprofil')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('admin')
      expect(wrapper.text()).toContain('Ada Admin')
      expect(wrapper.text()).toContain('admin@example.org')
      expect(wrapper.text()).toContain('Lokales Konto (Intern)')
    })
  })

  it('should display password change form for internal users', async () => {
    const authStore = useAuthStore()
    authStore.token = 'fake-token'

    const wrapper = mount(ProfileView)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Passwort ändern')
      expect(wrapper.text()).toContain('Aktuelles Passwort')
      expect(wrapper.text()).toContain('Neues Passwort')
    })
  })
})
