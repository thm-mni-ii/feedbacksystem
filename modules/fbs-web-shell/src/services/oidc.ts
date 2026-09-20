import { UserManager, type UserManagerSettings, User } from 'oidc-client-ts'

const getAuthority = (): string => {
  if (import.meta.env.VITE_OIDC_ISSUER) {
    return import.meta.env.VITE_OIDC_ISSUER
  }
  // In typical local dev, identity service is on 8080 or proxied
  return window.location.port === '5173' ? 'http://localhost:8080' : window.location.origin
}

const oidcSettings: UserManagerSettings = {
  authority: getAuthority(),
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'fbs-test-client',
  redirect_uri: `${window.location.origin}/oauth2/callback`,
  response_type: 'code',
  scope: 'openid profile',
  post_logout_redirect_uri: `${window.location.origin}/`,
  automaticSilentRenew: true,
  silent_redirect_uri: `${window.location.origin}/oauth2/callback`,
  loadUserInfo: false
}

export const userManager = new UserManager(oidcSettings)

export async function login(): Promise<void> {
  await userManager.signinRedirect()
}

export async function handleCallback(): Promise<User | null> {
  const user = await userManager.signinCallback()
  return user ?? null
}

export async function logout(): Promise<void> {
  await userManager.signoutRedirect()
}

export async function getCurrentOidcUser(): Promise<User | null> {
  return await userManager.getUser()
}
