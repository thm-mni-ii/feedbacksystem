import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { take, catchError, map } from "rxjs/operators";
import { Task } from "../model/Task";
import { HttpClient } from "@angular/common/http";
import { UserTaskResult } from "../model/UserTaskResult";
import { saveAs } from "file-saver";
import { SelectedFormFields } from "../model/SelectedFormFields";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  constructor(private http: HttpClient) {}

  /**
   * Get all tasks of a course
   * @param cid Course id
   * @return Observable that succeeds with all tasks of the course
   */
  getAllTasks(cid: number): Observable<Task[]> {
    return this.http.get<Task[]>(`/api/v1/courses/${cid}/tasks`);
  }

  /**
   * Get all taskResults for this Course
   * @param cid Course id
   * @return Observable that succeeds with all task Results of the course
   */
  getTaskResults(cid: number): Observable<UserTaskResult[]> {
    return this.http.get<UserTaskResult[]>(
      `/api/v1/courses/${cid}/tasks/results`
    );
  }

  /**
   * Create a new task
   * @param cid Course id
   * @param task Task state
   * @return The task state adjusted by the server
   */
  createTask(cid: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`/api/v1/courses/${cid}/tasks`, task);
  }

  /**
   * Get a task by id
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds with the task state
   */
  getTask(cid: number, tid: number): Observable<Task> {
    return this.http.get<Task>(`/api/v1/courses/${cid}/tasks/${tid}`);
  }

  /**
   * Get a taskResults for this Task
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds with the task Result of the the
   */
  getTaskResult(cid: number, tid: number): Observable<UserTaskResult> {
    return this.http.get<UserTaskResult>(
      `/api/v1/courses/${cid}/tasks/${tid}/result`
    );
  }

  /**
   * Update an existing task
   * @param cid Course id
   * @param tid Task id
   * @param task The new task state
   * @return Observable that succeeds if updated successfully
   */
  updateTask(cid: number, tid: number, task: Task): Observable<void> {
    return this.http.put<void>(`/api/v1/courses/${cid}/tasks/${tid}`, task);
  }

  /**
   * Update multiple existing tasks
   * @param cid Course id
   * @param taskIds The ids of the tasks to update
   * @param task The new task state
   * @return Observable that succeeds if updated successfully
   */
  updateMultipleTasks(
    cid: number,
    tasks: Task[],
    referenceTask: Task,
    selectedFormFields: SelectedFormFields
  ): Observable<boolean> {
    const updateObservables = tasks.map((task) => {
      if (selectedFormFields.datePicker) {
        task.deadline = referenceTask.deadline;
      }
      if (selectedFormFields.isPrivate) {
        task.isPrivate = referenceTask.isPrivate;
      }
      if (selectedFormFields.mediaType) {
        task.mediaType = referenceTask.mediaType;
      }
      if (selectedFormFields.requirementType) {
        task.requirementType = referenceTask.requirementType;
      }

      return this.updateTask(cid, task.id, task).pipe(
        take(1),
        catchError((error) => {
          console.error(`Failed to update task ${task.id}:`, error);
          return [];
        })
      );
    });

    return forkJoin(updateObservables).pipe(
      map(() => true),
      catchError(async () => false)
    );
  }

  /**
   * Delete a task
   * @param cid Course id
   * @param tid Task id
   * @return Observable that succeeds if the task does not exists after this operation.
   */
  deleteTask(cid: number, tid: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/courses/${cid}/tasks/${tid}`);
  }

  public downloadTask(cid: number, tid: number, filename?: string) {
    return this.http
      .get(`/api/v1/courses/${cid}/tasks/${tid}/export`, {
        responseType: "arraybuffer",
      })
      .subscribe((response) => {
        const blob = new Blob([response], { type: "text/plain" });
        saveAs(blob, filename ? filename + ".fbs-export" : "export.fbs-export");
      });
  }

  public downloadMultipleTasks(
    cid: number,
    tIds: Array<number>,
    filename?: string
  ) {
    return this.http
      .post(
        `/api/v1/courses/${cid}/tasks/export`,
        { taskIds: tIds },
        { responseType: "arraybuffer" }
      )
      .subscribe((response) => {
        const blob = new Blob([response], { type: "text/plain" });
        saveAs(blob, filename ? filename + ".fbs-export" : "export.fbs-export");
      });
  }
}
