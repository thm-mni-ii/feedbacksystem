import { Component, OnInit } from "@angular/core";
import { CheckerConfig } from "../../model/CheckerConfig";
import { Observable, of } from "rxjs";
import { CheckerService } from "../../service/checker.service";
import { TaskService } from "../../service/task.service";
import { ActivatedRoute } from "@angular/router";
import { NewCheckerDialogComponent } from "../../dialogs/new-checker-dialog/new-checker-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../service/auth.service";
import { Roles } from "../../model/Roles";
import { ConfirmDialogComponent } from "../../dialogs/confirm-dialog/confirm-dialog.component";
import { CheckerFileType } from "../../enums/checkerFileType";
import {
  StagedFeedbackConfig,
  StagedFeedbackConfigService,
} from "../../service/staged-feedback-config.service";

@Component({
  selector: "app-configuration-list",
  templateUrl: "./configuration-list.component.html",
  styleUrls: ["./configuration-list.component.scss"],
})
export class ConfigurationListComponent implements OnInit {
  configurations: Observable<CheckerConfig[]> = of();
  courseId: number;
  taskId: number;
  stagedFeedbackConfig: StagedFeedbackConfig = {
    enabled: true,
    initialOrdLimit: 1,
  };
  maxOrder = 1;

  constructor(
    private checkerService: CheckerService,
    private TaskService: TaskService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private stagedFeedbackConfigService: StagedFeedbackConfigService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params) {
        this.courseId = params.id;
        this.taskId = params.tid;
        this.loadConfigurations();
        this.loadStagedConfig();
      }
    });
  }

  private loadConfigurations() {
    this.configurations = this.checkerService.getChecker(
      this.courseId,
      this.taskId
    );
    this.configurations.subscribe((configs) => {
      this.maxOrder = configs.length || 1;
      if (
        this.stagedFeedbackConfig.initialOrdLimit === undefined ||
        this.stagedFeedbackConfig.initialOrdLimit > this.maxOrder
      ) {
        this.stagedFeedbackConfig = {
          ...this.stagedFeedbackConfig,
          initialOrdLimit: Math.min(
            this.maxOrder,
            this.stagedFeedbackConfig.initialOrdLimit || 1
          ),
        };
        this.stagedFeedbackConfigService.set(
          this.courseId,
          this.taskId,
          this.stagedFeedbackConfig
        );
      }
    });
  }

  private loadStagedConfig() {
    const stored = this.stagedFeedbackConfigService.get(
      this.courseId,
      this.taskId
    );
    if (stored) {
      this.stagedFeedbackConfig = stored;
    }
  }

  saveStagedConfig() {
    if (this.stagedFeedbackConfig.initialOrdLimit < 1) {
      this.stagedFeedbackConfig.initialOrdLimit = 1;
    }
    this.stagedFeedbackConfigService.set(
      this.courseId,
      this.taskId,
      this.stagedFeedbackConfig
    );
    this.snackbar.open(
      "Einstellung für gestuftes Feedback gespeichert.",
      "OK",
      { duration: 3000 }
    );
  }

  isAuthorized(): boolean {
    const token = this.authService.getToken();
    const globalRole = token.globalRole;
    const courseRole = token.courseRoles[this.courseId];
    return (
      Roles.GlobalRole.isAdmin(globalRole) ||
      Roles.GlobalRole.isModerator(globalRole) ||
      Roles.CourseRole.isDocent(courseRole) ||
      Roles.CourseRole.isTutor(courseRole)
    );
  }

  addConfig() {
    this.dialog
      .open(NewCheckerDialogComponent, {
        height: "auto",
        width: "50%",
        data: {
          courseId: this.courseId,
          taskId: this.taskId,
        },
      })
      .afterClosed()
      .subscribe(
        (res) => {
          if (res.success) {
            this.snackbar.open("Überprüfung erfolgreich erstellt.", "OK", {
              duration: 3000,
            });
            this.configurations = this.checkerService.getChecker(
              this.courseId,
              this.taskId
            );
          }
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Überprüfung ändern hat nicht funktioniert.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  editConfig(checker: CheckerConfig) {
    // this.checkerService.updateMainFile(this.courseId, this.taskId, checker.id, "test").subscribe(
    // )
    this.dialog
      .open(NewCheckerDialogComponent, {
        height: "auto",
        width: "50%",
        data: {
          checker: checker,
          courseId: this.courseId,
          taskId: this.taskId,
        },
      })
      .afterClosed()
      .subscribe(
        (res) => {
          if (res.success) {
            this.snackbar.open("Überprüfung erfolgreich geändert.", "OK", {
              duration: 3000,
            });
            this.configurations = this.checkerService.getChecker(
              this.courseId,
              this.taskId
            );
          }
        },
        (error) => {
          console.error(error);
          this.snackbar.open(
            "Überprüfung ändern hat nicht funktioniert.",
            "OK",
            { duration: 3000 }
          );
        }
      );
  }

  deleteConfig(checker: CheckerConfig) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          message: "Soll die Überprüfung gelöscht werden?",
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.checkerService
            .deleteChecker(this.courseId, this.taskId, checker.id)
            .subscribe(
              () =>
                (this.configurations = this.checkerService.getChecker(
                  this.courseId,
                  this.taskId
                ))
            );
          this.snackbar.open("Der Checker wurde entfernt.", "OK", {
            duration: 3000,
          });
        }
      });
  }

  downloadMainFile(checker: CheckerConfig) {
    if (checker.mainFileUploaded) {
      this.TaskService.getTask(this.courseId, this.taskId).subscribe((task) => {
        this.checkerService.getFile(
          this.courseId,
          this.taskId,
          checker.id,
          CheckerFileType.MainFile,
          task.name
        );
      });
    } else {
      this.snackbar.open("Es gibt keine Hauptdatei.", "OK", { duration: 3000 });
    }
  }

  downloadSecondaryFile(checker: CheckerConfig) {
    if (checker.secondaryFileUploaded) {
      this.TaskService.getTask(this.courseId, this.taskId).subscribe((task) => {
        this.checkerService.getFile(
          this.courseId,
          this.taskId,
          checker.id,
          CheckerFileType.SecondaryFile,
          task.name
        );
      });
    } else {
      this.snackbar.open("Es gibt keine Hauptdatei.", "OK", { duration: 3000 });
    }
  }
}
