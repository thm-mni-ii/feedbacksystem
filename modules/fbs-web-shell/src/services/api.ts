import axios, { type AxiosInstance } from 'axios'
import type {
  ApplicationProvider,
  CreateApplicationProviderInput,
  UpdateApplicationProviderInput
} from '@/types/app'

let tokenGetter: (() => string | null) | null = null

export function setAuthTokenGetter(getter: () => string | null) {
  tokenGetter = getter
}

const apiClient: AxiosInstance = axios.create({
  baseURL: ''
})

apiClient.interceptors.request.use((config) => {
  if (tokenGetter) {
    const token = tokenGetter()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const appProviderApi = {
  async getVisibleProviders(): Promise<ApplicationProvider[]> {
    const response = await apiClient.get<ApplicationProvider[]>('/api/v2/application-providers')
    return response.data
  },

  async getAllProvidersAdmin(): Promise<ApplicationProvider[]> {
    const response = await apiClient.get<ApplicationProvider[]>('/api/v2/admin/application-providers')
    return response.data
  },

  async getProviderById(id: string): Promise<ApplicationProvider> {
    const response = await apiClient.get<ApplicationProvider>(`/api/v2/admin/application-providers/${id}`)
    return response.data
  },

  async createProvider(data: CreateApplicationProviderInput): Promise<ApplicationProvider> {
    const response = await apiClient.post<ApplicationProvider>('/api/v2/admin/application-providers', data)
    return response.data
  },

  async updateProvider(id: string, data: UpdateApplicationProviderInput): Promise<ApplicationProvider> {
    const response = await apiClient.put<ApplicationProvider>(`/api/v2/admin/application-providers/${id}`, data)
    return response.data
  },

  async deleteProvider(id: string): Promise<void> {
    await apiClient.delete(`/api/v2/admin/application-providers/${id}`)
  }
}
