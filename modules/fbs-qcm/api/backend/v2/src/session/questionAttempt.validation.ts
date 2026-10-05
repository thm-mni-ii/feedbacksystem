import { ValidationError } from "../shared/errors";
import { AnswerEvaluation, QuestionAttemptInput } from "./questionAttempt.model";
import { validateSessionReplace } from "./session.validation";

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

function assertStringArray(value: unknown, field: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ValidationError(`Field "${field}" must be an array of strings`);
  }
}

const VALID_EVALUATION_SOURCES = ["automatic", "manual-self-assessment", "teacher-review"];

function assertEvaluation(value: unknown): asserts value is AnswerEvaluation {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError('Field "evaluation" must be an object');
  }
  const e = value as Record<string, unknown>;
  assertNumber(e.score, "evaluation.score");
  if (e.score < 0 || e.score > 1) {
    throw new ValidationError('Field "evaluation.score" must be in [0, 1]');
  }
  if (e.isCorrect !== undefined && typeof e.isCorrect !== "boolean") {
    throw new ValidationError('Field "evaluation.isCorrect" must be a boolean');
  }
  if (typeof e.source !== "string" || !VALID_EVALUATION_SOURCES.includes(e.source)) {
    throw new ValidationError(
      `Field "evaluation.source" must be one of ${VALID_EVALUATION_SOURCES.join(", ")}`
    );
  }
}

export function validateQuestionAttemptInput(body: unknown): QuestionAttemptInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertString(b.sessionId, "sessionId");
  assertString(b.studentId, "studentId");
  assertString(b.questionId, "questionId");
  assertString(b.targetCompetencyId, "targetCompetencyId");
  assertStringArray(b.competencyIds, "competencyIds");
  assertEvaluation(b.evaluation);
  assertNumber(b.submittedAt, "submittedAt");
  assertNumber(b.responseTimeMs, "responseTimeMs");
  if (b.responseTimeMs < 0) {
    throw new ValidationError('Field "responseTimeMs" must be non-negative');
  }
  if (b.submittedAt < 0 || !Number.isFinite(new Date(b.submittedAt).getTime())) {
    throw new ValidationError('Field "submittedAt" must be a valid non-negative timestamp');
  }
  if (b.clientAttemptId !== undefined) {
    assertString(b.clientAttemptId, "clientAttemptId");
  }
  if (b.predictionBefore !== undefined) {
    assertNumber(b.predictionBefore, "predictionBefore");
    if (b.predictionBefore < 0 || b.predictionBefore > 1) {
      throw new ValidationError('Field "predictionBefore" must be in [0, 1]');
    }
  }
  if (b.sessionStateAfter !== undefined) {
    const snapshot = validateSessionReplace(b.sessionStateAfter);
    const allowedFields = new Set([
      "courseId", "startedAt", "updatedAt", "completedAt", "competencies",
      "recentQuestionIds", "excludedQuestionIds", "currentCompetencyId",
      "questionsInCurrentCompetency"
    ]);
    if (Object.keys(snapshot).some((field) => !allowedFields.has(field))) {
      throw new ValidationError("sessionStateAfter must contain only session replacement fields");
    }
  }

  return b as unknown as QuestionAttemptInput;
}
