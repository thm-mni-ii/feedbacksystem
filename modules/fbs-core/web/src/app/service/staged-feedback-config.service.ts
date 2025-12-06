import { Injectable } from "@angular/core";

export interface StagedFeedbackConfig {
  enabled: boolean;
  initialOrdLimit: number;
}

@Injectable({
  providedIn: "root",
})
export class StagedFeedbackConfigService {
  private key(courseId: number, taskId: number): string {
    return `fbs.stagedFeedback.${courseId}.${taskId}`;
  }

  get(courseId: number, taskId: number): StagedFeedbackConfig | null {
    const raw = localStorage.getItem(this.key(courseId, taskId));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Invalid staged feedback config in storage", e);
      return null;
    }
  }

  set(courseId: number, taskId: number, config: StagedFeedbackConfig): void {
    localStorage.setItem(this.key(courseId, taskId), JSON.stringify(config));
  }
}
