import { Component, Inject, OnInit } from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  FormControl,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { SpreadsheetResponseMediaInformation, Task } from "src/app/model/Task";
import { CourseService } from "../../service/course.service";
import { TaskService } from "../../service/task.service";
import { SpreadsheetDialogComponent } from "../spreadsheet-dialog/spreadsheet-dialog.component";
import { of } from "rxjs";
import { mergeMap, map } from "rxjs/operators";
import { CheckerService } from "../../service/checker.service";
import { CheckerConfig } from "../../model/CheckerConfig";
import { CheckerFileType } from "src/app/enums/checkerFileType";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { TaskUpdateConditions } from "src/app/enums/taskUpdateConditions";
import { SelectedFormFields } from "src/app/model/SelectedFormFields";

const defaultMediaType = "text/plain";
const defaultrequirement = "mandatory";
const defualtVisiblity = "Studenten";

/**
 * Dialog to create or update a task
 */
@Component({
  selector: "app-task-new-dialog",
  templateUrl: "./task-new-dialog.component.html",
  styleUrls: ["./task-new-dialog.component.scss"],
})
export class TaskNewDialogComponent implements OnInit {
  taskForm = new UntypedFormGroup({
    name: new UntypedFormControl("", [Validators.required]),
    isPrivate: new UntypedFormControl(defualtVisiblity),
    description: new UntypedFormControl(""),
    deadline: new UntypedFormControl(this.getDefaultDeadline()),
    mediaType: new UntypedFormControl(defaultMediaType),
    requirementType: new UntypedFormControl(defaultrequirement),
    excelFile: new UntypedFormControl(""),
    userIDField: new UntypedFormControl(""),
    inputFields: new UntypedFormControl(""),
    outputFields: new UntypedFormControl(""),
    pointFields: new UntypedFormControl(""),
    decimals: new UntypedFormControl(2),
    expCheck: new FormControl<Boolean>(false),
    // datePickerSelected: new FormControl<Boolean>(false),
  });
  updateCondition: TaskUpdateConditions = TaskUpdateConditions.CREATE;
  allUpdateConditions = TaskUpdateConditions;

  selectedFormFields: SelectedFormFields = {
    datePicker: true,
    mediaType: true,
    requirementType: true,
    isPrivate: true,
  };

  courseId: number;
  datePickerDisabled: boolean = false;
  task: Task = {
    deadline: this.getDefaultDeadline(),
    isPrivate: true,
    description: "",
    mediaType: "",
    name: "",
    mediaInformation: null,
    requirementType: "",
  };

  spreadsheet: File = null;
  disableTypeChange = false;

  changedMediaType() {
    if (
      this.taskForm.controls["mediaType"].value == "application/x-spreadsheet"
    ) {
      this.taskForm.controls["excelFile"].setValidators([Validators.required]);
      this.taskForm.controls["userIDField"].setValidators([
        Validators.required,
      ]);
      this.taskForm.controls["inputFields"].setValidators([
        Validators.required,
      ]);
      this.taskForm.controls["outputFields"].setValidators([
        Validators.required,
      ]);
      this.taskForm.controls["expCheck"].setValidators([Validators.required]);
    } else {
      this.taskForm.controls["excelFile"].clearValidators();
      this.taskForm.controls["userIDField"].clearValidators();
      this.taskForm.controls["inputFields"].clearValidators();
      this.taskForm.controls["outputFields"].clearValidators();
      this.taskForm.controls["expCheck"].clearValidators();
    }
    this.taskForm.controls["excelFile"].updateValueAndValidity();
    this.taskForm.controls["userIDField"].updateValueAndValidity();
    this.taskForm.controls["inputFields"].updateValueAndValidity();
    this.taskForm.controls["outputFields"].updateValueAndValidity();
    this.taskForm.controls["expCheck"].updateValueAndValidity();
  }

