import { ValidationError } from "../shared/errors";
import { CompetencyInput, CompetencyUpdate } from "./competency.model";

function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`Field "${field}" must be a non-empty string`);
  }
}

function assertPrerequisites(value: unknown): void {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    throw new ValidationError('Field "prerequisites" must be an array');
  }
  for (const prerequisite of value) {
    if (typeof prerequisite !== "object" || prerequisite === null) {
      throw new ValidationError("Each prerequisite must be an object");
    }
    const p = prerequisite as Record<string, unknown>;
    assertString(p.competencyId, "prerequisites[].competencyId");
    if (typeof p.minimumMastery !== "number" || Number.isNaN(p.minimumMastery)) {
      throw new ValidationError('Field "prerequisites[].minimumMastery" must be a number');
    }
  }
}

export function validateCompetencyInput(body: unknown): CompetencyInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  assertString(b.name, "name");
  assertPrerequisites(b.prerequisites);

  if (b.description !== undefined) assertString(b.description, "description");
  if (b.category !== undefined) assertString(b.category, "category");
  if (b.parentId !== undefined && b.parentId !== null) assertString(b.parentId, "parentId");

  return {
    name: b.name as string,
    description: b.description as string | undefined,
    parentId: b.parentId as string | null | undefined,
    category: b.category as string | undefined,
    prerequisites: b.prerequisites as CompetencyInput["prerequisites"]
  };
}

export function validateCompetencyUpdate(body: unknown): CompetencyUpdate {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Request body must be an object");
  }
  const b = body as Record<string, unknown>;

  if (b.name !== undefined) assertString(b.name, "name");
  if (b.description !== undefined) assertString(b.description, "description");
  if (b.category !== undefined) assertString(b.category, "category");
  if (b.parentId !== undefined && b.parentId !== null) assertString(b.parentId, "parentId");
  assertPrerequisites(b.prerequisites);

  return b as CompetencyUpdate;
}
