import { Component, OnInit } from "@angular/core";
import { TaskService } from "../../service/task.service";
import { AuthService } from "../../service/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { ExternalClassroomService } from "../../service/external-classroom.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CourseService } from "../../service/course.service";
import { CourseRegistrationService } from "../../service/course-registration.service";
import { FeedbackAppService } from "../../service/feedback-app.service";
import { GoToService } from "../../service/goto.service";
import { Task } from "../../model/Task";
import { UserTaskResult } from "../../model/UserTaskResult";
import { Observable, of } from "rxjs";
import { Course } from "../../model/Course";
import { Roles } from "../../model/Roles";
import { CheckerService } from "../../service/checker.service";
import { CheckerConfig } from "../../model/CheckerConfig";

@Component({
  selector: "app-sql-checker",
  templateUrl: "./sql-checker.component.html",
  styleUrls: ["./sql-checker.component.scss"],
})
export class SqlCheckerComponent implements OnInit {
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private titlebar: TitlebarService,
    public externalClassroomService: ExternalClassroomService,
    private dialog: MatDialog,
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private router: Router,
    private courseService: CourseService,
    private courseRegistrationService: CourseRegistrationService,
    private feedbackAppService: FeedbackAppService,
    private goToService: GoToService,
    private checkerService: CheckerService
  ) {}
  checkerConfig: Observable<CheckerConfig[]> = of();
  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;

  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.courseID = parseInt(param.id, 10) || Number(param.id) || 0;
      try {
        const uid = this.authService.getToken().id;
        this.role =
          this.auth.getToken().courseRoles?.[this.courseID] ||
          this.auth.getToken().courseRoles?.[this.courseID.toString()] ||
          null;
        this.auth.fetchCourseRoles(uid).subscribe((roles) => {
          this.role =
            roles?.[this.courseID] ||
            roles?.[this.courseID.toString()] ||
            null;
        });
      } catch {
        // ignore
      }
    });
    this.taskService.getAllTasks(this.courseID).subscribe((tasks) => {
      this.taskService
        .getTaskResults(this.courseID)
        .subscribe((taskResults) => {
          this.tasks = tasks;
          this.taskResults = taskResults.reduce((acc, res) => {
            acc[res.taskID] = res;
            return acc;
          }, {});
        });
    });
    if (this.goToService.getAndClearAutoJoin() && !this.role) {
      this.courseRegistrationService
        .registerCourse(this.authService.getToken().id, this.courseID)
        .subscribe(
          () =>
            this.auth
              .fetchCourseRoles(this.authService.getToken().id)
              .subscribe(() => this.ngOnInit()),
          (error) => console.error(error)
        );
    }
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole =
      this.role ||
      token.courseRoles?.[this.courseID] ||
      token.courseRoles?.[this.courseID.toString()];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }
}
