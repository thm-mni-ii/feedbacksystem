export type EmbedMode = 'IFRAME' | 'EXTERNAL'
export type AppRequiredRole = 'ALL' | 'USER' | 'MODERATOR' | 'ADMIN'

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
  clientId?: string | null
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
  clientId?: string | null
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
  clientId?: string | null
}
