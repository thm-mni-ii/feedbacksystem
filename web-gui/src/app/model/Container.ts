import {Task} from './Task';
export interface Container {
  id?: number;
  Task: Task[];
  toPass: number;
  bonusFormula: string;
  hidePoints: string;
}
