/**
 * Question-DTOs für v2.
 *
 * Bewusst am Frontend-Domänenmodell `LearningQuestion` aus
 * web/src/model/types.ts orientiert (nicht am alten api/backend/src/model/Question.ts),
 * damit der adaptive Algorithmus (web/src/composables/algorithm.ts) später ohne
 * Modellbruch an die echte API andocken kann.
 *
 * Felder wie `legacyQuestion` werden hier bewusst NICHT übernommen, weil sie
 * nur eine Übergangs-Bridge zu den alten Dummy-Daten im Frontend sind.
 */

export interface QuestionCompetencyLink {
  competencyId: string;
  /** Gewichtung der Kompetenz für dieses Item. Default: 1. */
  weight?: number;
  /** required = Kernattribut, supporting = Nebenattribut. */
  relation?: "required" | "supporting";
}

export interface Question {
  id: string;
  text: string;
  title?: string;
  /** Kompakte Form: IDs der Kompetenzen, die diese Frage abprüft. */
  competencyIds: string[];
  /** Erweiterte Q-Matrix-Form mit Mehrfach-Attributen und optionalen Gewichten. */
  competencyLinks?: QuestionCompetencyLink[];
  difficulty: number;
  excludeFromAlgorithm?: boolean;
  /**
   * Fragetyp (z.B. "single-choice", "matrix", "matching", "fill-in-the-blank").
   * Bewusst als offener String statt fixem Enum: die konkreten Fragetypen
   * werden erst vertieft, sobald die Question-Domain fachlich erweitert wird
   * (aktuell reicht es, die Frontend-Dummy-Daten verlustfrei zu übernehmen).
   */
  questionType?: string;
  /** Typspezifische Konfiguration (Antwortoptionen etc.), Struktur je questionType unterschiedlich. */
  questionConfiguration?: Record<string, unknown>;
}

export type QuestionInput = Omit<Question, "id">;

export type QuestionUpdate = Partial<QuestionInput>;
