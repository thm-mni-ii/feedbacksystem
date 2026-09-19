import { ValidationError } from "../shared/errors";
import { CompetencyState, StudySessionInput, StudySessionReplace } from "./session.model";

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Field "${field}" must be a non-empty string`);
  }
}

function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ValidationError(`Field "${field}" must be a number`);
  }
}

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ValidationError(`Field "${field}" must be an array of strings`);
  }
}

function assertCompetencies(value: unknown): asserts value is Record<string, CompetencyState> {
  if (typeof value !== "object" || value === null) {
    throw new ValidationError('Field "competencies" must be an object');
  }
  for (const [competencyId, state] of Object.entries(value as Record<string, unknown>)) {
    if (typeof state !== "object" || state === null) {
      throw new ValidationError(`Field "competencies.${competencyId}" must be an object`);
    }
    const s = state as Record<string, unknown>;
    assertString(s.competencyId, `competencies.${competencyId}.competencyId`);
    assertNumber(s.score, `competencies.${competencyId}.score`);
    assertNumber(s.timesAssessed, `competencies.${competencyId}.timesAssessed`);
    if (s.lastAssessedAt !== null) {
      assertNumber(s.lastAssessedAt, `competencies.${competencyId}.lastAssessedAt`);
    }
  }
}

function assertCommonSessionFields(b: Record<string, unknown>): void {
  assertNumber(b.startedAt, "startedAt");
  assertNumber(b.updatedAt, "updatedAt");
  if (b.completedAt !== undefined && b.completedAt !== null) {
    assertNumber(b.completedAt, "completedAt");
  }
  if (b.courseId !== undefined && b.courseId !== null) {
    assertString(b.courseId, "courseId");
  }
  assertCompetencies(b.competencies);
  assertStringArray(b.recentQuestionIds, "recentQuestionIds");
  assertStringArray(b.excludedQuestionIds, "excludedQuestionIds");
  if (b.currentCompetencyId !== null) {
    assertString(b.currentCompetencyId, "currentCompetencyId");
  }
  assertNumber(b.questionsInCurrentCompetency, "questionsInCurrentCompetency");
}

export function validateSessionInput(body: unknown): StudySessionInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertString(b.studentId, "studentId");
  assertCommonSessionFields(b);

  return b as unknown as StudySessionInput;
}

export function validateSessionReplace(body: unknown): StudySessionReplace {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertCommonSessionFields(b);

  return b as unknown as StudySessionReplace;
}
