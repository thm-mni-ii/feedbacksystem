import {
  StudyAlgorithmConfig,
  StudyAlgorithmOverrides
} from "./studyAlgorithmConfig";

export interface CourseStudyConfiguration {
  courseId: string;
  defaults: StudyAlgorithmConfig;
  overrides: StudyAlgorithmOverrides;
  effectiveConfig: StudyAlgorithmConfig;
  revision: number;
  updatedAt: number | null;
  updatedBy: string | null;
}

export interface CourseStudyConfigurationUpdate {
  revision: number;
  overrides: StudyAlgorithmOverrides;
}

export interface CourseStudyConfigurationReset {
  revision: number;
}
