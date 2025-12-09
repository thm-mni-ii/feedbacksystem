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

  get(courseId: number, taskId: number): Observable<StagedFeedbackConfig> {
    return this.taskService.getTask(courseId, taskId).pipe(
      map((task) => ({
        enabled: !!task.stagedFeedbackEnabled,
        initialOrdLimit: task.stagedFeedbackLimit ?? 1,
      }))
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
