import { ValidationError } from "../shared/errors";
import { QuestionInput, QuestionUpdate } from "./question.model";

const RELATIONS = ["required", "supporting"] as const;
// Analog zum Frontend (siehe EditQuestion.vue): der Seed-/Legacy-Datenbestand
// verwendet den Fragetyp-String "matching" (lowercase), während neu über die
// UI angelegte Fragen das Enum "Matching" senden. Beide Formen müssen die
// Matching-Konfiguration (categories/items) validieren, sonst können
// Matching-Fragen ohne `items` gespeichert werden.
const MATCHING_QUESTION_TYPES = new Set(["Matching", "matching"]);

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
  if (value === undefined || value === null) return;
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

function assertMatchingConfiguration(value: unknown): void {
  if (typeof value !== "object" || value === null) {
    throw new ValidationError('Field "questionConfiguration" must be an object');
  }
  const configuration = value as Record<string, unknown>;
  if (!Array.isArray(configuration.categories) || configuration.categories.length === 0) {
    throw new ValidationError('Matching questions require at least one category');
  }
  if (!Array.isArray(configuration.items) || configuration.items.length === 0) {
    throw new ValidationError('Matching questions require at least one item');
  }

  const categoryIds = new Set<string>();
  for (const category of configuration.categories) {
    if (typeof category !== "object" || category === null) {
      throw new ValidationError("Each matching category must be an object");
    }
    const value = category as Record<string, unknown>;
    assertString(value.id, "questionConfiguration.categories[].id");
    assertString(value.label, "questionConfiguration.categories[].label");
    if (categoryIds.has(value.id)) {
      throw new ValidationError("Matching category IDs must be unique");
    }
    categoryIds.add(value.id);
  }

  const itemIds = new Set<string>();
  for (const item of configuration.items) {
    if (typeof item !== "object" || item === null) {
      throw new ValidationError("Each matching item must be an object");
    }
    const value = item as Record<string, unknown>;
    assertString(value.id, "questionConfiguration.items[].id");
    assertString(value.text, "questionConfiguration.items[].text");
    assertString(value.correctCategoryId, "questionConfiguration.items[].correctCategoryId");
    if (itemIds.has(value.id)) {
      throw new ValidationError("Matching item IDs must be unique");
    }
    if (!categoryIds.has(value.correctCategoryId)) {
      throw new ValidationError("Each matching item must reference an existing category");
    }
    itemIds.add(value.id);
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

  if (b.title !== undefined && b.title !== null) assertString(b.title, "title");
  if (
    b.excludeFromAlgorithm !== undefined &&
    b.excludeFromAlgorithm !== null &&
    typeof b.excludeFromAlgorithm !== "boolean"
  ) {
    throw new ValidationError('Field "excludeFromAlgorithm" must be a boolean');
  }
  if (b.questionType !== undefined && b.questionType !== null) assertString(b.questionType, "questionType");
  if (
    b.questionConfiguration !== undefined &&
    b.questionConfiguration !== null &&
    typeof b.questionConfiguration !== "object"
  ) {
    throw new ValidationError('Field "questionConfiguration" must be an object');
  }
  if (MATCHING_QUESTION_TYPES.has(b.questionType as string)) {
    assertMatchingConfiguration(b.questionConfiguration);
  }

  return {
    text: b.text as string,
    competencyIds: b.competencyIds as string[],
    difficulty: b.difficulty as number,
    title: (b.title ?? undefined) as string | undefined,
    competencyLinks: (b.competencyLinks ?? undefined) as QuestionInput["competencyLinks"],
    excludeFromAlgorithm: (b.excludeFromAlgorithm ?? undefined) as boolean | undefined,
    questionType: (b.questionType ?? undefined) as string | undefined,
    questionConfiguration: (b.questionConfiguration ?? undefined) as Record<string, unknown> | undefined
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
  if (b.title !== undefined && b.title !== null) assertString(b.title, "title");
  assertCompetencyLinks(b.competencyLinks);
  if (
    b.excludeFromAlgorithm !== undefined &&
    b.excludeFromAlgorithm !== null &&
    typeof b.excludeFromAlgorithm !== "boolean"
  ) {
    throw new ValidationError('Field "excludeFromAlgorithm" must be a boolean');
  }
  if (b.questionType !== undefined && b.questionType !== null) assertString(b.questionType, "questionType");
  if (
    b.questionConfiguration !== undefined &&
    b.questionConfiguration !== null &&
    typeof b.questionConfiguration !== "object"
  ) {
    throw new ValidationError('Field "questionConfiguration" must be an object');
  }
  if (MATCHING_QUESTION_TYPES.has(b.questionType as string)) {
    assertMatchingConfiguration(b.questionConfiguration);
  }

  return b as QuestionUpdate;
}
