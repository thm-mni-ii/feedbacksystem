import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Course } from "../../model/Course";
import { Semester } from "../../model/Semester";
import { CourseService } from "../../service/course.service";
import { SemesterService } from "../../service/semester.service";
import { TranslocoService } from "@ngneat/transloco";

/**
 * Updates course information in dialog
 */
@Component({
  selector: "app-course-update-dialog",
  templateUrl: "./course-update-dialog.component.html",
  styleUrls: ["./course-update-dialog.component.scss"],
})
export class CourseUpdateDialogComponent implements OnInit {
  name = new UntypedFormControl("", [Validators.required]);
  description = new UntypedFormControl("");
  isVisible = true;
  selectedSemester = new UntypedFormControl(0);
  semesterList: Semester[] = [];
  isUpdateDialog = false;

  constructor(
    private translocoService: TranslocoService,
    private courseService: CourseService,
    private semesterService: SemesterService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CourseUpdateDialogComponent>
  ) {}

  ngOnInit() {
    this.isUpdateDialog = this.data.isUpdateDialog;

    this.semesterService.getSemesterList().subscribe((result) => {
      this.semesterList = result;
    });

    if (this.isUpdateDialog) {
      const course: Course = this.data.course;
      this.name.setValue(course.name);
      this.description.setValue(course.description);
      this.isVisible = course.visible;
      this.selectedSemester.setValue(course.semesterId);

      if (course.semesterId == null) {
        this.selectedSemester.setValue(0);
      }
    }
  }

  /**
   * Get data from form groups and create new course
   */
  saveCourse() {
    let message = "";
    this.translocoService
      .selectTranslate("course-creation-error")
      .subscribe((value) => (message = value));
    if (!this.isInputValid) {
      return;
    }

    if (this.selectedSemester.value == 0) {
      this.selectedSemester.setValue(null);
    }

    const course: Course = {
      name: this.name.value,
      description: this.description.value,
      visible: this.isVisible,
      semesterId: this.selectedSemester.value,
    };

    if (this.isUpdateDialog) {
      this.courseService.updateCourse(this.data.course.id, course).subscribe(
        () => this.dialogRef.close({ success: true }),
        (error) => console.error(error)
      );
    } else {
      this.courseService.createCourse(course).subscribe(
        (createdCourse) => {
          this.dialogRef.close({ success: true, course: createdCourse });
        },
        (error) => {
          console.error(error);
          this.snackBar.open(message, null, { duration: 3000 });
        }
      );
    }
  }

  isInputValid(): boolean {
    return this.name.valid && this.description.valid;
  }

  /**
   * Close dialog without update
   */
  closeDialog() {
    this.dialogRef.close({ success: false });
  }
}
