import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-exit-course',
  templateUrl: './exit-course.component.html',
  styleUrls: ['./exit-course.component.scss']
})
export class ExitCourseComponent {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ExitCourseComponent>) {
  }

  exitCourse(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
