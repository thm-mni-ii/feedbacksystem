import { UserManager, type UserManagerSettings, User } from 'oidc-client-ts'

const getOrigin = (): string => {
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8083'
}

const getAuthority = (): string => {
  if (import.meta.env.VITE_OIDC_AUTHORITY) {
    return import.meta.env.VITE_OIDC_AUTHORITY
  }
  if (import.meta.env.VITE_OIDC_ISSUER) {
    return import.meta.env.VITE_OIDC_ISSUER
  }
  return getOrigin()
}

const origin = getOrigin()

const oidcSettings: UserManagerSettings = {
  authority: getAuthority(),
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'fbs-web-shell',
  redirect_uri: `${origin}/oauth2/callback`,
  response_type: 'code',
  scope: 'openid profile email offline_access',
  post_logout_redirect_uri: `${origin}/`,
  automaticSilentRenew: true,
  silent_redirect_uri: `${origin}/oauth2/callback`,
  popup_redirect_uri: `${origin}/oauth2/callback`,
  accessTokenExpiringNotificationTimeInSeconds: 60,
  loadUserInfo: false,
  metadataSeed: {
    authorization_endpoint: `${origin}/oauth2/authorize`,
    token_endpoint: `${origin}/oauth2/token`,
    jwks_uri: `${origin}/oauth2/jwks`,
    userinfo_endpoint: `${origin}/userinfo`,
    end_session_endpoint: `${origin}/connect/logout`
  }
}

export const userManager = new UserManager(oidcSettings)

export async function login(redirectUrl?: string): Promise<void> {
  const args = redirectUrl ? { state: { redirectUrl } } : undefined
  await userManager.signinRedirect(args)
}

export async function reloginPopup(): Promise<User | null> {
  const user = await userManager.signinPopup()
  return user ?? null
}

export async function renewTokenSilent(): Promise<User | null> {
  try {
    const user = await userManager.signinSilent()
    return user ?? null
  } catch (error) {
    console.warn('Silent token renewal failed:', error)
    return null
  }
}

export async function handleCallback(): Promise<User | null> {
  const user = await userManager.signinCallback()
  return user ?? null
}

export async function handleSilentCallback(): Promise<void> {
  await userManager.signinSilentCallback()
}

export async function handlePopupCallback(): Promise<void> {
  await userManager.signinPopupCallback()
}

export async function logout(): Promise<void> {
  await userManager.signoutRedirect()
}

export async function getCurrentOidcUser(): Promise<User | null> {
  return await userManager.getUser()
}
