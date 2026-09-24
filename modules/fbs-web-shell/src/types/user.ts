export type GlobalRole = 'ADMIN' | 'MODERATOR' | 'USER'
export type AuthSource = 'INTERNAL' | 'SAML'

export interface User {
  id: string
  prename: string
  surname: string
  email: string
  username: string
  globalRole: GlobalRole
  alias?: string | null
  source: AuthSource
  hasPassword: boolean
  displayName: string
}

export interface UserPage {
  items: User[]
  totalCount: number
}

export interface UserFilterInput {
  query?: string | null
  globalRole?: GlobalRole | null
}

export interface PaginationInput {
  limit: number
  offset?: number | null
}

export interface CreateUserInput {
  prename: string
  surname: string
  email: string
  username: string
  password: string
  globalRole?: GlobalRole | null
  alias?: string | null
}

export interface UpdateUserInput {
  userId: string
  prename: string
  surname: string
  email: string
  alias?: string | null
}

export interface ChangeOwnPasswordInput {
  currentPassword: string
  newPassword: string
  newPasswordRepeat: string
}

export interface ChangeUserPasswordInput {
  userId: string
  newPassword: string
  newPasswordRepeat: string
}

export interface UpdateGlobalRoleInput {
  userId: string
  globalRole: GlobalRole
}
