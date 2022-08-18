import { EvaluationContainerResult } from "./EvaluationContainerResult";

export interface EvaluationContainerResults {
  bonusPoints: number;
  passed: boolean;
  passedTasks: number;
  points: number;
  container: EvaluationContainerResult;
}
