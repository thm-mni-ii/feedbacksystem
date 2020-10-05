import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Observable} from 'rxjs';
import {DatabaseService} from '../../service/database.service';
import {DetailedCourseInformation, Testsystem} from '../../model/HttpInterfaces';


/**
 * Updates course information in dialog
 */
@Component({
  selector: 'app-course-update-dialog',
  templateUrl: './course-update-dialog.component.html',
  styleUrls: ['./course-update-dialog.component.scss']
})
export class CourseUpdateDialogComponent implements OnInit {
  name: string;
  description: string;
  standardTaskType: string;
  semester: string;
  course_module_id: string;
  userDataAllowed: boolean;
  courseDetails: DetailedCourseInformation;
  coursenameMinLength: number = 5;
  courseNameMaxLength: number = 100;
  courseDescriptionMaxLength: number = 8000;
  coursename = new FormControl('', [Validators.required, Validators.minLength(this.coursenameMinLength),
    Validators.maxLength(this.courseNameMaxLength)]);
  courseDefaultTaskTyp = new FormControl('', [Validators.required]);
  courseDescription = new FormControl('', Validators.maxLength(this.courseDescriptionMaxLength));

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CourseUpdateDialogComponent>, private snackbar: MatSnackBar) {
    this.name = '';
    this.description = '';
    this.standardTaskType = '';
    this.semester = '';
    this.course_module_id = '';
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
      this.course_module_id, this.userDataAllowed).subscribe(success => {
      this.dialogRef.close(success);
      this.snackbar.open('Kurseigenschaften erfolgreich geändert!', 'OK', {duration: 3000});
    }, error => {
      this.snackbar.open(error.error.message, 'OK', {duration: 3000});
    });

  }

  loadDocentTutorForCourse() {
    this.db.getCourseDetail(this.courseDetails.course_id).subscribe((value: DetailedCourseInformation) => {
      this.courseDetails.course_docent = value.course_docent;
      this.courseDetails.course_tutor = value.course_tutor;
    });
  }

  isInputValid(): boolean {
    return this.coursename.valid && this.courseDescription.valid;

  }
}