  constructor(
    public dialogRef: MatDialogRef<TaskNewDialogComponent>,
    private courseService: CourseService,
    private taskService: TaskService,
    private checkerService: CheckerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.courseId = this.data.courseId;
    //this.datePickerDisabled = true;

    if (this.data.courseId && !this.data.task && !this.data.tasks) {
      // new task
      console.log("create new task");
    } else if (this.data.task) {
      // edit one task
      this.updateCondition = TaskUpdateConditions.UPDATE;
      this.task = this.data.task;

      this.setValues();
    } else if (this.data.tasks) {
      // edit multiple tasks
      this.selectedFormFields.datePicker = false;
      this.selectedFormFields.mediaType = false;
      this.selectedFormFields.requirementType = false;
      this.selectedFormFields.isPrivate = false;

      this.updateCondition = TaskUpdateConditions.UPDATE_MULTIPLE;
    }
  }

  /**
   * Close dialog without updating
   * or creating task
   */
  closeDialog() {
    this.dialogRef.close({ success: false });
  }

  getValues() {
    this.task.name = this.taskForm.get("name").value;
    this.task.description = this.taskForm.get("description").value;
    if (this.taskForm.get("isPrivate").value === "Studenten") {
      this.task.isPrivate = false;
    } else {
      this.task.isPrivate = true;
    }
    this.task.requirementType = this.taskForm.get("requirementType").value;
    this.task.mediaType = this.taskForm.get("mediaType").value;
    if (this.taskForm.get("expCheck").value) {
      this.task.deadline = null;
    }
    if (this.task.mediaType === "application/x-spreadsheet") {
      this.task.mediaInformation = {
        idField: this.taskForm.get("userIDField").value,
        inputFields: this.taskForm.get("inputFields").value,
        outputFields: this.taskForm.get("outputFields").value,
        decimals: this.taskForm.get("decimals").value,
      };
      if (this.taskForm.get("pointFields").value) {
        this.task.mediaInformation.pointFields =
          this.taskForm.get("pointFields").value;
      }
    }
  }

  setValues() {
    this.taskForm.controls["name"].setValue(this.task.name);
    this.taskForm.controls["description"].setValue(this.task.description);
    this.taskForm.controls["mediaType"].setValue(this.task.mediaType);
    this.taskForm.controls["requirementType"].setValue(
      this.task.requirementType
    );
    if (this.task.isPrivate) {
      this.taskForm.controls["isPrivate"].setValue("Tutoren");
    } else {
      this.taskForm.controls["isPrivate"].setValue("Studenten");
    }
    //this.taskForm.controls["deadline"].setValue(new Date(this.task.deadline));
    if (!this.task.deadline) {
      this.taskForm.controls["deadline"].setValue(this.getDefaultDeadline());
      this.task.deadline = this.getDefaultDeadline();
      this.taskForm.controls["expCheck"].setValue(true);
      this.datePickerDisabled = true;
    } else {
      this.taskForm.controls["deadline"].setValue(new Date(this.task.deadline));
    }

    if (this.task.mediaType === "application/x-spreadsheet") {
      this.taskForm.controls["excelFile"].setValue("loading...");
      this.checkerService
        .getChecker(this.courseId, this.task.id)
        .pipe(map((checkers) => checkers[0]))
        .subscribe((checker) => {
          this.checkerService
            .fetchFile(
              this.courseId,
              this.task.id,
              checker.id,
              CheckerFileType.MainFile
            )
            .subscribe(
              (spreadsheet) =>
                (this.spreadsheet = new File([spreadsheet], "spreadsheet.xlsx"))
            );
          this.taskForm.controls["excelFile"].setValue("not changed");
        });
      let mediaInformation = this.data.task.mediaInformation;
      if (typeof mediaInformation.mediaInformation === "object") {
        mediaInformation = (
          mediaInformation as SpreadsheetResponseMediaInformation
        ).mediaInformation;
      }
      this.taskForm.controls["userIDField"].setValue(mediaInformation.idField);
      this.taskForm.controls["inputFields"].setValue(
        mediaInformation.inputFields
      );
      this.taskForm.controls["outputFields"].setValue(
        mediaInformation.outputFields
      );
      this.taskForm.controls["pointFields"].setValue(
        mediaInformation.pointFields
      );
      this.taskForm.controls["decimals"].setValue(mediaInformation.decimals);
      this.disableTypeChange = true;
    }
  }

