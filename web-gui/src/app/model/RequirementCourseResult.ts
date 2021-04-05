import {User} from './User';
import {RequirementResult} from './RequirementResult';

export interface RequirementCourseResult {
  user: User;
  bonusPoints: number;
  passed: boolean;
  results: RequirementResult[];
}
