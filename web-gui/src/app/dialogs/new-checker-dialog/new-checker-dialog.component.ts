import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CheckerConfig } from "../../model/CheckerConfig";
import { CheckerService } from "../../service/checker.service";
import { Observable, of } from "rxjs";

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
  });
  choosedSQLChecker;
  mainFile: File;
  secondaryFile: File;
  isUpdate: boolean;
  courseId: number;
  taskId: number;
  checker: CheckerConfig = {
    checkerTypeInformation: {
      showExtendedHints: false,
      showExtendedHintsAt: 0,
      showHints: false,
      showHintsAt: 0,
    },
    checkerType: "",
    ord: 0,
  };
  checkerCount: Observable<CheckerConfig[]> = of();
  showHintsConfig;
  showExtendedHintsConfig;

  constructor(
    public dialogRef: MatDialogRef<NewCheckerDialogComponent>,
    private checkerService: CheckerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.data.checker) {
      this.isUpdate = true;
      this.checker = this.data.checker;
      this.checkerForm.controls["checkerType"].setValue(
        this.checker.checkerType
      );
      this.checkerForm.controls["ord"].setValue(this.checker.ord);
    }
    this.courseId = this.data.courseId;
    this.taskId = this.data.taskId;
    this.setDefaultValues();
    this.choosedSQLChecker = false;
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
    this.checker.checkerType = value.checkerType;
    this.checker.ord = value.ord;
    this.checker.checkerType = value.checkerType;
    this.checker.checkerTypeInformation.showHints = value.showHints;
    this.checker.checkerTypeInformation.showHintsAt = value.showHintsAt;
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
            .updateMainFile(
              this.courseId,
              this.taskId,
              checker.id,
              this.mainFile
            )
            .subscribe(
              (ok) => {},
              (error) => console.error(error)
            );
          if (this.secondaryFile) {
            this.checkerService
              .updateSecondaryFile(
                this.courseId,
                this.taskId,
                checker.id,
                this.secondaryFile
              )
              .subscribe(
                (ok) => {},
                (error) => console.error(error)
              );
          }
        });
      this.dialogRef.close({ success: true });
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
    if (this.checker.checkerType && this.checker.ord) {
      this.checkerService
        .updateChecker(
          this.courseId,
          this.taskId,
          this.checker.id,
          this.checker
        )
        .subscribe(async (res) => {
          // TODO: res is array of checker
          if (this.mainFile) {
            // const temp = await toBase64(this.mainFile)
            // console.log(fileReader.result)
            this.checkerService
              .updateMainFile(
                this.courseId,
                this.taskId,
                this.checker.id,
                this.mainFile
              )
              .subscribe(
                (ok) => {},
                (error) => console.error(error)
              );
          }
          if (this.secondaryFile) {
            this.checkerService
              .updateSecondaryFile(
                this.courseId,
                this.taskId,
                this.checker.id,
                this.secondaryFile
              )
              .subscribe(
                (ok) => {},
                (error) => console.error(error)
              );
          }
        });
      this.dialogRef.close({ success: true });
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
    });
  }
  defineForm(value: any) {
    if (value.checkerType === "sql-checker") {
      this.choosedSQLChecker = true;
    } else {
      this.choosedSQLChecker = false;
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
