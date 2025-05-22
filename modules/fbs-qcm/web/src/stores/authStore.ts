import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type JwtToken from '@/model/JwtToken'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('jsessionid'))
  const decodedToken = ref<JwtToken | null>(null)

  if (token.value) {
    decodedToken.value = jwtDecode<JwtToken>(token.value)
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('jsessionid', newToken)
    decodedToken.value = jwtDecode<JwtToken>(newToken)
    localStorage.setItem('userId', decodedToken.value?.id || '')
  }

  const clearToken = () => {
    token.value = null
    decodedToken.value = null
    localStorage.removeItem('jsessionid')
  }

  return { token, decodedToken, setToken, clearToken }
})
