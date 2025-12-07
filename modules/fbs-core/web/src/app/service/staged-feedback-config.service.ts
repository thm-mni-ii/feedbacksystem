import { Injectable } from "@angular/core";
import { TaskService } from "./task.service";
import { Observable } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

export interface StagedFeedbackConfig {
  enabled: boolean;
  initialOrdLimit: number;
}

@Injectable({
  providedIn: "root",
})
export class StagedFeedbackConfigService {
  constructor(private taskService: TaskService) {}

  private key(courseId: number, taskId: number): string {
    return `fbs.stagedFeedback.${courseId}.${taskId}`;
  }

  get(
    courseId: number,
    taskId: number
  ): Observable<StagedFeedbackConfig | null> {
    return this.taskService.getTask(courseId, taskId).pipe(
      map((task) =>
        task.stagedFeedbackEnabled !== undefined &&
        task.stagedFeedbackLimit !== undefined
          ? {
              enabled: task.stagedFeedbackEnabled,
              initialOrdLimit: task.stagedFeedbackLimit,
            }
          : null
      )
    );
  }

  set(
    courseId: number,
    taskId: number,
    config: StagedFeedbackConfig
  ): Observable<void> {
    return this.taskService.getTask(courseId, taskId).pipe(
      mergeMap((task) =>
        this.taskService.updateTask(courseId, taskId, {
          ...task,
          stagedFeedbackEnabled: config.enabled,
          stagedFeedbackLimit: config.initialOrdLimit,
        })
      )
    );
  }
}
