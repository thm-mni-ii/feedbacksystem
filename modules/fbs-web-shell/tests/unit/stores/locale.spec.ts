import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLocaleStore } from '@/stores/locale'

describe('Locale Store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('should initialize with default German locale when localStorage is empty', () => {
    const store = useLocaleStore()
    expect(store.currentLocale).toBe('de')
  })

  it('should initialize with stored locale from localStorage', () => {
    localStorage.setItem('fbs_locale', 'en')
    const store = useLocaleStore()
    expect(store.currentLocale).toBe('en')
  })

  it('should update locale and persist to localStorage', () => {
    const store = useLocaleStore()
    store.setLocale('en')
    expect(store.currentLocale).toBe('en')
    expect(localStorage.getItem('fbs_locale')).toBe('en')

    store.setLocale('de')
    expect(store.currentLocale).toBe('de')
    expect(localStorage.getItem('fbs_locale')).toBe('de')
  })

  it('should toggle between locales', () => {
    const store = useLocaleStore()
    expect(store.currentLocale).toBe('de')

    store.toggleLocale()
    expect(store.currentLocale).toBe('en')
    expect(localStorage.getItem('fbs_locale')).toBe('en')

    store.toggleLocale()
    expect(store.currentLocale).toBe('de')
    expect(localStorage.getItem('fbs_locale')).toBe('de')
  })
})
