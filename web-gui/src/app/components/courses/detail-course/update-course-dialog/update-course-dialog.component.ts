import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../../service/database.service';
import {Observable} from 'rxjs';
import {DetailedCourseInformation, Testsystem} from '../../../../interfaces/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from "@angular/forms";

/**
 * Updates course information in dialog
 */
@Component({
  selector: 'app-update-course-dialog',
  templateUrl: './update-course-dialog.component.html',
  styleUrls: ['./update-course-dialog.component.scss']
})
export class UpdateCourseDialogComponent implements OnInit {
  name: string;
  description: string;
  standardTaskType: string;
  semester: string;
  course_module_id: string;
  userDataAllowed: boolean;
  courseDetails: DetailedCourseInformation;
  coursename = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)])
  courseDescription = new FormControl('', [Validators.maxLength(8000)]);
  courseDefaultTaskTyp = new FormControl('', [Validators.required]);
  courseUserDataAllowed = new FormControl('', [Validators.required]);
  errorFieldIsEmpty = 'Das Feld darf nicht leer sein!';

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>) {
    this.name = "";
    this.description = "";
    this.standardTaskType = "";
    this.semester = "";
    this.course_module_id = "";
  }

  testsystems$: Observable<Testsystem[]>;

  ngOnInit() {
    this.courseDetails = this.data.data;
    this.userDataAllowed = false;
    this.testsystems$ = this.db.getTestsystemTypes();
    console.log(this.courseDetails);

    this.name = this.courseDetails.course_name;
    this.description = this.courseDetails.course_description;
    this.standardTaskType = this.courseDetails.standard_task_typ;
    this.semester = this.courseDetails.course_semester;
    this.course_module_id = this.courseDetails.course_module_id;
    this.userDataAllowed = this.courseDetails.personalised_submission;
  }

  /**
   * Close dialog without update
   */
  closeDialog() {
    this.dialogRef.close({success: false});
  }

  /**
   * Update course information and close dialog
   */
  updateCourse() {
    this.db.updateCourse(this.courseDetails.course_id, this.name, this.description, this.standardTaskType, this.semester,
      this.course_module_id, this.userDataAllowed).subscribe(success => this.dialogRef.close(success));
  }

  loadDocentTutorForCourse() {
    this.db.getCourseDetail(this.courseDetails.course_id).subscribe((value: DetailedCourseInformation) => {
      this.courseDetails.course_docent = value.course_docent
      this.courseDetails.course_tutor = value.course_tutor
    })
  }
  //Error messages if validation failed
  getErrorMessageCourseName() {
    if (this.coursename.hasError('required')) {
      return this.errorFieldIsEmpty;
    } else if (this.coursename.hasError('minlength')) {
      return 'Der Kursname ist zu kurz!';
    } else if (this.coursename.hasError('maxlength')) {
      return 'Der Kursname ist zu lang!';
    }
  }

  getErrorMessageCourseDescription() {
    if (this.courseDescription.hasError('maxlenght'))
      return this.errorFieldIsEmpty;
  }

  getErrorMessageCourseDefaultTaskTyp() {
    if (this.courseDefaultTaskTyp.hasError('required')) {
      return this.errorFieldIsEmpty;
    }
  }

  getErrorMessageCourseUserDataAllowed() {
    if (this.courseUserDataAllowed.hasError('required')) {
      return this.errorFieldIsEmpty;
    }
  }
}
