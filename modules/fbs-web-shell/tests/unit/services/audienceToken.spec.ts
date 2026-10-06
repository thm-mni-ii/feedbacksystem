import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAudienceToken,
  getCachedAudienceToken,
  getRemainingValiditySeconds,
  clearAudienceTokens,
  setAudienceAuthTokenGetter,
  audienceApiClient
} from '@/services/audienceToken'

describe('Audience Token Service', () => {
  beforeEach(() => {
    clearAudienceTokens()
    setAudienceAuthTokenGetter(() => 'mock-shell-token')
    vi.clearAllMocks()
  })

  it('should return exchanged audience token from API and cache it', async () => {
    const postSpy = vi.spyOn(audienceApiClient, 'post').mockResolvedValueOnce({
      data: {
        accessToken: 'scoped-course-mgmt-token',
        tokenType: 'Bearer',
        expiresIn: 600,
        audience: 'course-management'
      }
    })

    const token = await getAudienceToken('course-management')
    expect(token).toBe('scoped-course-mgmt-token')
    expect(postSpy).toHaveBeenCalledWith('/api/v1/auth/token/exchange', {
      targetAudience: 'course-management'
    })

    // Second call should return cached token without invoking API again
    const cachedToken = await getAudienceToken('course-management')
    expect(cachedToken).toBe('scoped-course-mgmt-token')
    expect(postSpy).toHaveBeenCalledTimes(1)

    const cachedEntry = getCachedAudienceToken('course-management')
    expect(cachedEntry?.audience).toBe('course-management')
    expect(getRemainingValiditySeconds('course-management')).toBeGreaterThan(500)
  })

  it('should force refresh when forceRefresh is true', async () => {
    const postSpy = vi.spyOn(audienceApiClient, 'post')
      .mockResolvedValueOnce({
        data: {
          accessToken: 'initial-token',
          expiresIn: 600,
          audience: 'sql-playground'
        }
      })
      .mockResolvedValueOnce({
        data: {
          accessToken: 'refreshed-token',
          expiresIn: 600,
          audience: 'sql-playground'
        }
      })

    const first = await getAudienceToken('sql-playground')
    expect(first).toBe('initial-token')

    const second = await getAudienceToken('sql-playground', true)
    expect(second).toBe('refreshed-token')
    expect(postSpy).toHaveBeenCalledTimes(2)
  })

  it('should fall back to shell base token when API call fails', async () => {
    vi.spyOn(audienceApiClient, 'post').mockRejectedValueOnce(new Error('Network error'))

    const token = await getAudienceToken('fbs-qcm')
    expect(token).toBe('mock-shell-token')
  })

  it('should clear cached tokens on clearAudienceTokens', async () => {
    vi.spyOn(audienceApiClient, 'post').mockResolvedValueOnce({
      data: {
        accessToken: 'cached-token',
        expiresIn: 600,
        audience: 'course-management'
      }
    })

    await getAudienceToken('course-management')
    expect(getCachedAudienceToken('course-management')).not.toBeNull()

    clearAudienceTokens()
    expect(getCachedAudienceToken('course-management')).toBeNull()
  })
})
