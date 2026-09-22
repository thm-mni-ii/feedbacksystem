import { defineStore } from 'pinia'
import { ref } from 'vue'

export type FbsLocale = 'de' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  const initialLocale = (localStorage.getItem('fbs_locale') as FbsLocale) || 'de'
  const currentLocale = ref<FbsLocale>(initialLocale === 'en' ? 'en' : 'de')

  function setLocale(locale: FbsLocale) {
    currentLocale.value = locale
    localStorage.setItem('fbs_locale', locale)
  }

  function toggleLocale() {
    const next = currentLocale.value === 'de' ? 'en' : 'de'
    setLocale(next)
  }

  return {
    currentLocale,
    setLocale,
    toggleLocale
  }
})
