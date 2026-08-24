export type {
  AnswerEvaluation,
  AnswerRecord,
  AnswerResult,
  Competency,
  CompetencyPrerequisite,
  CompetencyState,
  EvaluationSource,
  LearningAttempt,
  LearningQuestion,
  NextQuestion,
  ProgressItem,
  QMatrix,
  QMatrixValidationResult,
  Question,
  QuestionCompetencyLink,
  SessionState
} from '@/model/types'

export interface SkillVisualization {
  skillId: string
  label: string
  pLearned: number
  mastered: boolean
  unlocked: boolean
  timesAsked: number
  successRate: number
  prerequisites: string[]
  unlocks: string[]
  avgDifficulty: number
  avgTimePerQuestion: number
  status: 'mastered' | 'progress' | 'locked'
}

export interface AnswerVisualization {
  questionId: string
  skillId: string
  questionText: string
  skillLabel: string
  timeSeconds: number
  wasCorrect: boolean
}

export interface SessionResults {
  studentId: string
  sessionId: string
  startedAt: number
  completedAt: number
  totalTimeSeconds: number
  skills: SkillVisualization[]
  overallProgress: number
  questionsAnswered: number
  correctAnswers: number
  incorrectAnswers: number
}
