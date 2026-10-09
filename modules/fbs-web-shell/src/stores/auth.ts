import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import type { User as OidcUser } from 'oidc-client-ts'
import {
  userManager,
  login as oidcLogin,
  logout as oidcLogout,
  getCurrentOidcUser,
  reloginPopup
} from '@/services/oidc'
import { setAuthTokenGetter } from '@/services/api'
import { setGraphQlTokenGetter } from '@/services/graphql'
import { setAudienceAuthTokenGetter, clearAudienceTokens } from '@/services/audienceToken'
import type { GlobalRole } from '@/types/user'

interface JwtClaims {
  sub?: string
  id?: number | string
  userId?: number | string
  preferred_username?: string
  username?: string
  email?: string
  given_name?: string
  family_name?: string
  name?: string
  global_role?: GlobalRole
  globalRole?: GlobalRole
  roles?: string[]
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  const oidcUser = ref<OidcUser | null>(null)
  const token = ref<string | null>(null)
  const claims = ref<JwtClaims | null>(null)
  const isInitialized = ref(false)
  const isSessionExpired = ref(false)

  // Configure global API token getters
  setAuthTokenGetter(() => token.value)
  setGraphQlTokenGetter(() => token.value)
  setAudienceAuthTokenGetter(() => token.value)

  const isAuthenticated = computed(() => {
    return !!token.value && (oidcUser.value ? !oidcUser.value.expired : true) && !isSessionExpired.value
  })

  const globalRole = computed<GlobalRole>(() => {
    if (claims.value?.global_role) {
      return claims.value.global_role
    }
    if (claims.value?.globalRole) {
      return claims.value.globalRole
    }
    if (claims.value?.roles?.includes('ROLE_ADMIN')) return 'ADMIN'
    if (claims.value?.roles?.includes('ROLE_MODERATOR')) return 'MODERATOR'
    return 'USER'
  })

  const isAdmin = computed(() => globalRole.value === 'ADMIN')
  const isModerator = computed(() => globalRole.value === 'MODERATOR' || globalRole.value === 'ADMIN')

  const preferredUsername = computed(() => {
    if (claims.value?.preferred_username) return claims.value.preferred_username
    if (claims.value?.username) return claims.value.username
    if (claims.value?.sub && !/^\d+$/.test(claims.value.sub)) return claims.value.sub
    return 'Benutzer'
  })

  const displayName = computed(() => {
    if (claims.value?.name && claims.value.name.trim()) {
      return claims.value.name.trim()
    }
    if (claims.value?.given_name && claims.value?.family_name) {
      return `${claims.value.given_name} ${claims.value.family_name}`.trim()
    }
    if (claims.value?.given_name) {
      return claims.value.given_name.trim()
    }
    return preferredUsername.value
  })

  const email = computed(() => claims.value?.email || '')

  function parseTokenClaims(accessToken: string): JwtClaims | null {
    try {
      return jwtDecode<JwtClaims>(accessToken)
    } catch (e) {
      console.error('Failed to decode JWT claims:', e)
      return null
    }
  }

  function setSession(user: OidcUser | null) {
    oidcUser.value = user
    if (user?.access_token) {
      token.value = user.access_token
      claims.value = parseTokenClaims(user.access_token)
      isSessionExpired.value = false
    } else {
      token.value = null
      claims.value = null
    }
  }

  async function initAuth(): Promise<void> {
    if (isInitialized.value) return
    try {
      const user = await getCurrentOidcUser()
      if (user && !user.expired) {
        setSession(user)
      } else if (user?.expired) {
        try {
          const renewedUser = await userManager.signinSilent()
          setSession(renewedUser)
        } catch {
          setSession(null)
          isSessionExpired.value = true
        }
      }
    } catch (e) {
      console.warn('OIDC initialization error:', e)
      setSession(null)
    } finally {
      isInitialized.value = true
    }

    userManager.events?.addUserLoaded?.((loadedUser) => {
      setSession(loadedUser)
      isSessionExpired.value = false
    })

    userManager.events?.addUserUnloaded?.(() => {
      setSession(null)
      isSessionExpired.value = true
      clearAudienceTokens()
    })

    userManager.events?.addSilentRenewError?.(async (error) => {
      console.warn('OIDC silent renew error:', error)
      const currentUser = await getCurrentOidcUser()
      if (!currentUser || currentUser.expired) {
        isSessionExpired.value = true
      }
    })

    userManager.events?.addAccessTokenExpired?.(async () => {
      try {
        const renewedUser = await userManager.signinSilent()
        if (renewedUser && !renewedUser.expired) {
          setSession(renewedUser)
          isSessionExpired.value = false
          return
        }
      } catch (e) {
        console.warn('Renewal after access token expiration failed:', e)
      }
      isSessionExpired.value = true
    })
  }

  async function login(redirectUrl?: string): Promise<void> {
    await oidcLogin(redirectUrl)
  }

  async function reloginInPlace(): Promise<boolean> {
    try {
      const user = await reloginPopup()
      if (user && !user.expired) {
        setSession(user)
        isSessionExpired.value = false
        return true
      }
      return false
    } catch (error) {
      console.warn('In-place re-login popup failed:', error)
      return false
    }
  }

  async function logout(): Promise<void> {
    setSession(null)
    clearAudienceTokens()
    await oidcLogout()
  }

  function getToken(): string | null {
    return token.value
  }

  return {
    oidcUser,
    token,
    claims,
    isInitialized,
    isSessionExpired,
    isAuthenticated,
    globalRole,
    isAdmin,
    isModerator,
    displayName,
    preferredUsername,
    email,
    initAuth,
    login,
    reloginInPlace,
    logout,
    getToken,
    setSession
  }
})
