import { Task } from "./Task";

export interface EvaluationTask {
  attempts: number;
  passed: boolean;
  points: number;
  task: Task;
}
