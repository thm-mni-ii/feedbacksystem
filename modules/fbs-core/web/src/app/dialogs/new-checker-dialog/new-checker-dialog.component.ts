import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CheckerConfig } from "../../model/CheckerConfig";
import { CheckerService } from "../../service/checker.service";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
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

    if (this.checker.mainFileUploaded || this.checker.secondaryFileUploaded) {
      this.checkerService
        .getChecker(this.courseId, this.taskId)
        .pipe(
          map((checkers) =>
            checkers.find((checker) => checker.id == this.data.checker.id)
          )
        )
        .subscribe((checker) => {
          if (this.checker.mainFileUploaded) {
            this.checkerService
              .fetchFile(
                this.courseId,
                this.taskId,
                checker.id,
                CheckerFileType.MainFile
              )
              .subscribe((mainFileBlob) => {
                this.mainFile[0] = new File([mainFileBlob], this.mainFileName);
                this.fileCounter++;
              });
          }
          if (this.checker.secondaryFileUploaded) {
            this.checkerService
              .fetchFile(
                this.courseId,
                this.taskId,
                checker.id,
                CheckerFileType.SecondaryFile
              )
              .subscribe((secondaryFileBlob) => {
                this.secondaryFile[0] = new File(
                  [secondaryFileBlob],
                  this.secondaryFileName
                );
                this.fileCounter++;
              });
          }
        });
    }

    this.defineForm(this.checkerForm.value);
    this.showHintsEvent(this.checkerForm.value);
    this.showExtendedHintsEvent(this.checkerForm.value);

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
      this.mainFile &&
      (this.secondaryFile || this.checker.checkerType === "bash")
    ) {
      this.checkerService
        .createChecker(this.courseId, this.taskId, this.checker)
        .subscribe((checker) => {
          this.checkerService
            .updateFile(
              this.courseId,
              this.taskId,
              checker.id,
              CheckerFileType.MainFile,
              this.mainFile[0]
            )
            .subscribe(
              () => {},
              (error) => console.error(error)
            );
          if (this.secondaryFile[0]) {
            this.checkerService
              .updateFile(
                this.courseId,
                this.taskId,
                checker.id,
                CheckerFileType.SecondaryFile,
                this.secondaryFile[0]
              )
              .subscribe(
                () => {},
                (error) => console.error(error)
              );
          }
          this.dialogRef.close({ success: true });
        });
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
  }

  updateMainFile(event) {
    this.mainFile = event["content"];
    this.fileCounter++;
  }

  updateSecondaryFile(event) {
    this.secondaryFile = event["content"];
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
      this.mainFile &&
      (this.secondaryFile || this.checker.checkerType === "bash")
    ) {
      this.checkerService
        .updateChecker(
          this.courseId,
          this.taskId,
          this.checker.id,
          this.checker
        )
        .subscribe(() => {
          this.checkerService
            .updateFile(
              this.courseId,
              this.taskId,
              this.checker.id,
              CheckerFileType.MainFile,
              this.mainFile[0]
            )
            .subscribe(
              () => {},
              (error) => console.error(error)
            );
          if (this.secondaryFile[0]) {
            this.checkerService
              .updateFile(
                this.courseId,
                this.taskId,
                this.checker.id,
                CheckerFileType.SecondaryFile,
                this.secondaryFile[0]
              )
              .subscribe(
                () => {},
                (error) => console.error(error)
              );
          }
          this.dialogRef.close({ success: true });
        });
    } else {
      this.snackBar.open("Alle Felder müssen gefüllt werden.", "ok");
    }
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
