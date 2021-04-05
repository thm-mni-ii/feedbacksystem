import {Task} from './Task';

export interface RequirementResult {
  id: number;
  tasks: {
    task: Task[];
    attempts: number;
    passed: boolean;
  };
  toPass: number;
  bonusFormula: string;
  hidePoints: boolean;
}
