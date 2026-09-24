import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'

describe('Theme Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should initialize with default light theme if localStorage is empty', () => {
    const themeStore = useThemeStore()
    expect(themeStore.isDark).toBe(false)
  })

  it('should toggle theme and update localStorage', () => {
    const themeStore = useThemeStore()
    expect(themeStore.isDark).toBe(false)

    themeStore.toggleTheme()
    expect(themeStore.isDark).toBe(true)
    expect(localStorage.getItem('fbs_theme')).toBe('dark')

    themeStore.toggleTheme()
    expect(themeStore.isDark).toBe(false)
    expect(localStorage.getItem('fbs_theme')).toBe('light')
  })

  it('should update vuetify theme instance on toggle', () => {
    const themeStore = useThemeStore()
    const fakeThemeInstance: any = {
      global: {
        name: { value: 'fbsLightTheme' }
      }
    }

    themeStore.toggleTheme(fakeThemeInstance)
    expect(fakeThemeInstance.global.name.value).toBe('fbsDarkTheme')

    themeStore.toggleTheme(fakeThemeInstance)
    expect(fakeThemeInstance.global.name.value).toBe('fbsLightTheme')
  })
})
