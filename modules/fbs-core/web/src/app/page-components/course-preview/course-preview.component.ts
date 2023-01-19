import { Component, Input, OnInit } from "@angular/core";
import { Course } from "../../model/Course";
import { Router } from "@angular/router";
import { TaskService } from "src/app/service/task.service";
import { Task } from "src/app/model/Task";
import { SubmissionService } from "src/app/service/submission.service";
import { AuthService } from "src/app/service/auth.service";

@Component({
  selector: "app-course-preview",
  templateUrl: "./course-preview.component.html",
  styleUrls: ["./course-preview.component.scss"],
})
export class CoursePreviewComponent implements OnInit {
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

  ngOnInit(): void {
    this.userID = this.authService.getToken().id;
    this.getTasks();
  }

  getTasks() {
    this.taskService.getAllTasks(this.data.id).subscribe(
      (allTasks) => {
        this.allTasksFromCourse = allTasks;
        for (var task of this.allTasksFromCourse) {
          if (allTasks.length > 0) {
            this.submissionService
              .getAllSubmissions(this.userID, this.data.id, task.id)
              .subscribe((allSubmissions) => {
                console.log(task);
                console.log(allSubmissions);
                if (allSubmissions.length != 0) {
                  for (var submission of allSubmissions) {
                    for (var checker of submission.results) {
                      if (checker.exitCode == 0) {
                        this.passed++;
                      } else {
                        this.failed++;
                      }
                    }
                  }
                }
              });
          }
        }
      },
      () => {}
    );
  }

  getNrOfAllTasks() {
    if (this.allTasksFromCourse == undefined) {
      return 0;
    }
    return this.allTasksFromCourse.length;
  }

  getSubmissions() {
    let results = [];
    for (let i = 0; i < this.allTasksFromCourse.length; i++) {
      this.submissionService
        .getAllSubmissions(
          this.userID,
          this.data.id,
          this.allTasksFromCourse[i].id
        )
        .subscribe(
          (allSubmission) => {
            console.log(allSubmission);
          },
          () => {}
        );
    }
  }

  /**
   * Show course in detail
   */
  goToCourse() {
    this.router.navigate(["courses", this.data.id]); // TODO: Should be ID
  }
}
