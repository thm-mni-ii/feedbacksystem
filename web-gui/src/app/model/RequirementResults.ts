import {RequirementResult} from './RequirementResult';

export interface RequirementResults {
  bonusPoints: number;
  passed: boolean;
  passedTasks: number;
  container: RequirementResult;
}
