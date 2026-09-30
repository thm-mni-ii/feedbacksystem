export type EmbedMode = 'IFRAME' | 'EXTERNAL'
export type AppRequiredRole = 'ALL' | 'USER' | 'MODERATOR' | 'ADMIN'
export type OidcClientType = 'PUBLIC' | 'CONFIDENTIAL'

export interface ApplicationProvider {
  id: string
  title: string
  description?: string | null
  icon: string
  url: string
  embedMode: EmbedMode
  requiredGlobalRole: AppRequiredRole
  navbarPosition: number
  showInNavbar: boolean
  isDefault: boolean
  isActive: boolean
  isInternal?: boolean
  clientId?: string | null
  oidcEnabled?: boolean
  redirectUris?: string[]
  postLogoutRedirectUris?: string[]
  clientType?: OidcClientType
  scopes?: string[]
  clientSecret?: string | null
  hasClientSecret?: boolean
  createdAt?: string | null
  updatedAt?: string | null
}

export interface CreateApplicationProviderInput {
  id: string
  title: string
  description?: string | null
  icon: string
  url: string
  embedMode: EmbedMode
  requiredGlobalRole: AppRequiredRole
  navbarPosition: number
  showInNavbar: boolean
  isDefault: boolean
  isActive: boolean
  isInternal?: boolean
  clientId?: string | null
  oidcEnabled?: boolean
  redirectUris?: string[]
  postLogoutRedirectUris?: string[]
  clientType?: OidcClientType
  scopes?: string[]
  clientSecret?: string | null
}

export interface UpdateApplicationProviderInput {
  title: string
  description?: string | null
  icon: string
  url: string
  embedMode: EmbedMode
  requiredGlobalRole: AppRequiredRole
  navbarPosition: number
  showInNavbar: boolean
  isDefault: boolean
  isActive: boolean
  isInternal?: boolean
  clientId?: string | null
  oidcEnabled?: boolean
  redirectUris?: string[]
  postLogoutRedirectUris?: string[]
  clientType?: OidcClientType
  scopes?: string[]
  clientSecret?: string | null
}
