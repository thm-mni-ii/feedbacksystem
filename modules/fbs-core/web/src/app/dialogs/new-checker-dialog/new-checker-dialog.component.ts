import { Component, Inject, OnInit, OnDestroy } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CheckerConfig } from "../../model/CheckerConfig";
import { CheckerService } from "../../service/checker.service";
import { forkJoin, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { CheckerFileType } from "src/app/enums/checkerFileType";
import { TaskProviderService } from "../../service/task-provider.service";
import { TaskProvider } from "../../model/TaskProvider";

@Component({
  selector: "app-new-checker-dialog",
  templateUrl: "./new-checker-dialog.component.html",
  styleUrls: ["./new-checker-dialog.component.scss"],
})
export class NewCheckerDialogComponent implements OnInit, OnDestroy {
  fileCounter = 0;

  checkerForm = new UntypedFormGroup({
    checkerType: new UntypedFormControl(""),
    ord: new UntypedFormControl(""),
    showHints: new UntypedFormControl(false),
    showHintsAt: new UntypedFormControl(0),
    showExtendedHints: new UntypedFormControl(false),
    showExtendedHintsAt: new UntypedFormControl(0),
    disableDistance: new UntypedFormControl(false),
  });
  choosedSQLChecker;
  mainFile: File[] = [];
  secondaryFile: File[] = [];
  mainFileName: string;
  secondaryFileName: string;
  mainFileChanged = false;
  secondaryFileChanged = false;
  isUpdate: boolean;
  courseId: number;
  taskId: number;
  checker: CheckerConfig = {
    checkerTypeInformation: {
      showExtendedHints: false,
      showExtendedHintsAt: 0,
      showHints: false,
      showHintsAt: 0,
      disableDistance: false,
    },
    checkerType: "",
    ord: 0,
  };
  checkerCount: Observable<CheckerConfig[]> = of();
  showHintsConfig;
  showExtendedHintsConfig;
  disableDistance;

  taskProviders: TaskProvider[] = [];
  selectedTaskProvider: TaskProvider | null = null;
  showConfigUi = false;
  safeConfigUiUrl: SafeResourceUrl | null = null;

  constructor(
    public dialogRef: MatDialogRef<NewCheckerDialogComponent>,
    private checkerService: CheckerService,
    private taskProviderService: TaskProviderService,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.courseId = this.data.courseId;
    this.taskId = this.data.taskId;

    if (this.data.checker) {
      this.isUpdate = true;
      this.checker = this.data.checker;
      this.checkerForm.controls["checkerType"].setValue(
        this.checker.checkerType
      );
      this.checkerForm.controls["ord"].setValue(this.checker.ord);

      this.checkerForm.controls["showExtendedHints"].setValue(
        this.checker.checkerTypeInformation.showExtendedHints
      );
      this.checkerForm.controls["showExtendedHintsAt"].setValue(
        this.checker.checkerTypeInformation.showExtendedHintsAt
      );
      this.checkerForm.controls["showHints"].setValue(
        this.checker.checkerTypeInformation.showHints
      );
      this.checkerForm.controls["showHintsAt"].setValue(
        this.checker.checkerTypeInformation.showHintsAt
      );
      this.checkerForm.controls["disableDistance"].setValue(
        this.checker.checkerTypeInformation.disableDistance
      );
    }

    this.defineForm(this.checkerForm.value);
    this.showHintsEvent(this.checkerForm.value);
    this.showExtendedHintsEvent(this.checkerForm.value);

    window.addEventListener("message", this.handlePostMessage);

    this.taskProviderService.getAllActiveTaskProviders().subscribe(
      (providers) => {
        this.taskProviders = providers || [];
        this.defineForm(this.checkerForm.value);
      },
      (err) => {
        console.error("Could not load task providers for checker dialog", err);
      }
    );

    if (this.checker.mainFileUploaded || this.checker.secondaryFileUploaded) {
      if (this.checker.mainFileUploaded) {
        this.mainFile[0] = new File(
          [],
          this.checker.mainFileName || this.mainFileName
        );
      }
      if (this.checker.secondaryFileUploaded) {
        this.secondaryFile[0] = new File(
          [],
          this.checker.secondaryFileName || this.secondaryFileName
        );
      }
    }

    if (this.isUpdate != true) {
      this.setDefaultValues();
    }
  }

  public isRegisteredProvider(id: string): boolean {
    return (this.taskProviders || []).some(
      (tp) => tp.id === id || tp.id === String(id).trim()
    );
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({ success: false });
  }

  /**
   * Create a new task
   * and close dialog
   */
  createChecker(value: any) {
    this.checker.ord = value.ord;
    this.checker.checkerType = value.checkerType;
    this.checker.checkerTypeInformation.showHints = value.showHints;
    this.checker.checkerTypeInformation.showHintsAt = value.showHintsAt;
    this.checker.checkerTypeInformation.disableDistance = value.disableDistance;
    this.checker.checkerTypeInformation.showExtendedHints =
      value.showExtendedHints;
    this.checker.checkerTypeInformation.showExtendedHintsAt =
      value.showExtendedHintsAt;
    const isCustomTp = this.isRegisteredProvider(this.checker.checkerType);
    if (
      this.checker.checkerType &&
      this.checker.ord &&
      (this.mainFile[0] || isCustomTp) &&
      (this.secondaryFile[0] ||
        this.checker.checkerType === "bash" ||
        isCustomTp)
    ) {
      this.checkerService
        .createChecker(this.courseId, this.taskId, this.checker)
        .pipe(
          switchMap((checker) =>
            this.uploadCheckerFiles(
              checker.id,
              this.mainFile[0],
              this.secondaryFile[0]
            )
          )
        )
        .subscribe(
          () => {
            this.dialogRef.close({ success: true });
          },
          (error) => {
            console.error(error);
            this.snackBar.open(
              "Überprüfung erstellen hat nicht funktioniert.",
              "ok"
            );
          }
        );
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
  }

  updateMainFile(event) {
    this.mainFile = event["content"];
    this.mainFileChanged = true;
    this.fileCounter++;
  }

  updateSecondaryFile(event) {
    this.secondaryFile = event["content"];
    this.secondaryFileChanged = true;
    this.fileCounter++;
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask(value: any) {
    this.checker.ord = value.ord;
    this.checker.checkerType = value.checkerType;
    this.checker.checkerTypeInformation.showHints = value.showHints;
    this.checker.checkerTypeInformation.showHintsAt = value.showHintsAt;
    this.checker.checkerTypeInformation.disableDistance = value.disableDistance;
    this.checker.checkerTypeInformation.showExtendedHints =
      value.showExtendedHints;
    this.checker.checkerTypeInformation.showExtendedHintsAt =
      value.showExtendedHintsAt;

    const isCustomTp = this.isRegisteredProvider(this.checker.checkerType);
    if (
      this.checker.checkerType &&
      this.checker.ord &&
      (this.mainFile[0] || this.checker.mainFileUploaded || isCustomTp) &&
      (this.secondaryFile[0] ||
        this.checker.secondaryFileUploaded ||
        this.checker.checkerType === "bash" ||
        isCustomTp)
    ) {
      this.checkerService
        .updateChecker(
          this.courseId,
          this.taskId,
          this.checker.id,
          this.checker
        )
        .pipe(
          switchMap(() =>
            this.uploadCheckerFiles(
              this.checker.id,
              this.mainFileChanged ? this.mainFile[0] : undefined,
              this.secondaryFileChanged ? this.secondaryFile[0] : undefined
            )
          )
        )
        .subscribe(
          () => {
            this.dialogRef.close({ success: true });
          },
          (error) => {
            console.error(error);
            this.snackBar.open(
              "Überprüfung ändern hat nicht funktioniert.",
              "ok"
            );
          }
        );
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
  }

  private uploadCheckerFiles(
    checkerId: number,
    mainFile?: File,
    secondaryFile?: File
  ): Observable<void[]> {
    const uploads: Observable<void>[] = [];

    if (mainFile) {
      uploads.push(
        this.checkerService.updateFile(
          this.courseId,
          this.taskId,
          checkerId,
          CheckerFileType.MainFile,
          mainFile
        )
      );
    }

    if (secondaryFile) {
      uploads.push(
        this.checkerService.updateFile(
          this.courseId,
          this.taskId,
          checkerId,
          CheckerFileType.SecondaryFile,
          secondaryFile
        )
      );
    }

    return uploads.length ? forkJoin(uploads) : of([]);
  }

  setDefaultValues() {
    this.checkerCount = this.checkerService.getChecker(
      this.courseId,
      this.taskId
    );
    this.checkerCount.subscribe((r) => {
      const newCheckerOrder = r.length + 1;
      this.checkerForm.setValue({
        ...this.checkerForm.value,
        checkerType: "sql",
        ord: newCheckerOrder,
      });
      this.defineForm(this.checkerForm.value);
    });
  }
  defineForm(value: any) {
    //set default value to false
    this.choosedSQLChecker = false;

    switch (value.checkerType) {
      case "sql": {
        this.mainFileName = "Aufgaben Konfiguration (.json)";
        this.secondaryFileName = "Datenbank Export (.sql)";
        break;
      }
      case "sql-checker": {
        this.mainFileName = "Aufgaben Konfiguration (.json)";
        this.secondaryFileName = "Datenbank Export (.sql)";
        this.choosedSQLChecker = true;
        break;
      }
      case "bash": {
        this.mainFileName = "Bash Script (.sh)";
        this.secondaryFileName = "Optionale Hilfsdatei (*)";
        break;
      }
      case "excel": {
        this.mainFileName = "Musterlösung (.xlsx)";
        this.secondaryFileName = "Aufgaben Konfiguration (.json)";
        break;
      }
      default: {
        const customTp = this.taskProviders.find(
          (p) => p.id === value.checkerType
        );
        this.selectedTaskProvider = customTp || null;
        this.updateSafeConfigUiUrl();
        if (customTp) {
          this.mainFileName = "Optionale Konfigurationsdatei (*)";
          this.secondaryFileName = "Optionale Hilfsdatei (*)";
        } else {
          this.mainFileName = "Not Implemented Checker Type";
          this.secondaryFileName = "Not Implemented Checker Type";
        }
        break;
      }
    }
  }

  updateSafeConfigUiUrl(): void {
    if (this.selectedTaskProvider?.configUiUrl) {
      let url = this.selectedTaskProvider.configUiUrl;
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}courseId=${this.courseId}&taskId=${this.taskId}`;
      this.safeConfigUiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.safeConfigUiUrl = null;
    }
  }

  toggleConfigUi(): void {
    this.showConfigUi = !this.showConfigUi;
  }

  openConfigUiInNewTab(): void {
    if (!this.selectedTaskProvider?.configUiUrl) return;
    let url = this.selectedTaskProvider.configUiUrl;
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}courseId=${this.courseId}&taskId=${this.taskId}`;
    window.open(url, "_blank");
  }

  canCreateChecker(): boolean {
    if (!this.checkerForm.valid) return false;
    const type = this.checkerForm.value.checkerType;
    if (this.isRegisteredProvider(type)) {
      return true;
    }
    if (!this.mainFile?.length) return false;
    if (type === "bash") return true;
    return (this.secondaryFile?.length || 0) > 0;
  }

  handlePostMessage = (event: MessageEvent): void => {
    if (!event.data) return;
    const data = event.data;
    if (data.type === "FBS_TASK_CONFIG_RESPONSE") {
      const payload = data.payload || data;
      if (payload.filesToUpload && Array.isArray(payload.filesToUpload)) {
        for (const f of payload.filesToUpload) {
          try {
            const byteChars = atob(f.contentBase64 || "");
            const byteNums = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNums[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNums);
            const blob = new Blob([byteArray]);
            const file = new File([blob], f.fileName || "config-file");
            if (f.fileType === "PRIMARY") {
              this.mainFile = [file];
              this.mainFileChanged = true;
            } else if (f.fileType === "SECONDARY") {
              this.secondaryFile = [file];
              this.secondaryFileChanged = true;
            }
          } catch (e) {
            console.error(
              "Failed to parse file from TaskProvider config response",
              e
            );
          }
        }
      }
      this.snackBar.open("Konfiguration aus Task-Provider übernommen.", "OK", {
        duration: 3000,
      });
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener("message", this.handlePostMessage);
  }

  showHintsEvent(value: any) {
    if (value.showHints === false) {
      this.showHintsConfig = false;
    } else {
      this.showHintsConfig = true;
    }
  }
  showExtendedHintsEvent(value: any) {
    if (value.showExtendedHints === false) {
      this.showExtendedHintsConfig = false;
    } else {
      this.showExtendedHintsConfig = true;
    }
  }
}
