import {Task} from './Task';
export interface Container {
  panelOpenState: boolean;
  containerid?: number;
  Task: Task[];
  toPass: number;
  bonusFormula: string;
  hidePoints: string;
}
