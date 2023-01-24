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
import { NgxMatDateAdapter, NgxMatDateFormats, NGX_MAT_DATE_FORMATS } from "@angular-material-components/datetime-picker";
import { MAT_DATE_LOCALE } from "@angular/material/core";

const defaultMediaType = "text/plain";
const defaultrequirement = "mandatory";

const CUSTOM_DATE_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'l, LTS'
  },
  display: {
    dateInput: 'YYYY-MM-DD HH:mm:ss',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

/**
 * Dialog to create or update a task
 */
@Component({
  selector: "app-task-new-dialog",
  templateUrl: "./task-new-dialog.component.html",
  styleUrls: ["./task-new-dialog.component.scss"],
  providers: [
    {
      provide: NgxMatDateAdapter,
      useClass: CustomNgxDatetimeAdapter,
      deps: [MAT_DATE_LOCALE, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ],
})
export class TaskNewDialogComponent implements OnInit {
  taskForm = new UntypedFormGroup({
    name: new UntypedFormControl("", [Validators.required]),
    description: new UntypedFormControl(""),
    deadline: new UntypedFormControl(this.getDefaultDeadline()),
    mediaType: new UntypedFormControl(defaultMediaType),
    requirementType: new UntypedFormControl(defaultrequirement),
    exelFile: new UntypedFormControl(""),
    userIDField: new UntypedFormControl(""),
    inputFields: new UntypedFormControl(""),
    outputFields: new UntypedFormControl(""),
    pointFields: new UntypedFormControl(""),
    decimals: new UntypedFormControl(2),
    expCheck: new FormControl<Boolean>(false),
  });
  isUpdate: boolean;
  courseId: number;
  datePickerDisabled: boolean = false;
  task: Task = {
    deadline: this.getDefaultDeadline(),
    description: "",
    mediaType: "",
    name: "",
    mediaInformation: null,
    requirementType: "",
  };

  spreadsheet: File = null;
  disableTypeChange = false;

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
    if (this.data.task) {
      this.isUpdate = true;
      this.task = this.data.task;
      this.setValues();
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
    this.task.deadline = this.taskForm.get("deadline").value;
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
      this.taskForm.controls["exelFile"].setValue("loading...");
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
          this.taskForm.controls["exelFile"].setValue("not changed");
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

  uploadExel(event: Event) {
    const file = (event.currentTarget as any).files[0];
    this.spreadsheet = file;
    this.taskForm.patchValue({ exelFile: file.name });
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
}
