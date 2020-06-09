import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../../service/database.service';
import {Observable} from 'rxjs';
import {DetailedCourseInformation, Testsystem} from '../../../../interfaces/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {templateJitUrl} from "@angular/compiler";

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
  coursenameMinLength: number = 5;
  courseNameMaxLength: number = 100;
  courseDescriptionMaxLength: number = 8000;
  coursename = new FormControl('', [Validators.required, Validators.minLength(this.coursenameMinLength), Validators.maxLength(this.courseNameMaxLength)])
  courseDescription = new FormControl('', [Validators.maxLength(this.courseDescriptionMaxLength)]);
  courseDefaultTaskTyp = new FormControl('', [Validators.required]);
  courseUserDataAllowed = new FormControl('', [Validators.required]);
  errorFieldIsEmpty = 'Das Feld darf nicht leer sein!';

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>, private snackbar: MatSnackBar) {
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
    if (this.checkRequiredFields(this.courseDetails.course_id, this.name, this.description, this.standardTaskType, this.userDataAllowed)){
      this.db.updateCourse(this.courseDetails.course_id, this.name, this.description, this.standardTaskType, this.semester,
        this.course_module_id, this.userDataAllowed).subscribe(success => {
        this.dialogRef.close(success);
        this.snackbar.open('Kurseigenschaften erfolgreich geändert!', 'OK', {duration: 3000});
      }, error => {
          this.snackbar.open(error.error.message, 'OK', {duration: 3000});
      });
    }else {
      this.snackbar.open('Fehler: Nicht alle erforderlichen Felder wurden ausgefüllt!', 'OK', {duration: 3000});
    }

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
  /**
   * Checks whether the properties meet the requirements
   * @param couseID
   * @param name Coursename
   * @param description Coursedescription
   * @param standardTaskType Course standartTaskType
   * @param userDateAllowed Course userDataAllowed
   */
  checkRequiredFields(couseID: number, name: string, description: string, standardTaskType:string, userDateAllowed: boolean):boolean{
    return true
    if (couseID !== null && couseID !== undefined)
      if (name !== undefined && name != null && name.trim() !== "" && name.length <= this.courseNameMaxLength && name.length >= this.coursenameMinLength)
        if (standardTaskType !== undefined && standardTaskType !== null && standardTaskType.trim() !== "")
          if (userDateAllowed !== undefined && userDateAllowed !== null)
            if (description.length <= this.courseDescriptionMaxLength)
              return true
    return false
  }
}