  /**
   * Create a new task
   * and close dialog
   */
  createTask() {
    this.getValues();
    if (this.task.name) {
      this.taskService
        .createTask(this.courseId, this.task)
        .pipe(
          mergeMap((task) => {
            if (this.task.mediaType === "application/x-spreadsheet") {
              const checkerConfig: CheckerConfig = {
                checkerType: "spreadsheet",
                ord: 0,
                checkerTypeInformation: {
                  showExtendedHints: false,
                  showExtendedHintsAt: 0,
                  showHints: false,
                  showHintsAt: 0,
                },
              };
              const infoFile = new File(
                [JSON.stringify(this.task.mediaInformation)],
                "info.json"
              );
              return this.checkerService
                .createChecker(this.courseId, task.id, checkerConfig)
                .pipe(
                  mergeMap((checker) =>
                    this.checkerService
                      .updateFile(
                        this.courseId,
                        task.id,
                        checker.id,
                        CheckerFileType.MainFile,
                        this.spreadsheet
                      )
                      .pipe(map(() => checker))
                  ),
                  mergeMap((checker) =>
                    this.checkerService.updateFile(
                      this.courseId,
                      task.id,
                      checker.id,
                      CheckerFileType.SecondaryFile,
                      infoFile
                    )
                  ),
                  map(() => task)
                );
            } else {
              return of(task);
            }
          })
        )
        .subscribe((task) => {
          this.dialogRef.close({ success: true, task: task });
        });
    } else {
      this.snackBar.open("Bitte ein valides Datum wählen.", "ok");
    }
  }

  /**
   * Update given task
   * and close dialog
   */
  updateTask() {
    this.getValues();
    if (this.task.name) {
      this.snackBar.open("Task bearbeitet.", "ok");
      this.taskService
        .updateTask(this.courseId, this.task.id, this.task)
        .subscribe((task) => {
          this.dialogRef.close({ success: true, task: task });
        });
    } else {
      this.snackBar.open("Das Datum sollte in der Zukunft liegen.", "ok");
    }
  }

  addDate(event: MatDatepickerInputEvent<Date>) {
    this.task.deadline = event.value.toISOString();
  }

  uploadExcel(event: Event) {
    const file = (event.currentTarget as any).files[0];
    this.spreadsheet = file;
    this.taskForm.patchValue({ excelFile: file.name });
  }

  getFromSpreadsheet(field: string) {
    if (this.spreadsheet === null) {
      return;
    }
    this.dialog
      .open(SpreadsheetDialogComponent, {
        height: "auto",
        width: "50%",
        data: {
          spreadsheet: this.spreadsheet,
        },
      })
      .afterClosed()
      .subscribe((fields) => {
        if (fields === null) {
          return;
        }
        const values = {};
        if (fields[0] === fields[1]) {
          values[field] = fields[0];
        } else {
          values[field] = fields.join(":");
        }
        this.taskForm.patchValue(values);
      });
  }

  // the deadline does not accept the nullable Value (*as it should according to Api)
  getDefaultDeadline() {
    const currentDateAndOneMonthLater = new Date();
    currentDateAndOneMonthLater.setMonth(
      currentDateAndOneMonthLater.getMonth() + 1
    );
    return currentDateAndOneMonthLater.toISOString();
  }

  setMaxExpirationDate(event: MatSlideToggle) {
    this.datePickerDisabled = event.checked;
  }

  updateMultipleTaskDetails(tasks: Task[]) {
    this.getValues();
    this.taskService
      .updateMultipleTasks(
        this.courseId,
        tasks,
        this.task,
        this.selectedFormFields
      )
      .subscribe((success) => {
        if (success) {
          this.dialogRef.close({ success: true });
        } else {
          this.dialogRef.close({ success: false });
          this.snackBar.open("Error while updating tasks", "ok");
        }
      });
  }
}
