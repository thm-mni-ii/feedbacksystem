import {EvaluationContainerResult} from './EvaluationContainerResult';

export interface EvaluationContainerResults {
  bonusPoints: number;
  passed: boolean;
  passedTasks: number;
  container: EvaluationContainerResult;
}
