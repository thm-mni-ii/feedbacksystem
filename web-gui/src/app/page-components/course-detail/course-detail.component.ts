import { Component, Inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DOCUMENT } from "@angular/common";
import { mergeMap } from "rxjs/operators";
import { of, Observable } from "rxjs";
import { TaskNewDialogComponent } from "../../dialogs/task-new-dialog/task-new-dialog.component";
import { CourseUpdateDialogComponent } from "../../dialogs/course-update-dialog/course-update-dialog.component";
import { AuthService } from "../../service/auth.service";
import { Roles } from "../../model/Roles";
import { TaskService } from "../../service/task.service";
import { Course } from "../../model/Course";
import { Task } from "../../model/Task";
import { CourseService } from "../../service/course.service";
import { CourseRegistrationService } from "../../service/course-registration.service";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { FeedbackAppService } from "../../service/feedback-app.service";
import { GotoLinksDialogComponent } from "../../dialogs/goto-links-dialog/goto-links-dialog.component";
import { GoToService } from "../../service/goto.service";
import { TaskPointsDialogComponent } from "../../dialogs/task-points-dialog/task-points-dialog.component";
import { ExternalClassroomService } from "../../service/external-classroom.service";
import { UserTaskResult } from "../../model/UserTaskResult";

@Component({
  selector: "app-course-detail",
  templateUrl: "./course-detail.component.html",
  styleUrls: ["./course-detail.component.scss"],
})
export class CourseDetailComponent implements OnInit {
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
    @Inject(DOCUMENT) document
  ) {}

  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;

  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.courseID = param.id;
      this.reloadCourse();
      this.reloadTasks();
    });
    this.role = this.auth.getToken().courseRoles[this.courseID];
    if (this.goToService.getAndClearAutoJoin() && !this.role) {
      this.courseRegistrationService
        .registerCourse(this.authService.getToken().id, this.courseID)
        .subscribe(
          () =>
            this.courseService
              .getCourse(this.courseID)
              .subscribe(() => this.ngOnInit()),
          (error) => console.error(error)
        );
    }
  }

  private reloadCourse() {
    this.course = this.courseService.getCourse(this.courseID);
    this.course.subscribe((course) => {
      this.titlebar.emitTitle(course.name);
    });
    this.courseRegistrationService
      .getRegisteredCourses(this.authService.getToken().id)
      .subscribe((course) => {
        const c = course.find((_c) => _c.id === this.courseID);
        if (c && !this.role) {
          this.role = "STUDENT";
        }
      });
  }

  reloadTasks() {
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
  }

  updateCourse() {
    this.courseService
      .getCourse(this.courseID)
      .pipe(
        mergeMap((course) =>
          this.dialog
            .open(CourseUpdateDialogComponent, {
              width: "50%",
              data: { course: course, isUpdateDialog: true },
            })
            .afterClosed()
        )
      )
      .subscribe((res) => {
        if (res.success) {
          this.reloadCourse();
        }
      });
  }

  createTask() {
    this.dialog
      .open(TaskNewDialogComponent, {
        height: "auto",
        width: "50%",
        data: { courseId: this.courseID },
      })
      .afterClosed()
      .subscribe(
        (result) => {
          if (result.success) {
            this.router
              .navigate(["courses", this.courseID, "task", result.task.id])
              .then();
          }
        },
        (error) => console.error(error)
      );
  }

  /**
   * Join a course by registering into it.
   */
  joinCourse() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Kurs beitreten?",
          message: "Wollen Sie diesem Kurs beitreten?",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.courseRegistrationService
            .registerCourse(this.authService.getToken().id, this.courseID)
            .subscribe(
              (_) =>
                this.courseService
                  .getCourse(this.courseID)
                  .subscribe(() => this.ngOnInit()),
              (error) => console.error(error)
            );
        }
      });
  }

  /**
   * Leave the course by de-registering from it.
   */
  exitCourse() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Kurs verlassen?",
          message:
            "Wollen Sie diesen Kurs verlassen? Alle ihre Abgaben könnten verloren gehen!",
        },
      })
      .afterClosed()
      .subscribe((_) => {
        this.courseRegistrationService
          .deregisterCourse(this.authService.getToken().id, this.courseID)
          .subscribe(
            (ok) => {
              this.router.navigate(["/courses"]).then();
            },
            (error) => console.error(error)
          );
      });
  }

  public isAuthorized(ignoreTutor: boolean = false) {
    const token = this.auth.getToken();
    const courseRole = token.courseRoles[this.courseID];
    const globalRole = token.globalRole;
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      (Roles.CourseRole.isTutor(courseRole) && !ignoreTutor)
    );
  }

  joinClassroom() {
    this.externalClassroomService.join(this.courseID);
  }

  deleteCourse() {
    this.course.subscribe((course) => {
      this.dialog
        .open(ConfirmDialogComponent, {
          data: {
            title: "Kurs Löschen",
            message: `Kurs ${course.name} wirklich löschen? (Alle zugehörigen Aufgaben werden damit auch gelöscht!)`,
          },
        })
        .afterClosed()
        .pipe(
          mergeMap((confirmed) => {
            if (confirmed) {
              return this.courseService.deleteCourse(this.courseID);
            } else {
              return of();
            }
          })
        )
        .subscribe(
          (ok) => {
            this.router.navigate(["courses"]).then();
          },
          (error) => console.error(error)
        );
    });
  }

  showGoLinks() {
    this.dialog.open(GotoLinksDialogComponent, {
      height: "auto",
      width: "auto",
      data: { courseID: this.courseID },
    });
  }

  goToFBA() {
    this.feedbackAppService.open(this.courseID, true).subscribe(() => {});
  }

  editPoints() {
    this.dialog
      .open(TaskPointsDialogComponent, {
        height: "85%",
        width: "80rem",
        data: {
          courseID: this.courseID,
          tasks: this.tasks,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.snackbar.open("Punktevergabe abgeschlossen");
        }
      });
  }
}
