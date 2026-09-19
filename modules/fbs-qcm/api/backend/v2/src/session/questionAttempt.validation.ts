import { ValidationError } from "../shared/errors";
import { AnswerEvaluation, QuestionAttemptInput } from "./questionAttempt.model";

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

const VALID_EVALUATION_SOURCES = ["automatic", "manual-self-assessment", "teacher-review"];

function assertEvaluation(value: unknown): asserts value is AnswerEvaluation {
  if (typeof value !== "object" || value === null) {
    throw new ValidationError('Field "evaluation" must be an object');
  }
  const e = value as Record<string, unknown>;
  assertNumber(e.score, "evaluation.score");
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
  if (typeof body !== "object" || body === null) {
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

  return b as unknown as QuestionAttemptInput;
}
