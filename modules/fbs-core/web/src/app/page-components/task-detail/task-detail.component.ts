import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { TitlebarService } from "../../service/titlebar.service";
import { UserService } from "../../service/user.service";
import { TaskNewDialogComponent } from "../../dialogs/task-new-dialog/task-new-dialog.component";
import { TaskService } from "../../service/task.service";
import { Task } from "src/app/model/Task";
import { CourseService } from "../../service/course.service";
import { AuthService } from "../../service/auth.service";
import { Submission } from "../../model/Submission";
import { SubmissionService } from "../../service/submission.service";
import { tap, map, mergeMap, concatMap, takeWhile } from "rxjs/operators";
import { of, from, Observable } from "rxjs";
import { Roles } from "../../model/Roles";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { UserTaskResult } from "../../model/UserTaskResult";
import { CheckerService } from "src/app/service/checker.service";
import { CheckerConfig } from "src/app/model/CheckerConfig";
import {
  StagedFeedbackConfig,
  StagedFeedbackConfigService,
} from "src/app/service/staged-feedback-config.service";

/**
 * Shows a task in detail
 */
@Component({
  selector: "app-task-detail",
  templateUrl: "./task-detail.component.html",
  styleUrls: ["./task-detail.component.scss"],
})
export class TaskDetailComponent implements OnInit {
  allTasks: Task[];
  currentTaskIndex: number;
  courseId: number;
  task: Task;
  taskResult: UserTaskResult;
  uid: number;
  submissions: Submission[];
  lastSubmission: Submission;
  pending = false;
  ready = false;
  deadlinePassed = false;
  isCheckerEmpty: boolean;
  checkerConfigs: CheckerConfig[] = [];
  initialCheckerOrders: number[] = [];
  deferredCheckerOrders: number[] = [];
  detailedFeedbackPending = false;
  expectedResultCountAfterRequest: number | null = null;
  stagedFeedbackConfig: StagedFeedbackConfig = {
    enabled: false,
    initialOrdLimit: 1,
  };

  get latestResult() {
    if (this.submissions?.length > 0) {
      const submission = this.submissions[this.submissions.length - 1];
      return submission.results[submission.results.length - 1];
    }
  }

  constructor(
    private route: ActivatedRoute,
    private titlebar: TitlebarService,
    private dialog: MatDialog,
    private user: UserService,
    private snackbar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private router: Router,
    private taskService: TaskService,
    private courseService: CourseService,
    private submissionService: SubmissionService,
    private authService: AuthService,
    private checkerService: CheckerService,
    private stagedFeedbackConfigService: StagedFeedbackConfigService
  ) {
    // Check if task reached deadline TODO: this needs work
    // setInterval(() => {
    //   if (!this.status) {
    //     let now: number = Date.now();
    //     this.deadlinePassed = this.reachedDeadline(now, this.task.deadline);
    //   }
    // }, 1000);
  }

  submissionData: string | File;
  submissionAdditionalInformation: Record<string, any>;

  isLastTask() {
    if (this.currentTaskIndex == this.allTasks.length - 1) {
      return true;
    }
    return false;
  }

  isFirstTask() {
    if (this.currentTaskIndex == 0) {
      return true;
    }
    return false;
  }

  goToNextUnresolvedTask() {
    let nextTasks = [];
    let nextTaskId: number;
    let isUnsolved = false;
    for (
      let index = this.currentTaskIndex + 1;
      index < this.allTasks.length;
      index++
    ) {
      nextTasks.push(this.allTasks[index]);
    }
    from(nextTasks)
      .pipe(
        concatMap((task) =>
          this.taskService.getTaskResult(this.courseId, task.id)
        ),
        map((result) => result),
        takeWhile(() => !isUnsolved)
      )
      .subscribe((result) => {
        if (!result.passed) {
          isUnsolved = true;
          nextTaskId = result.taskID;
          this.router
            .navigateByUrl("/", { skipLocationChange: true })
            .then(() => {
              this.router.navigate([
                "/courses",
                this.courseId,
                "task",
                nextTaskId,
              ]);
            });
        }
      });
  }

