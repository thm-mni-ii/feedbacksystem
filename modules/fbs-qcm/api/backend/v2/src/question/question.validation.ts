import { ValidationError } from "../shared/errors";
import { QuestionInput, QuestionUpdate } from "./question.model";

const RELATIONS = ["required", "supporting"] as const;

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

function assertCompetencyIds(value: unknown): asserts value is string[] {
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) {
    throw new ValidationError('Field "competencyIds" must be an array of strings');
  }
}

function assertCompetencyLinks(value: unknown): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    throw new ValidationError('Field "competencyLinks" must be an array');
  }
  for (const link of value) {
    if (typeof link !== "object" || link === null) {
      throw new ValidationError("Each competencyLink must be an object");
    }
    assertString((link as Record<string, unknown>).competencyId, "competencyLinks[].competencyId");
    const weight = (link as Record<string, unknown>).weight;
    if (weight !== undefined && typeof weight !== "number") {
      throw new ValidationError('Field "competencyLinks[].weight" must be a number');
    }
    const relation = (link as Record<string, unknown>).relation;
    if (relation !== undefined && !RELATIONS.includes(relation as (typeof RELATIONS)[number])) {
      throw new ValidationError('Field "competencyLinks[].relation" must be "required" or "supporting"');
    }
  }
}

/** Validiert die Pflichtfelder für eine neu anzulegende Question. */
export function validateQuestionInput(body: unknown): QuestionInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertString(b.text, "text");
  assertCompetencyIds(b.competencyIds);
  assertNumber(b.difficulty, "difficulty");
  assertCompetencyLinks(b.competencyLinks);

  if (b.title !== undefined) assertString(b.title, "title");
  if (b.excludeFromAlgorithm !== undefined && typeof b.excludeFromAlgorithm !== "boolean") {
    throw new ValidationError('Field "excludeFromAlgorithm" must be a boolean');
  }
  if (b.questionType !== undefined) assertString(b.questionType, "questionType");
  if (b.questionConfiguration !== undefined && typeof b.questionConfiguration !== "object") {
    throw new ValidationError('Field "questionConfiguration" must be an object');
  }

  return {
    text: b.text as string,
    competencyIds: b.competencyIds as string[],
    difficulty: b.difficulty as number,
    title: b.title as string | undefined,
    competencyLinks: b.competencyLinks as QuestionInput["competencyLinks"],
    excludeFromAlgorithm: b.excludeFromAlgorithm as boolean | undefined,
    questionType: b.questionType as string | undefined,
    questionConfiguration: b.questionConfiguration as Record<string, unknown> | undefined
  };
}

/** Validiert Teil-Updates für eine bestehende Question (PATCH/PUT-Semantik). */
export function validateQuestionUpdate(body: unknown): QuestionUpdate {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  if (b.text !== undefined) assertString(b.text, "text");
  if (b.competencyIds !== undefined) assertCompetencyIds(b.competencyIds);
  if (b.difficulty !== undefined) assertNumber(b.difficulty, "difficulty");
  if (b.title !== undefined) assertString(b.title, "title");
  assertCompetencyLinks(b.competencyLinks);
  if (b.excludeFromAlgorithm !== undefined && typeof b.excludeFromAlgorithm !== "boolean") {
    throw new ValidationError('Field "excludeFromAlgorithm" must be a boolean');
  }
  if (b.questionType !== undefined) assertString(b.questionType, "questionType");
  if (b.questionConfiguration !== undefined && typeof b.questionConfiguration !== "object") {
    throw new ValidationError('Field "questionConfiguration" must be an object');
  }

  return b as QuestionUpdate;
}
