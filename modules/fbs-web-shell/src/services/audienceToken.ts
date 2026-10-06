import axios from 'axios'

export interface CachedAudienceToken {
  accessToken: string
  expiresIn: number
  expiresAt: number
  audience: string
}

export interface TokenExchangeResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  audience: string
}

const tokenCache = new Map<string, CachedAudienceToken>()
let authTokenGetter: (() => string | null) | null = null

export function setAudienceAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter
}

export const audienceApiClient = axios.create({
  baseURL: ''
})

audienceApiClient.interceptors.request.use((config: any) => {
  if (authTokenGetter) {
    const token = authTokenGetter()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export async function getAudienceToken(
  providerId: string,
  forceRefresh = false
): Promise<string> {
  const cleanProviderId = providerId.trim()
  if (!cleanProviderId) {
    return authTokenGetter ? (authTokenGetter() || '') : ''
  }

  const cached = tokenCache.get(cleanProviderId)
  const now = Date.now()

  // Return cached token if it is valid for at least 45 more seconds
  if (!forceRefresh && cached && cached.expiresAt - now > 45 * 1000) {
    return cached.accessToken
  }

  try {
    const response = await audienceApiClient.post<TokenExchangeResponse>(
      '/api/v1/auth/token/exchange',
      { targetAudience: cleanProviderId }
    )

    if (response.data && response.data.accessToken) {
      const expiresIn = response.data.expiresIn || 600
      const entry: CachedAudienceToken = {
        accessToken: response.data.accessToken,
        expiresIn,
        expiresAt: now + expiresIn * 1000,
        audience: response.data.audience || cleanProviderId
      }
      tokenCache.set(cleanProviderId, entry)
      return entry.accessToken
    }
  } catch (error) {
    console.warn(
      `Could not exchange token for audience '${cleanProviderId}', falling back to shell token:`,
      error
    )
  }

  // Fallback to base token if token exchange fails
  const fallback = authTokenGetter ? authTokenGetter() : null
  return fallback || ''
}

export function getCachedAudienceToken(providerId: string): CachedAudienceToken | null {
  return tokenCache.get(providerId.trim()) || null
}

export function getRemainingValiditySeconds(providerId: string): number {
  const cached = tokenCache.get(providerId.trim())
  if (!cached) return 0
  const remainingMs = cached.expiresAt - Date.now()
  return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0
}

export function clearAudienceTokens(): void {
  tokenCache.clear()
}