  goToPreviousUnresolvedTask() {
    let previousTasks = [];
    let previousTaskId;
    let isUnsolved = false;
    for (let index = this.currentTaskIndex - 1; index >= 0; index--) {
      previousTasks.push(this.allTasks[index]);
    }
    from(previousTasks)
      .pipe(
        concatMap((task) =>
          this.taskService.getTaskResult(this.courseId, task.id)
        ),
        map((result) => result),
        takeWhile(() => !isUnsolved)
      )
      .subscribe((result) => {
        if (!result.passed) {
          isUnsolved = true;
          previousTaskId = result.taskID;
          this.router
            .navigateByUrl("/", { skipLocationChange: true })
            .then(() => {
              this.router.navigate([
                "/courses",
                this.courseId,
                "task",
                previousTaskId,
              ]);
            });
        }
      });
  }

  goToNextTask() {
    if (this.currentTaskIndex + 1 < this.allTasks.length) {
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([
          "/courses",
          this.courseId,
          "task",
          this.allTasks[this.currentTaskIndex + 1].id,
        ]);
      });
    }
  }

  goToPreviousTask() {
    if (this.currentTaskIndex - 1 >= 0) {
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigate([
          "/courses",
          this.courseId,
          "task",
          this.allTasks[this.currentTaskIndex - 1].id,
        ]);
      });
    }
  }

  getTasks() {
    this.taskService.getAllTasks(this.courseId).subscribe(
      (allTasks) => {
        this.allTasks = allTasks;
      },
      () => {}
    );
  }

  private loadCheckerConfig() {
    this.checkerConfigs = [];
    this.initialCheckerOrders = [];
    this.deferredCheckerOrders = [];
    this.checkerService.getChecker(this.courseId, this.task.id).subscribe(
      (checkerConfigs) => {
        this.checkerConfigs = checkerConfigs.sort((a, b) => a.ord - b.ord);
        this.isCheckerEmpty = checkerConfigs.length === 0;
        this.loadStagedFeedbackConfig().subscribe((stagedFeedbackConfig) => {
          const orders = this.checkerConfigs.map((c) => c.ord);
          if (!stagedFeedbackConfig.enabled) {
            this.initialCheckerOrders = orders;
            this.deferredCheckerOrders = [];
            return;
          }
          const limit =
            stagedFeedbackConfig.initialOrdLimit ??
            (orders.length ? orders[0] : 1);
          this.initialCheckerOrders = orders.filter((ord) => ord <= limit);
          this.deferredCheckerOrders = orders.filter((ord) => ord > limit);
        });
      },
      (error) => console.error(error)
    );
  }

  private loadStagedFeedbackConfig(): Observable<StagedFeedbackConfig> {
    return this.stagedFeedbackConfigService
      .get(this.courseId, this.task.id)
      .pipe(
        tap((stored) => {
          if (stored) {
            this.stagedFeedbackConfig = stored;
          } else {
            this.stagedFeedbackConfig = {
              enabled: false,
              initialOrdLimit: 1,
            };
          }
        })
      );
  }

  ngOnInit() {
    this.route.params
      .pipe(
        mergeMap((params) => {
          this.courseId = params.id;
          const taskId = params.tid;
          this.getTasks();
          return this.taskService.getTask(this.courseId, taskId);
        }),
        mergeMap((task) => {
          return this.taskService
            .getTaskResult(this.courseId, task.id)
            .pipe(map((taskResult) => ({ task, taskResult })));
        }),
        mergeMap(({ task, taskResult }) => {
          this.task = task;
          this.currentTaskIndex = this.allTasks.findIndex(
            (task) => task.id == this.task.id
          );
          this.taskResult = taskResult;
          this.uid = this.authService.getToken().id;
          this.titlebar.emitTitle(this.task.name);
          this.deadlinePassed = this.reachedDeadline(
            Date.now(),
            Date.parse(task.deadline)
          );
          this.ready = true;
          return this.submissionService.getAllSubmissions(
            this.uid,
            this.courseId,
            task.id
          );
        }),
        tap((submissions) => {
          this.submissions = submissions;
          if (submissions.length !== 0) {
            this.lastSubmission = submissions[submissions.length - 1];
            this.pending = !this.lastSubmission.done;
            if (this.detailedFeedbackPending) {
              const missingOrders = this.getMissingDetailedCheckerOrders();
              if (
                (this.expectedResultCountAfterRequest !== null &&
                  this.lastSubmission.results.length >=
                    this.expectedResultCountAfterRequest) ||
                missingOrders.length === 0
              ) {
                this.detailedFeedbackPending = false;
                this.expectedResultCountAfterRequest = null;
              }
            }
          }
        })
      )
      .subscribe(
        () => {
          this.loadCheckerConfig();
          this.refreshByPolling();
        },
        (error) => console.error(error)
      );
  }

  private refreshByPolling(force = false) {
    setTimeout(() => {
      if (force || this.pending || this.detailedFeedbackPending) {
        this.ngOnInit();
      }
    }, 5000); // 5 Sec
  }

  private reachedDeadline(now: number, deadline: number): boolean {
    return now > deadline;
  }

  public submissionTypeOfTask(): String {
    const mediaType = this.task?.mediaType;
    switch (mediaType) {
      case "text/plain":
        return "text";
      case "application/x-spreadsheet":
        return "spreadsheet";
      case "text/html":
        return "rich";
      case "text/sql":
        return "code";
      default:
        return "file";
    }
  }

  isSubmissionEmpty(): boolean {
    const input = this.submissionData;
    if (!input) {
      return true;
    }
    if (typeof input === "object") {
      const inputObject = <any>input;
      if (inputObject.name) {
        return (<File>input).size === 0;
      } else if (inputObject.complete !== undefined) {
        return inputObject.complete === false;
      }
    } else if (typeof input === "string") {
      return (<string>input).trim().length === 0;
    }
  }

  /**
   * Submission of user solution
   */
  submission() {
    if (this.isSubmissionEmpty()) {
      this.snackbar.open(
        "Sie haben keine Lösung für die Aufgabe " +
          this.task.name +
          " abgegeben",
        "Ups!"
      );
      return;
    }
    this.detailedFeedbackPending = false;
    this.expectedResultCountAfterRequest = null;
    const initialCheckerOrders =
      this.stagedFeedbackConfig.enabled &&
      this.initialCheckerOrders.length > 0 &&
      this.initialCheckerOrders.length !== this.checkerConfigs.length
        ? this.initialCheckerOrders
        : undefined;
    this.submit(initialCheckerOrders);
    this.submissionService.emitFileSubmission();
  }

  private submit(checkerOrders?: Array<number | string>) {
    this.pending = true;
    const token = this.authService.getToken();
    this.submissionService
      .submitSolution(
        token.id,
        this.courseId,
        this.task.id,
        this.submissionData,
        this.submissionAdditionalInformation,
        checkerOrders
      )
      .subscribe(
        () => {
          this.snackbar.open("Deine Abgabe wird ausgewertet.", "OK", {
            duration: 3000,
          });
          this.pending = true;
          this.ngOnInit();
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Beim Versenden ist ein Fehler aufgetreten. Versuche es später erneut.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  public canEdit(): boolean {
    const globalRole = this.authService.getToken().globalRole;
    if (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole)
    ) {
      return true;
    }

    const courseRole = this.authService.getToken().courseRoles[this.courseId];
    return (
      Roles.CourseRole.isTutor(courseRole) ||
      Roles.CourseRole.isDocent(courseRole)
    );
  }

  updateSubmissionContent(data: any) {
    let submissionData = data["content"];

    // Only upload single file
    if (Array.isArray(submissionData)) {
      submissionData = submissionData[0];
    }

    this.submissionData = submissionData;
    this.submissionAdditionalInformation = data["additionalInformation"];
  }

  get showDetailedFeedbackBox(): boolean {
    return (
      !this.pending &&
      !this.detailedFeedbackPending &&
      this.isQuickCheckFailed() &&
      this.getMissingDetailedCheckerOrders().length > 0
    );
  }

  private getCheckerIdByOrder(order?: number): number | undefined {
    if (order === undefined) {
      return undefined;
    }
    return this.checkerConfigs.find((checker) => checker.ord === order)?.id;
  }

  private hasResultForOrder(order: number): boolean {
    const configId = this.getCheckerIdByOrder(order);
    if (!configId || !this.lastSubmission) {
      return false;
    }
    return this.lastSubmission.results.some(
      (result) => result.configurationId === configId
    );
  }

  private getMissingDetailedCheckerOrders(): number[] {
    return this.deferredCheckerOrders.filter(
      (order) => !this.hasResultForOrder(order)
    );
  }

  private isQuickCheckFailed(): boolean {
    if (
      !this.stagedFeedbackConfig.enabled ||
      !this.lastSubmission ||
      this.initialCheckerOrders.length === 0
    ) {
      return false;
    }
    const hasFailingQuick = this.initialCheckerOrders.some((order) => {
      const configId = this.getCheckerIdByOrder(order);
      const quickResult = this.lastSubmission.results.find(
        (result) => result.configurationId === configId
      );
      return quickResult && quickResult.exitCode !== 0;
    });
    return hasFailingQuick;
  }

  requestDetailedFeedback() {
    if (!this.lastSubmission) {
      return;
    }
    const missingOrders = this.getMissingDetailedCheckerOrders();
    if (missingOrders.length === 0) {
      return;
    }
    this.detailedFeedbackPending = true;
    this.expectedResultCountAfterRequest =
      this.lastSubmission.results.length + missingOrders.length;
    const token = this.authService.getToken();
    this.submissionService
      .restartSubmission(
        token.id,
        this.courseId,
        this.task.id,
        this.lastSubmission.id,
        missingOrders
      )
      .subscribe(
        () => {
          this.snackbar.open("Ausführliches Feedback wird erstellt.", "OK", {
            duration: 3000,
          });
          this.refreshByPolling(true);
        },
        (error) => {
          console.error(error);
          this.detailedFeedbackPending = false;
          this.expectedResultCountAfterRequest = null;
          this.snackbar.open(
            "Das ausführliche Feedback konnte nicht gestartet werden.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  // TODO: there is no route for this
  // public runAllTaskAllUsers() {
  //   this.taskService.restartAllSubmissions(1,1,1,1)
  // }

  reRun() {
    if (this.lastSubmission != null) {
      const token = this.authService.getToken();
      this.submissionService
        .restartSubmission(
          token.id,
          this.courseId,
          this.task.id,
          this.lastSubmission.id
        )
        .subscribe(
          () => {
            this.ngOnInit();
          },
          (error) => console.error(error)
        );
    }
  }

  /**
   * Opens dialog to update task
   */
  updateTask() {
    this.dialog
      .open(TaskNewDialogComponent, {
        height: "auto",
        width: "50%",
        data: {
          courseId: this.courseId,
          task: this.task,
        },
      })
      .afterClosed()
      .subscribe(
        (res) => {
          if (res.success) {
            this.snackbar.open(
              "Update der Aufgabe " + this.task.name + " erfolgreich",
              "OK",
              { duration: 3000 }
            );
            this.ngOnInit();
          }
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Update der Aufgabe " +
              this.task.name +
              " hat leider nicht funktioniert.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  /**
   * Opens snackbar and asks
   * if docent/tutor really wants to delete
   * this task
   */
  deleteTask() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: "Aufgabe löschen",
          message: `Aufgabe ${this.task.name} wirklich löschen? (Alle zugehörigen Abgaben werden damit auch gelöscht!)`,
        },
      })
      .afterClosed()
      .pipe(
        mergeMap((confirmed) => {
          return confirmed
            ? this.taskService
                .deleteTask(this.courseId, this.task.id)
                .pipe(map(() => true))
            : of(false);
        })
      )
      .subscribe(
        (res) => {
          if (res) {
            setTimeout(
              () => this.router.navigate(["courses", this.courseId]),
              1000
            );
          }
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Aufgabe konnte leider nicht gelöscht werden.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  checkersConfigurable() {
    return this.ready && this.submissionTypeOfTask() !== "spreadsheet";
  }

  downloadTask() {
    this.taskService.downloadTask(this.courseId, this.task.id, this.task.name);
  }
}
