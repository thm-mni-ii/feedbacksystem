import {Task} from './Task';

export interface EvaluationContainerResult {
  id: number;
  tasks: Task[]; // new Type TaskResult needed: { attempts: number; passed: boolean; task: Task }
  toPass: number;
  bonusFormula: string;
  hidePoints: boolean;
}
