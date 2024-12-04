import { Component, OnInit, Input, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TitlebarService } from "../../service/titlebar.service";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { mergeMap } from "rxjs/operators";
import { of, Observable, forkJoin } from "rxjs";
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
import { ExportTasksDialogComponent } from "src/app/dialogs/export-tasks-dialog/export-tasks-dialog.component";
import { Requirement } from "src/app/model/Requirement";
import { TaskPointsService } from "../../service/task-points.service";

@Component({
  selector: "app-course-detail",
  templateUrl: "./course-detail.component.html",
  styleUrls: ["./course-detail.component.scss"],
})
export class CourseDetailComponent implements OnInit {
  @Input() requirements: Observable<Requirement[]>;

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
    private taskPointsService: TaskPointsService,
    private cdr: ChangeDetectorRef
  ) {}
  punkte: number = 0;
  listing: any[] = [];
  courseID: number;
  tasks: Task[];
  taskResults: Record<number, UserTaskResult>;
  role: string = null;
  course: Observable<Course> = of();
  openConferences: Observable<string[]>;
  legends = ["green", "red", "#1E457C"];
  userID: number;
  pointlist: number[] = [];

  coursePassed: boolean = false;
  calculatedBonusPoints: number = 0;
  courseProgressBar: any = {
    mandatory: {
      done: 0,
      failed: 0,
      submitted: 0,
      sum: 0,
      done_percent: 0,
      failed_percent: 0,
    },
    optional: {
      done: 0,
      failed: 0,
      submitted: 0,
      sum: 0,
      done_percent: 0,
      failed_percent: 0,
    },
    practice: {
      done: 0,
      failed: 0,
      submitted: 0,
      sum: 0,
      done_percent: 0,
      failed_percent: 0,
    },
  };

  editTasks: boolean = false;
  selectedTasks: Task[] = [];

  ngOnInit() {
    this.route.params.subscribe((param) => {
      this.courseID = param.id;
      this.courseID = param.id;

      this.courseID = param.id;

      this.reloadCourse();
      this.reloadTasks();
    });

    this.calculateCourseProgressBar();
    this.calculateBonusPoints();

    this.role = this.auth.getToken().courseRoles[this.courseID];
    this.userID = this.authService.getToken().id;
    if (this.goToService.getAndClearAutoJoin() && !this.role) {
      this.courseRegistrationService
        .registerCourse(this.userID, this.courseID)
        .subscribe(
          () =>
            this.courseService
              .getCourse(this.courseID)
              .subscribe(() => this.ngOnInit()),
          (error) => console.error(error)
        );
    }
  }

  calculateCourseProgressBar() {
    forkJoin([
      this.taskService.getTaskResults(this.courseID),
      this.taskService.getAllTasks(this.courseID),
      //this.taskPointsService.getAllRequirements(this.courseID),
    ]).subscribe({
      next: ([taskResults, tasks]) => {
        // merge taskResults and tasks by id
        let allTasks = taskResults.map((taskResult) => {
          return {
            ...taskResult,
            ...tasks.find((task) => task.id == taskResult.taskID),
          };
        });
        // ignore private tasks
        let visibleTasks = allTasks.filter((task) => !task.isPrivate);

        // calculate progress
        this.getStatsFromTasksType(
          visibleTasks,
          this.courseProgressBar.mandatory,
          "mandatory"
        );
        this.getStatsFromTasksType(
          visibleTasks,
          this.courseProgressBar.optional,
          "optional"
        );
        this.getStatsFromTasksType(
          visibleTasks,
          this.courseProgressBar.practice,
          "practice"
        );
      },
    });
  }

  calculateBonusPoints() {
    forkJoin([
      this.taskService.getTaskResults(this.courseID),
      this.taskPointsService.getAllRequirements(this.courseID),
    ]).subscribe(([taskResults, req]) => {
      this.listing = Object.values(taskResults);
      this.requirements = of(req);

      // calculate total bonus points based on succeded requirements
      this.calculatedBonusPoints = 0;

      // check in requirements if tasks are passed based on taskResults, match via id
      if (req.length > 0) {
        this.coursePassed = true;
        req.forEach((requirement) => {
          let passedTasks = requirement.tasks.filter((task) => {
            return taskResults.find(
              (taskResult) => taskResult.taskID == task.id && taskResult.passed
            );
          });

          if (passedTasks.length >= requirement.toPass) {
            const regex = /x/g;
            // if the bonusFormula contains an x
            if (requirement.bonusFormula.includes("x")) {
              let bonusFormula = requirement.bonusFormula.replace(
                regex,
                passedTasks.length.toString()
              );
              this.calculatedBonusPoints += eval(bonusFormula);
            } else if (Number.parseFloat(requirement.bonusFormula) > 0) {
              this.calculatedBonusPoints +=
                passedTasks.length *
                Number.parseFloat(requirement.bonusFormula);
            }
          } else {
            this.coursePassed = false;
          }
        });
      } else {
        this.calculatedBonusPoints = 0;
        this.coursePassed = false;
      }

      // old code
      this.assignpoints();
      req.forEach((element) => {
        this.increment(element);
      });
      // old code
    });
  }

  getStatsFromTasksType(tasks: any[], stats: any, type: string) {
    let tasksOfType = tasks.filter((task) => task.requirementType == type);
    stats.sum = tasksOfType.length;
    // not the actual number of failed tasks, but the number of possible failed submissions for the buffer length
    // will be vizually overwritten by stats.done
    stats.submitted = tasksOfType.filter((task) => task.submission).length;
    stats.failed = tasksOfType.filter(
      (task) => !task.passed && task.submission
    ).length;
    stats.done = tasksOfType.filter((task) => task.passed).length;

    // calculate percentages
    stats.done_percent = (stats.done / stats.sum) * 100;
    stats.failed_percent =
      (stats.failed / stats.sum) * 100 + stats.done_percent;
  }

  public canEdit(): boolean {
    const globalRole = this.authService.getToken().globalRole;
    if (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole)
    ) {
      return true;
    }

    const courseRole = this.authService.getToken().courseRoles[this.courseID];
    return (
      Roles.CourseRole.isTutor(courseRole) ||
      Roles.CourseRole.isDocent(courseRole)
    );
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

  assignpoints() {
    this.pointlist = [];

    this.requirements.subscribe((value) => {
      this.listing.forEach((element) => {
        for (let reqcounter = 0; reqcounter < value.length; reqcounter++) {
          for (
            let taskcounter = 0;
            taskcounter < value[reqcounter].tasks.length;
            taskcounter++
          ) {
            if (
              element.taskID == value[reqcounter].tasks[taskcounter].id &&
              element.passed == true
            ) {
              element.points = 1;
              /*
              if (element.bonusFormula === undefined) {
                element.bonusFormula = "0";

                points = +element.bonusFormula;
              }
              else {
                points = +element.bonusFormula;
              }

              points = +element.bonusFormula;
              points += element.points;
              element.bonusFormula = points.toString();

              */
            }
          }
        }
      });
    });
  }

  increment(requirementObservable: Requirement): void {
    let points: number = 0;

    this.listing.forEach((element) => {
      for (
        let taskcounter = 0;
        taskcounter < requirementObservable.tasks.length;
        taskcounter++
      ) {
        if (
          element.taskID == requirementObservable.tasks[taskcounter].id &&
          element.passed == true
        ) {
          points += element.points;
        }
      }
    });

    this.pointlist.push(points);
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

  openExportDialog() {
    this.dialog.open(ExportTasksDialogComponent, {
      height: "auto",
      width: "40%",
      data: { courseId: this.courseID, tasks: this.tasks },
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

  updateMultipleTaskDetails(tasks: Task[]) {
    this.dialog
      .open(TaskNewDialogComponent, {
        height: "auto",
        width: "50%",
        data: { courseId: this.courseID, tasks: tasks },
      })
      .afterClosed();
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
              () =>
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
      .subscribe(() => {
        this.courseRegistrationService
          .deregisterCourse(this.authService.getToken().id, this.courseID)
          .subscribe(
            () => {
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
          () => {
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

        setTimeout(() => {
          forkJoin([
            this.taskService.getTaskResults(this.courseID),
            this.taskPointsService.getAllRequirements(this.courseID),
          ]).subscribe(([taskResults, req]) => {
            this.listing = Object.values(taskResults);

            this.requirements = of(req);
            this.assignpoints();

            req.forEach((element) => {
              this.increment(element);
            });
          });
        }, 1500);
      });
  }

  enableEditTasks() {
    this.editTasks = !this.editTasks;
  }

  toggleSelection(event, task: Task) {
    if (event) {
      this.selectedTasks.push(task);
    } else {
      // delete only the task with the same id
      this.selectedTasks = this.selectedTasks.filter((t) => t.id !== task.id);
    }
  }

  isInSelectedTasks(task: Task): boolean {
    return this.selectedTasks.some((t) => t.id === task.id);
  }

  changeAllSelections() {
    if (this.isAllSelected()) {
      this.selectedTasks = [];
    } else {
      this.selectedTasks = this.tasks;
    }
  }

  isAllSelected(): boolean {
    return this.selectedTasks.length == this.tasks.length;
  }
}
