import type { Competency, StudySession } from '@/model/types'

export function getLatestCourseSession(
  sessions: StudySession[],
  courseId: string
): StudySession | null {
  return (
    sessions
      .filter((session) => session.courseId === courseId)
      .sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null
  )
}

export function getCompetencyProgress(session: StudySession | null, competencyId: string): number {
  return Math.round((session?.competencies[competencyId]?.score ?? 0) * 100)
}

export function getCourseProgress(
  session: StudySession | null,
  competencies: Competency[]
): number {
  if (!session || competencies.length === 0) return 0

  const assessedScores = competencies
    .map((competency) => session.competencies[competency.id])
    .filter((state) => state?.timesAssessed > 0)
    .map((state) => state.score * 100)

  if (assessedScores.length === 0) return 0

  return Math.round(assessedScores.reduce((sum, score) => sum + score, 0) / assessedScores.length)
}
