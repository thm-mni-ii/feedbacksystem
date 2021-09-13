import {EvaluationTask} from './EvaluationTask';

export interface EvaluationContainerResult {
  id: number;
  tasks: EvaluationTask[];
  toPass: number;
  bonusFormula: string;
  hidePoints: boolean;
}
