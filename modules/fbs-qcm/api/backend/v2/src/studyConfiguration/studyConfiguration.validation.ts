import { ValidationError } from "../shared/errors";
import {
  CourseStudyConfigurationReset,
  CourseStudyConfigurationUpdate
} from "./studyConfiguration.model";
import { StudyAlgorithmOverrides } from "./studyAlgorithmConfig";

function assertObject(value: unknown, field: string): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError(`Field "${field}" must be an object`);
  }
}

function assertAllowedKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  field: string
): void {
  const unknownKey = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknownKey) {
    throw new ValidationError(`Field "${field}.${unknownKey}" is not configurable`);
  }
}

function assertNumberInRange(
  value: unknown,
  field: string,
  minimum: number,
  maximum: number,
  integer = false
): asserts value is number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum ||
    (integer && !Number.isInteger(value))
  ) {
    const type = integer ? "integer" : "number";
    throw new ValidationError(
      `Field "${field}" must be a ${type} between ${minimum} and ${maximum}`
    );
  }
}

function validateOverrides(value: unknown): StudyAlgorithmOverrides {
  assertObject(value, "overrides");
  assertAllowedKeys(value, ["session", "completion", "selection"], "overrides");

  if (value.session !== undefined) {
    assertObject(value.session, "overrides.session");
    assertAllowedKeys(value.session, ["maxQuestionsPerSession"], "overrides.session");
    if (value.session.maxQuestionsPerSession !== undefined) {
      assertNumberInRange(
        value.session.maxQuestionsPerSession,
        "overrides.session.maxQuestionsPerSession",
        1,
        200,
        true
      );
    }
  }

  if (value.completion !== undefined) {
    assertObject(value.completion, "overrides.completion");
    assertAllowedKeys(
      value.completion,
      ["minEvidencePerCompetency", "maxUncertainty"],
      "overrides.completion"
    );
    if (value.completion.minEvidencePerCompetency !== undefined) {
      assertNumberInRange(
        value.completion.minEvidencePerCompetency,
        "overrides.completion.minEvidencePerCompetency",
        1,
        20,
        true
      );
    }
    if (value.completion.maxUncertainty !== undefined) {
      assertNumberInRange(
        value.completion.maxUncertainty,
        "overrides.completion.maxUncertainty",
        0,
        1
      );
    }
  }

  if (value.selection !== undefined) {
    assertObject(value.selection, "overrides.selection");
    assertAllowedKeys(
      value.selection,
      ["stickinessQuestions", "difficultyWindow", "recentQuestionWindow"],
      "overrides.selection"
    );
    if (value.selection.stickinessQuestions !== undefined) {
      assertNumberInRange(
        value.selection.stickinessQuestions,
        "overrides.selection.stickinessQuestions",
        1,
        20,
        true
      );
    }
    if (value.selection.difficultyWindow !== undefined) {
      assertNumberInRange(
        value.selection.difficultyWindow,
        "overrides.selection.difficultyWindow",
        0,
        1
      );
    }
    if (value.selection.recentQuestionWindow !== undefined) {
      assertNumberInRange(
        value.selection.recentQuestionWindow,
        "overrides.selection.recentQuestionWindow",
        0,
        100,
        true
      );
    }
  }

  return value as StudyAlgorithmOverrides;
}

function validateRevision(value: unknown): number {
  assertNumberInRange(value, "revision", 0, Number.MAX_SAFE_INTEGER, true);
  return value;
}

export function validateConfigurationUpdate(body: unknown): CourseStudyConfigurationUpdate {
  assertObject(body, "request");
  assertAllowedKeys(body, ["revision", "overrides"], "request");
  return {
    revision: validateRevision(body.revision),
    overrides: validateOverrides(body.overrides)
  };
}

export function validateConfigurationReset(body: unknown): CourseStudyConfigurationReset {
  assertObject(body, "request");
  assertAllowedKeys(body, ["revision"], "request");
  return { revision: validateRevision(body.revision) };
}
