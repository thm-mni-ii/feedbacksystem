import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserManagementView from '@/views/admin/UserManagementView.vue'
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

const mockUsersPage = {
  totalCount: 2,
  items: [
    {
      id: '1',
      username: 'admin',
      prename: 'Ada',
      surname: 'Admin',
      displayName: 'Ada Admin',
      email: 'admin@example.org',
      alias: null,
      globalRole: 'ADMIN' as const,
      source: 'INTERNAL' as const,
      hasPassword: true,
      deleted: false
    },
    {
      id: '2',
      username: 'saml_student',
      prename: 'Sam',
      surname: 'Student',
      displayName: 'Sam Student',
      email: 'saml@thm.de',
      alias: 'sammy',
      globalRole: 'USER' as const,
      source: 'SAML' as const,
      hasPassword: false,
      deleted: false
    }
  ]
}

describe('UserManagementView Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(userGraphQlApi.getUsers).mockResolvedValue(mockUsersPage)
  })

  it('should render page heading and user table with source badges', async () => {
    const wrapper = mount(UserManagementView)
    expect(wrapper.text()).toContain('Benutzerverwaltung')
    expect(wrapper.text()).toContain('Neuen internen Benutzer anlegen')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('admin')
      expect(wrapper.text()).toContain('Ada Admin')
      expect(wrapper.text()).toContain('saml_student')
      expect(wrapper.text()).toContain('Sam Student')
      expect(wrapper.text()).toContain('Intern')
      expect(wrapper.text()).toContain('SAML')
    })
  })

  it('should open create internal user dialog on button click', async () => {
    const wrapper = mount(UserManagementView)
    const createBtn = wrapper.find('button.text-none.font-weight-bold')
    expect(createBtn.exists()).toBe(true)

    await createBtn.trigger('click')
    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Neuen internen Benutzer anlegen')
    })
  })

  it('should render edit button for users in the list', async () => {
    const wrapper = mount(UserManagementView)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Ada Admin')
    })
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })
})
