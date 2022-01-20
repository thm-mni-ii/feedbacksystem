import {Task} from './Task';
export interface Container {
  containerid?: number;
  Task: Task[];
  toPass: number;
  bonusFormula: string;
  hidePoints: string;
}
