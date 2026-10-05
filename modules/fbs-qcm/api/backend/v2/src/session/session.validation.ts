import { ValidationError } from "../shared/errors";
import { CompetencyState, StudySessionInput, StudySessionReplace } from "./session.model";

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Field "${field}" must be a non-empty string`);
  }
}

function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`Field "${field}" must be a finite number`);
  }
}

function assertCount(value: unknown, field: string): void {
  assertNumber(value, field);
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new ValidationError(`Field "${field}" must be a non-negative safe integer`);
  }
}

function assertTimestamp(value: unknown, field: string): void {
  assertNumber(value, field);
  if (value < 0 || !Number.isFinite(new Date(value).getTime())) {
    throw new ValidationError(`Field "${field}" must be a valid non-negative timestamp`);
  }
}

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ValidationError(`Field "${field}" must be an array of strings`);
  }
}

function assertCompetencies(value: unknown): asserts value is Record<string, CompetencyState> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError('Field "competencies" must be an object');
  }
  for (const [competencyId, state] of Object.entries(value as Record<string, unknown>)) {
    if (typeof state !== "object" || state === null || Array.isArray(state)) {
      throw new ValidationError(`Field "competencies.${competencyId}" must be an object`);
    }
    const s = state as Record<string, unknown>;
    assertString(s.competencyId, `competencies.${competencyId}.competencyId`);
    assertNumber(s.score, `competencies.${competencyId}.score`);
    if (s.score < 0 || s.score > 1) {
      throw new ValidationError(`Field "competencies.${competencyId}.score" must be in [0, 1]`);
    }
    assertCount(s.timesAssessed, `competencies.${competencyId}.timesAssessed`);
    if (s.lastAssessedAt !== null) {
      assertTimestamp(s.lastAssessedAt, `competencies.${competencyId}.lastAssessedAt`);
    }
  }
}

function assertCommonSessionFields(b: Record<string, unknown>): void {
  assertTimestamp(b.startedAt, "startedAt");
  assertTimestamp(b.updatedAt, "updatedAt");
  if (b.completedAt !== undefined && b.completedAt !== null) {
    assertTimestamp(b.completedAt, "completedAt");
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
  assertCount(b.questionsInCurrentCompetency, "questionsInCurrentCompetency");
}

export function validateSessionInput(body: unknown): StudySessionInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertString(b.studentId, "studentId");
  assertCommonSessionFields(b);

  return b as unknown as StudySessionInput;
}

export function validateSessionReplace(body: unknown): StudySessionReplace {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertCommonSessionFields(b);

  return b as unknown as StudySessionReplace;
}
