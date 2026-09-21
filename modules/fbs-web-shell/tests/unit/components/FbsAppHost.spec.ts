import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import FbsAppHost from '@/components/FbsAppHost.vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

vi.mock('@/services/oidc', () => ({
  userManager: {
    events: { addUserLoaded: vi.fn(), addUserUnloaded: vi.fn() }
  },
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentOidcUser: vi.fn().mockResolvedValue(null)
}))

describe('FbsAppHost Component', () => {
  let fakeContentWindow: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    fakeContentWindow = {
      postMessage: vi.fn()
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render iframe with correct attributes and source', () => {
    const wrapper = mount(FbsAppHost, {
      props: {
        src: 'http://localhost:8082/my-courses',
        providerId: 'course-management',
        appTitle: 'Kurse & Aufgaben'
      }
    })

    const iframe = wrapper.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).toBe('http://localhost:8082/my-courses')
    expect(iframe.attributes('title')).toBe('Kurse & Aufgaben')
    expect(iframe.attributes('sandbox')).toContain('allow-scripts')
    expect(iframe.attributes('sandbox')).toContain('allow-same-origin')
  })

  it('should respond to FBS_INIT_HANDSHAKE with FBS_HANDSHAKE_ACK and token', async () => {
    const authStore = useAuthStore()
    authStore.token = 'valid-bearer-token'
    const themeStore = useThemeStore()
    themeStore.isDark = false

    const wrapper = mount(FbsAppHost, {
      props: {
        src: 'http://localhost:8082',
        providerId: 'course-management',
        appTitle: 'Kurse'
      }
    })

    const iframeElement = wrapper.find('iframe').element as HTMLIFrameElement
    Object.defineProperty(iframeElement, 'contentWindow', {
      value: fakeContentWindow,
      writable: true
    })

    // Simulate postMessage event from the iframe
    const messageEvent = new MessageEvent('message', {
      data: { type: 'FBS_INIT_HANDSHAKE', providerId: 'course-management' },
      source: fakeContentWindow as any
    })
    window.dispatchEvent(messageEvent)

    expect(fakeContentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'FBS_HANDSHAKE_ACK',
        theme: 'light',
        locale: 'de',
        providerId: 'course-management'
      }),
      '*'
    )

    expect(fakeContentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'FBS_AUTH_TOKEN_RESPONSE',
        accessToken: 'valid-bearer-token'
      }),
      '*'
    )
  })

  it('should respond to FBS_REQUEST_AUTH_TOKEN with FBS_AUTH_TOKEN_RESPONSE', async () => {
    const authStore = useAuthStore()
    authStore.token = 'refreshed-token-123'

    const wrapper = mount(FbsAppHost, {
      props: {
        src: 'http://localhost:3001',
        providerId: 'sql-playground',
        appTitle: 'SQL Playground'
      }
    })

    const iframeElement = wrapper.find('iframe').element as HTMLIFrameElement
    Object.defineProperty(iframeElement, 'contentWindow', {
      value: fakeContentWindow,
      writable: true
    })

    const messageEvent = new MessageEvent('message', {
      data: { type: 'FBS_REQUEST_AUTH_TOKEN' },
      source: fakeContentWindow as any
    })
    window.dispatchEvent(messageEvent)

    expect(fakeContentWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'FBS_AUTH_TOKEN_RESPONSE',
        accessToken: 'refreshed-token-123',
        expiresIn: 3600
      }),
      '*'
    )
  })

  it('should handle FBS_NAVIGATE internal and external routing', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const wrapper = mount(FbsAppHost, {
      props: {
        src: 'http://localhost:8082',
        providerId: 'course-management'
      }
    })

    const iframeElement = wrapper.find('iframe').element as HTMLIFrameElement
    Object.defineProperty(iframeElement, 'contentWindow', {
      value: fakeContentWindow,
      writable: true
    })

    // Internal navigation
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'FBS_NAVIGATE', path: '/admin/apps', external: false },
        source: fakeContentWindow as any
      })
    )
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/apps')

    // External navigation
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { type: 'FBS_NAVIGATE', path: 'https://thm.de', external: true },
        source: fakeContentWindow as any
      })
    )
    expect(openSpy).toHaveBeenCalledWith('https://thm.de', '_blank')
  })
})
