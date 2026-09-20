import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref<boolean>(localStorage.getItem('fbs_theme') === 'dark')

  function initTheme(themeInstance?: ReturnType<typeof useTheme>) {
    if (themeInstance) {
      themeInstance.global.name.value = isDark.value ? 'fbsDarkTheme' : 'fbsLightTheme'
    }
  }

  function toggleTheme(themeInstance?: ReturnType<typeof useTheme>) {
    isDark.value = !isDark.value
    localStorage.setItem('fbs_theme', isDark.value ? 'dark' : 'light')
    if (themeInstance) {
      themeInstance.global.name.value = isDark.value ? 'fbsDarkTheme' : 'fbsLightTheme'
    }
  }

  return {
    isDark,
    initTheme,
    toggleTheme
  }
})
