import {Task} from './Task';

export interface EvaluationContainerResult {
  id: number;
  tasks: Task[];
  toPass: number;
  bonusFormula: string;
  hidePoints: boolean;
}
