import { Course } from "../Course";
import { Task } from "../Task";

export interface QueryTab {
  name: string;
  content: string;
  error: boolean;
  errorMsg: string;
  isCorrect: boolean;
  isSubmitted: boolean;
  isSubmitMode: boolean;
  selectedCourse: Course;
  selectedTask: Task;
  selectedCourseName: string;
  selectedTaskName: string;
}
