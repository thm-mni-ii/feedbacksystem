import { Component, Input, OnInit } from "@angular/core";
import { Course } from "../../model/Course";
import { Router } from "@angular/router";
import { TaskService } from "src/app/service/task.service";
import { Task } from "src/app/model/Task";
import { SubmissionService } from "src/app/service/submission.service";
import { AuthService } from "src/app/service/auth.service";

@Component({
  selector: "app-course-preview-w-progress",
  templateUrl: "./course-preview-w-progress.component.html",
  styleUrls: ["./course-preview.component.scss"],
})
export class CoursePreviewWProgressComponent implements OnInit {
  @Input() data: Course;

  constructor(
    private router: Router,
    private authService: AuthService,
    private taskService: TaskService,
    private submissionService: SubmissionService
  ) {}

  userID: number;
  allTasksFromCourse: Task[];
  passed: number = 0;
  failed: number = 0;
  all: number = 0;

  ngOnInit(): void {
    this.userID = this.authService.getToken().id;
    this.getProgress();
  }

  countResults(allSubmissions: any[], failed: boolean) {
    if (allSubmissions.length != 0) {
      for (var submission of allSubmissions) {
        if (!failed) {
          break;
        }
        for (var checker of submission.results) {
          if (checker.exitCode == 0) {
            this.passed++;
            failed = false;
            break;
          }
        }
      }
      if (failed) {
        this.failed++;
      }
    }
  }

  getProgress() {
    this.taskService.getAllTasks(this.data.id).subscribe(
      (allTasks) => {
        if (allTasks.length > 0) {
          this.all = allTasks.length;
          for (var task of allTasks) {
            let failed = true;
            this.submissionService
              .getAllSubmissions(this.userID, this.data.id, task.id)
              .subscribe((allSubmissions) => {
                this.countResults(allSubmissions, failed);
              });
          }
        }
      },
      () => {}
    );
  }

  private getCourseLinkComponents() {
    return ["courses", this.data.id];
  }

  getCourseLink(): string {
    return "/" + this.getCourseLinkComponents().join("/");
  }

  /**
   * Show course in detail
   */
  goToCourse() {
    this.router.navigate(this.getCourseLinkComponents()); // TODO: Should be ID
  }
}
