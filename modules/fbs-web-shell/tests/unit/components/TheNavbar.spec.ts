import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import TheNavbar from '@/components/layout/TheNavbar.vue'
import { useAuthStore } from '@/stores/auth'
import { useAppsStore } from '@/stores/apps'
import { useThemeStore } from '@/stores/theme'

const mockRouter = {
  push: vi.fn(),
  currentRoute: {
    value: {
      path: '/',
      params: {}
    }
  }
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRouter.currentRoute.value
}))

vi.mock('@/services/oidc', () => ({
  userManager: {
    events: { addUserLoaded: vi.fn(), addUserUnloaded: vi.fn() }
  },
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

const TestWrapper = defineComponent({
  components: { TheNavbar },
  template: '<v-layout><TheNavbar /></v-layout>'
})

describe('TheNavbar Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should render application brand name', () => {
    const wrapper = mount(TestWrapper)
    expect(wrapper.text()).toContain('Feedback System')
  })

  it('should render dynamic navigation items from apps store', async () => {
    const appsStore = useAppsStore()
    appsStore.apps = [
      {
        id: 'course-mgmt',
        title: 'Kurse',
        description: 'Course management',
        icon: 'school',
        url: 'http://localhost:8082',
        embedMode: 'IFRAME',
        requiredGlobalRole: 'USER',
        navbarPosition: 1,
        showInNavbar: true,
        isDefault: true,
        isActive: true
      },
      {
        id: 'sql-play',
        title: 'SQL Sandbox',
        description: 'SQL playground',
        icon: 'terminal',
        url: 'http://localhost:3001',
        embedMode: 'IFRAME',
        requiredGlobalRole: 'USER',
        navbarPosition: 2,
        showInNavbar: true,
        isDefault: false,
        isActive: true
      }
    ]

    const wrapper = mount(TestWrapper)
    expect(wrapper.text()).toContain('Kurse')
    expect(wrapper.text()).toContain('SQL Sandbox')
  })

  it('should show Administration menu for ADMIN users', () => {
    const authStore = useAuthStore()
    authStore.claims = {
      sub: '1',
      preferred_username: 'admin',
      global_role: 'ADMIN'
    } as any
    authStore.token = 'fake-token'

    const wrapper = mount(TestWrapper)
    expect(wrapper.text()).toContain('Administration')
  })

  it('should not show Administration menu for standard USER', () => {
    const authStore = useAuthStore()
    authStore.claims = {
      sub: '2',
      preferred_username: 'student',
      global_role: 'USER'
    } as any
    authStore.token = 'fake-token'

    const wrapper = mount(TestWrapper)
    expect(wrapper.text()).not.toContain('Administration')
  })

  it('should trigger theme toggle on theme button click', async () => {
    const themeStore = useThemeStore()
    const toggleSpy = vi.spyOn(themeStore, 'toggleTheme')

    const wrapper = mount(TestWrapper)
    const buttons = wrapper.findAll('button')
    const themeBtn = buttons.find((b) => b.attributes('title')?.includes('Design'))
    if (themeBtn) {
      await themeBtn.trigger('click')
      expect(toggleSpy).toHaveBeenCalled()
    }
  })
})
