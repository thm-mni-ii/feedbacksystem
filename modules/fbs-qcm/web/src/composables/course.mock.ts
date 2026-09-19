import type Course from '@/model/Course'

/**
 * Dummy-Kurs "Datenbanksysteme", für den bereits Beispiel-Kompetenzen und
 * -Fragen modelliert wurden (siehe `competencyGraph.mock.ts` / `question.mock.ts`).
 * Bis eine echte Kurs-Domain existiert, dient dieser Mock als Datenquelle für
 * die Kursauswahl im Frontend (z.B. HomeView).
 */
export const courseMocks: Course[] = [
  {
    id: 1,
    name: 'Datenbanksysteme',
    description:
      'Datenorganisation, Datenbankmodellierung und Grundlagen relationaler Datenbanksysteme.',
    visibility: true
  }
]

export function getCourseById(courseId: string): Course | undefined {
  return courseMocks.find((course) => String(course.id) === courseId)
}
