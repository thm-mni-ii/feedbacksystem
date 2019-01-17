import {Component, Inject, OnInit} from '@angular/core';
import {DatabaseService} from '../../../../service/database.service';
import {Observable} from 'rxjs';
import {DetailedCourseInformation, Testsystem} from '../../../../interfaces/HttpInterfaces';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-update-course-dialog',
  templateUrl: './update-course-dialog.component.html',
  styleUrls: ['./update-course-dialog.component.scss']
})
export class UpdateCourseDialogComponent implements OnInit {

  constructor(private db: DatabaseService, @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<UpdateCourseDialogComponent>) {
  }

  testsystems$: Observable<Testsystem[]>;

  name: string;
  description: string;
  standardTaskType: string;
  semester: string;
  course_module_id: string;
  userDataAllowed: boolean;
  courseDetails: DetailedCourseInformation;


  ngOnInit() {
    this.courseDetails = this.data.data;
    this.testsystems$ = this.db.getTestsystemTypes();
    this.name = this.courseDetails.course_name;
    this.description = this.courseDetails.course_description;
  }


  closeDialog() {
    this.dialogRef.close({success: false});
  }

  udpateCourse() {
    this.db.updateCourse(this.data.course_id, this.name, this.description, this.standardTaskType, this.semester,
      this.course_module_id, this.userDataAllowed).subscribe(success => this.dialogRef.close(success));
  }

}
