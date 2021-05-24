import {User} from './User';
import {EvaluationContainerResults} from './EvaluationContainerResults';

export interface EvaluationUserResults {
  user: User;
  bonusPoints: number;
  passed: boolean;
  containerResults: EvaluationContainerResults[];
}
