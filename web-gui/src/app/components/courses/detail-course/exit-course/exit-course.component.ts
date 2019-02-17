import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

/**
 * Dialog that asks if user wants to
 * exit course
 */
@Component({
  selector: 'app-exit-course',
  templateUrl: './exit-course.component.html',
  styleUrls: ['./exit-course.component.scss']
})
export class ExitCourseComponent {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ExitCourseComponent>) {
  }

  /**
   * Close dialog and exit course
   * @param exit The decision user made
   */
  exitCourse(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
