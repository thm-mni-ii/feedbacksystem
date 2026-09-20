import axios from 'axios'
import type {
  User,
  UserPage,
  UserFilterInput,
  PaginationInput,
  CreateUserInput,
  UpdateUserInput,
  ChangeOwnPasswordInput,
  ChangeUserPasswordInput,
  UpdateGlobalRoleInput
} from '@/types/user'

let tokenGetter: (() => string | null) | null = null

export function setGraphQlTokenGetter(getter: () => string | null) {
  tokenGetter = getter
}

async function graphqlRequest<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (tokenGetter) {
    const token = tokenGetter()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await axios.post(
    '/graphql',
    {
      query,
      variables
    },
    { headers }
  )

  if (response.data.errors && response.data.errors.length > 0) {
    const firstError = response.data.errors[0]
    throw new Error(firstError.message || 'GraphQL Error')
  }

  return response.data.data
}

export const userGraphQlApi = {
  async getCurrentUser(): Promise<User | null> {
    const query = `
      query GetCurrentUser {
        currentUser {
          id
          prename
          surname
          email
          username
          globalRole
          alias
          source
          hasPassword
          displayName
        }
      }
    `
    const data = await graphqlRequest<{ currentUser: User | null }>(query)
    return data.currentUser
  },

  async getUsers(filter?: UserFilterInput, pagination?: PaginationInput): Promise<UserPage> {
    const query = `
      query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
        users(filter: $filter, pagination: $pagination) {
          totalCount
          items {
            id
            prename
            surname
            email
            username
            globalRole
            alias
            source
            hasPassword
            displayName
          }
        }
      }
    `
    const data = await graphqlRequest<{ users: UserPage }>(query, { filter, pagination })
    return data.users
  },

  async createUser(input: CreateUserInput): Promise<User> {
    const query = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          prename
          surname
          email
          username
          globalRole
          alias
          source
          hasPassword
          displayName
        }
      }
    `
    const data = await graphqlRequest<{ createUser: User }>(query, { input })
    return data.createUser
  },

  async updateUser(input: UpdateUserInput): Promise<User> {
    const query = `
      mutation UpdateUser($input: UpdateUserInput!) {
        updateUser(input: $input) {
          id
          prename
          surname
          email
          username
          globalRole
          alias
          source
          hasPassword
          displayName
        }
      }
    `
    const data = await graphqlRequest<{ updateUser: User }>(query, { input })
    return data.updateUser
  },

  async changeOwnPassword(input: ChangeOwnPasswordInput): Promise<boolean> {
    const query = `
      mutation ChangeOwnPassword($input: ChangeOwnPasswordInput!) {
        changeOwnPassword(input: $input)
      }
    `
    const data = await graphqlRequest<{ changeOwnPassword: boolean }>(query, { input })
    return data.changeOwnPassword
  },

  async changeUserPassword(input: ChangeUserPasswordInput): Promise<boolean> {
    const query = `
      mutation ChangeUserPassword($input: ChangeUserPasswordInput!) {
        changeUserPassword(input: $input)
      }
    `
    const data = await graphqlRequest<{ changeUserPassword: boolean }>(query, { input })
    return data.changeUserPassword
  },

  async updateGlobalRole(input: UpdateGlobalRoleInput): Promise<User> {
    const query = `
      mutation UpdateGlobalRole($input: UpdateGlobalRoleInput!) {
        updateGlobalRole(input: $input) {
          id
          globalRole
        }
      }
    `
    const data = await graphqlRequest<{ updateGlobalRole: User }>(query, { input })
    return data.updateGlobalRole
  },

  async deactivateUser(userId: string): Promise<boolean> {
    const query = `
      mutation DeactivateUser($userId: ID!) {
        deactivateUser(userId: $userId)
      }
    `
    const data = await graphqlRequest<{ deactivateUser: boolean }>(query, { userId })
    return data.deactivateUser
  }
}
