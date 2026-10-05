import { describe, expect, it } from 'vitest'
import { createSession } from '@/composables/algorithm'
import { getOpenCourseSession } from '@/composables/studyProgress'

describe('open course session selection', () => {
  it('does not resurrect an older open session after completing a newer one', () => {
    const older = { ...createSession('student', []), courseId: '1', startedAt: 10, updatedAt: 40 }
    const newer = {
      ...createSession('student', []),
      courseId: '1',
      startedAt: 20,
      updatedAt: 30,
      completedAt: 30
    }
    expect(getOpenCourseSession([older, newer], '1')).toBeNull()
    expect(getOpenCourseSession([newer, older], '1')).toBeNull()
  })

  it('resumes only the most recently started session in the requested course', () => {
    const older = { ...createSession('student', []), courseId: '1', startedAt: 10, updatedAt: 40 }
    const newer = { ...createSession('student', []), courseId: '1', startedAt: 20, updatedAt: 30 }
    const other = { ...createSession('student', []), courseId: '2', startedAt: 50 }
    expect(getOpenCourseSession([other, older, newer], '1')).toBe(newer)
    expect(getOpenCourseSession([], '1')).toBeNull()
  })
})
