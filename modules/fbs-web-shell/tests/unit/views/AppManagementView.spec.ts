import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AppManagementView from '@/views/admin/AppManagementView.vue'
import { appProviderApi } from '@/services/api'

vi.mock('@/services/api', () => ({
  setAuthTokenGetter: vi.fn(),
  appProviderApi: {
    getAllProvidersAdmin: vi.fn(),
    getVisibleProviders: vi.fn(),
    createProvider: vi.fn(),
    updateProvider: vi.fn(),
    deleteProvider: vi.fn()
  }
}))

const mockAllApps = [
  {
    id: 'course-management',
    title: 'Kurse & Aufgaben',
    description: 'Course management system',
    icon: 'school',
    url: 'http://localhost:8082',
    embedMode: 'IFRAME' as const,
    requiredGlobalRole: 'USER' as const,
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
    embedMode: 'IFRAME' as const,
    requiredGlobalRole: 'USER' as const,
    navbarPosition: 20,
    showInNavbar: true,
    isDefault: false,
    isActive: true
  }
]

describe('AppManagementView Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(appProviderApi.getAllProvidersAdmin).mockResolvedValue(mockAllApps)
  })

  it('should render page heading and app table', async () => {
    const wrapper = mount(AppManagementView)
    expect(wrapper.text()).toContain('Anwendungsverwaltung')
    expect(wrapper.text()).toContain('Neue Anwendung registrieren')

    // Wait for async loadApps
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Kurse & Aufgaben')
      expect(wrapper.text()).toContain('SQL Playground')
    })
  })

  it('should open create dialog when clicking register button', async () => {
    const wrapper = mount(AppManagementView)
    const createBtn = wrapper.find('button.text-none.font-weight-bold')
    expect(createBtn.exists()).toBe(true)

    await createBtn.trigger('click')
    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Fachanwendung registrieren')
    })
  })

  it('should render correct number of app rows in table', async () => {
    const wrapper = mount(AppManagementView)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Kurse & Aufgaben')
    })
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })
})
