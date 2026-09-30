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
    regenerateSecret: vi.fn(),
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
    isActive: true,
    clientId: 'course-management',
    oidcEnabled: true,
    clientType: 'PUBLIC' as const,
    redirectUris: ['http://localhost:8082/oauth2/callback']
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
    isActive: true,
    clientId: 'sql-playground',
    oidcEnabled: true,
    clientType: 'CONFIDENTIAL' as const,
    clientSecret: 'test-secret-12345',
    redirectUris: ['http://localhost:3001/oauth2/callback']
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

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Kurse & Aufgaben')
      expect(wrapper.text()).toContain('SQL Playground')
      expect(wrapper.text()).toContain('course-management')
    })
  })

  it('should open create dialog with OIDC configuration section', async () => {
    const wrapper = mount(AppManagementView)
    const createBtn = wrapper.find('button.text-none.font-weight-bold')
    expect(createBtn.exists()).toBe(true)

    await createBtn.trigger('click')
    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Fachanwendung registrieren')
      expect(document.body.innerHTML).toContain('OAuth 2.0 / OIDC Client Konfiguration')
      expect(document.body.innerHTML).toContain('OIDC-Client aktivieren')
    })
  })

  it('should render correct number of app rows in table with OIDC client chips', async () => {
    const wrapper = mount(AppManagementView)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Kurse & Aufgaben')
    })
    expect(wrapper.findAll('tbody tr').length).toBe(2)
  })

  it('should open secret dialog and display client secret for confidential apps', async () => {
    const wrapper = mount(AppManagementView)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('SQL Playground')
    })

    const keyButtons = wrapper.findAll('button[title="OIDC Secret anzeigen / neu generieren"]')
    expect(keyButtons.length).toBeGreaterThan(0)

    // Click the key button for sql-playground (second app)
    await keyButtons[1].trigger('click')

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('OIDC Secret: SQL Playground')
      expect(document.body.innerHTML).toContain('CONFIDENTIAL')
      expect(document.body.innerHTML).toContain('Neues Secret generieren')
    })
  })

  it('should trigger secret regeneration when confirmed in dialog', async () => {
    vi.mocked(appProviderApi.regenerateSecret).mockResolvedValue({
      ...mockAllApps[1],
      clientSecret: 'newly-generated-secret-67890'
    })

    const wrapper = mount(AppManagementView)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('SQL Playground')
    })

    const keyButtons = wrapper.findAll('button[title="OIDC Secret anzeigen / neu generieren"]')
    await keyButtons[1].trigger('click')

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('OIDC Secret: SQL Playground')
    })

    // Find and click "Neues Secret generieren" button inside dialog
    const regenBtns = Array.from(document.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Neues Secret generieren')
    )
    expect(regenBtns.length).toBeGreaterThan(0)
    regenBtns[0].click()

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Client Secret neu generieren?')
    })

    // Find confirm button in confirmation modal
    const confirmBtns = Array.from(document.querySelectorAll('button')).filter(
      (b) => b.textContent?.includes('Secret neu generieren')
    )
    expect(confirmBtns.length).toBeGreaterThan(0)
    confirmBtns[confirmBtns.length - 1].click()

    await vi.waitFor(() => {
      expect(appProviderApi.regenerateSecret).toHaveBeenCalledWith('sql-playground')
    })
  })
})
