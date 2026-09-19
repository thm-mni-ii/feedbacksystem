import { Collection, Db } from "mongodb";
import { ConflictError } from "../shared/errors";
import {
  DEFAULT_STUDY_ALGORITHM_CONFIG,
  resolveStudyAlgorithmConfig,
  STUDY_ALGORITHM_SCHEMA_VERSION,
  STUDY_ALGORITHM_VERSION,
  StudyAlgorithmOverrides
} from "./studyAlgorithmConfig";
import { CourseStudyConfiguration } from "./studyConfiguration.model";

interface CourseStudyConfigurationDocument {
  courseId: string;
  schemaVersion: number;
  algorithmVersion: string;
  overrides: StudyAlgorithmOverrides;
  revision: number;
  updatedAt: Date;
  updatedBy: string;
}

function toConfiguration(
  courseId: string,
  document?: CourseStudyConfigurationDocument | null
): CourseStudyConfiguration {
  const overrides = document?.overrides ?? {};
  return {
    courseId,
    defaults: DEFAULT_STUDY_ALGORITHM_CONFIG,
    overrides,
    effectiveConfig: resolveStudyAlgorithmConfig(overrides),
    revision: document?.revision ?? 0,
    updatedAt: document?.updatedAt.getTime() ?? null,
    updatedBy: document?.updatedBy ?? null
  };
}

export class StudyConfigurationRepository {
  private readonly collection: Collection<CourseStudyConfigurationDocument>;

  constructor(db: Db) {
    this.collection = db.collection<CourseStudyConfigurationDocument>(
      "courseStudyConfiguration"
    );
  }

  async get(courseId: string): Promise<CourseStudyConfiguration> {
    return toConfiguration(courseId, await this.collection.findOne({ courseId }));
  }

  async update(
    courseId: string,
    overrides: StudyAlgorithmOverrides,
    expectedRevision: number,
    updatedBy: string
  ): Promise<CourseStudyConfiguration> {
    const updatedAt = new Date();
    const document = await this.collection.findOneAndUpdate(
      { courseId, revision: expectedRevision },
      {
        $set: {
          schemaVersion: STUDY_ALGORITHM_SCHEMA_VERSION,
          algorithmVersion: STUDY_ALGORITHM_VERSION,
          overrides,
          updatedAt,
          updatedBy
        },
        $inc: { revision: 1 },
        $setOnInsert: { courseId }
      },
      {
        upsert: expectedRevision === 0,
        returnDocument: "after"
      }
    ).catch((error: unknown) => {
      if (isDuplicateKeyError(error)) {
        throw new ConflictError();
      }
      throw error;
    });

    if (!document) {
      throw new ConflictError();
    }
    return toConfiguration(courseId, document);
  }

  async reset(
    courseId: string,
    expectedRevision: number,
    updatedBy: string
  ): Promise<CourseStudyConfiguration> {
    return this.update(courseId, {}, expectedRevision, updatedBy);
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

export async function ensureStudyConfigurationIndexes(db: Db): Promise<void> {
  await db
    .collection<CourseStudyConfigurationDocument>("courseStudyConfiguration")
    .createIndex({ courseId: 1 }, { unique: true });
}
