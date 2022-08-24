import { User } from "./User";
import { Task } from "./Task";

export interface CourseResult {
  user: User;
  passed: boolean;
  results: {
    task: Task;
    attempts: number;
    passed: boolean;
  }[];
}
