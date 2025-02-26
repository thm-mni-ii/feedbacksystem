import { Course } from "../Course";
import { Task } from "../Task";
import { BackendUser } from "../../page-components/sql-playground/collab/backend.service";

export interface QueryTab {
  id: string;
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
  active: BackendUser[];
  createdAt: number;
}

export function queryTabEquals(
  a: Partial<QueryTab>,
  b: Partial<QueryTab>
): boolean {
  return (
    typeof a === "object" &&
    typeof b === "object" &&
    a.id === b.id &&
    a.name === b.name &&
    a.content === b.content
  );
}
