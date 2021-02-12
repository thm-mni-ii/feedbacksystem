import {Task} from './Task';

export interface Requirement {
  id?: number;
  toPass: number;
  bonusFormula: string;
  tasks?: Task[];
  hidePoints: boolean;
}
