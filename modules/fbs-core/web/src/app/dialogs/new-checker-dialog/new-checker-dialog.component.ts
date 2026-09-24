import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CheckerConfig } from "../../model/CheckerConfig";
import { CheckerService } from "../../service/checker.service";
import { forkJoin, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import { CheckerFileType } from "src/app/enums/checkerFileType";

@Component({
  selector: "app-new-checker-dialog",
  templateUrl: "./new-checker-dialog.component.html",
  styleUrls: ["./new-checker-dialog.component.scss"],
})
export class NewCheckerDialogComponent implements OnInit {
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

  constructor(
    public dialogRef: MatDialogRef<NewCheckerDialogComponent>,
    private checkerService: CheckerService,
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
    if (
      this.checker.checkerType &&
      this.checker.ord &&
      this.mainFile[0] &&
      (this.secondaryFile[0] || this.checker.checkerType === "bash")
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

    if (
      this.checker.checkerType &&
      this.checker.ord &&
      (this.mainFile[0] || this.checker.mainFileUploaded) &&
      (this.secondaryFile[0] ||
        this.checker.secondaryFileUploaded ||
        this.checker.checkerType === "bash")
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
        this.mainFileName = "Not Implemented Checker Type";
        this.secondaryFileName = "Not Implemented Checker Type";
        break;
      }
    }
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
