/**
 * QuestionAttempt-DTOs für v2. Orientiert an web/src/model/types.ts
 * `QuestionAttempt`.
 *
 * Ein QuestionAttempt ist ein unveränderliches Lernereignis (Event-Log) und
 * bildet die fachliche Grundlage für Verlaufsansichten, Reproduzierbarkeit
 * und Knowledge Tracing. Er wird nie aktualisiert oder gelöscht, nur angelegt
 * und gelesen (siehe questionAttempt.repository.ts).
 */

export type EvaluationSource = "automatic" | "manual-self-assessment" | "teacher-review";

/**
 * Ergebnis einer Antwortbewertung. `isCorrect` bleibt bei Teilpunkten oder
 * Selbsteinschätzungen bewusst optional.
 */
export interface AnswerEvaluation {
  score: number;
  isCorrect?: boolean;
  source: EvaluationSource;
}

export interface QuestionAttempt {
  id: string;
  sessionId: string;
  studentId: string;
  questionId: string;
  targetCompetencyId: string;
  competencyIds: string[];
  evaluation: AnswerEvaluation;
  /**
   * Rohe Antwort des Nutzers (Checkbox-Auswahl, Fill-in-the-Blank-Strings,
   * Matrix-Paare, ...). Bewusst generisch/unknown gelassen, da die Struktur
   * je Fragetyp unterschiedlich ist; Validierung erfolgt bei Bedarf am
   * jeweiligen Aufrufer, nicht hier.
   */
  responsePayload?: unknown;
  submittedAt: number;
  responseTimeMs: number;
}

/** Eingabe beim Anlegen eines neuen Attempts. Die id wird serverseitig vergeben. */
export type QuestionAttemptInput = Omit<QuestionAttempt, "id">;
