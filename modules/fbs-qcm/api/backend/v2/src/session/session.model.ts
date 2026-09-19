/**
 * Session-DTOs für v2. Orientiert an web/src/model/types.ts `StudySession`.
 *
 * `history` wird bewusst NICHT übernommen: Der Antwortverlauf wird beim Laden
 * einer Session aus den separat gespeicherten `QuestionAttempt`-Datensätzen
 * rekonstruiert, um keine redundanten/inkonsistenten Daten zu persistieren
 * (siehe questionAttempt.model.ts).
 *
 * Zeitstempel bleiben `number` (Unix-Millis), identisch zum Frontend-Modell;
 * die Umwandlung zu Mongo-`Date` passiert ausschließlich in
 * `session.repository.ts`.
 */

export interface CompetencyState {
  competencyId: string;
  score: number;
  timesAssessed: number;
  lastAssessedAt: number | null;
}

export interface StudySession {
  id: string;
  studentId: string;
  /** Optionale Kurs-Zuordnung, z.B. für späteres Reporting nach Kurs. */
  courseId?: string | null;
  algorithm: {
    configuration: StudyAlgorithmConfig;
    courseConfigurationRevision: number;
  };
  startedAt: number;
  updatedAt: number;
  completedAt?: number | null;
  competencies: Record<string, CompetencyState>;
  recentQuestionIds: string[];
  excludedQuestionIds: string[];
  /** Competency Stickiness: Aktuelle Kompetenz für mehrere Fragen fokussieren. */
  currentCompetencyId: string | null;
  /** Zähler: Wie viele Fragen wurden bereits zur aktuellen Kompetenz gestellt? */
  questionsInCurrentCompetency: number;
}

/** Eingabe beim Anlegen einer neuen Session. ID und Algorithmus werden serverseitig vergeben. */
export type StudySessionInput = Omit<StudySession, "id" | "algorithm">;
export type StudySessionCreate = StudySessionInput & Pick<StudySession, "algorithm">;

/**
 * Vollständiger Ersatz des Session-Zustands (kein partielles PATCH), analog
 * zum bestehenden Frontend-Repository-Interface (`saveSession`).
 */
export type StudySessionReplace = Omit<StudySession, "id" | "studentId" | "algorithm">;
import { StudyAlgorithmConfig } from "../studyConfiguration/studyAlgorithmConfig";
