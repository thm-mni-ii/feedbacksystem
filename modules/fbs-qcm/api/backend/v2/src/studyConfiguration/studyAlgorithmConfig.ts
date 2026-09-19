export const STUDY_ALGORITHM_SCHEMA_VERSION = 1;
export const STUDY_ALGORITHM_VERSION = "adaptive-bkt-v1";

export interface StudyAlgorithmConfig {
  schemaVersion: number;
  algorithmVersion: string;
  session: {
    maxQuestionsPerSession: number;
  };
  completion: {
    minEvidencePerCompetency: number;
    maxUncertainty: number;
  };
  selection: {
    stickinessQuestions: number;
    difficultyWindow: number;
    recentQuestionWindow: number;
  };
  model: {
    initialMastery: number;
    learnRate: number;
    guessRate: number;
    slipRate: number;
  };
  utilityWeights: {
    uncertainty: number;
    evidenceNeed: number;
    difficultyFit: number;
    targetCompetencyBonus: number;
  };
}

export interface StudyAlgorithmOverrides {
  session?: Partial<StudyAlgorithmConfig["session"]>;
  completion?: Partial<StudyAlgorithmConfig["completion"]>;
  selection?: Partial<StudyAlgorithmConfig["selection"]>;
}

export const DEFAULT_STUDY_ALGORITHM_CONFIG: StudyAlgorithmConfig = {
  schemaVersion: STUDY_ALGORITHM_SCHEMA_VERSION,
  algorithmVersion: STUDY_ALGORITHM_VERSION,
  session: { maxQuestionsPerSession: 30 },
  completion: {
    minEvidencePerCompetency: 2,
    maxUncertainty: 0.7
  },
  selection: {
    stickinessQuestions: 3,
    difficultyWindow: 0.2,
    recentQuestionWindow: 5
  },
  model: {
    initialMastery: 0.35,
    learnRate: 0.18,
    guessRate: 0.2,
    slipRate: 0.1
  },
  utilityWeights: {
    uncertainty: 0.5,
    evidenceNeed: 0.3,
    difficultyFit: 0.2,
    targetCompetencyBonus: 0.1
  }
};

export function resolveStudyAlgorithmConfig(
  overrides: StudyAlgorithmOverrides = {}
): StudyAlgorithmConfig {
  return {
    ...DEFAULT_STUDY_ALGORITHM_CONFIG,
    session: { ...DEFAULT_STUDY_ALGORITHM_CONFIG.session, ...overrides.session },
    completion: { ...DEFAULT_STUDY_ALGORITHM_CONFIG.completion, ...overrides.completion },
    selection: { ...DEFAULT_STUDY_ALGORITHM_CONFIG.selection, ...overrides.selection },
    model: { ...DEFAULT_STUDY_ALGORITHM_CONFIG.model },
    utilityWeights: { ...DEFAULT_STUDY_ALGORITHM_CONFIG.utilityWeights }
  };
}
