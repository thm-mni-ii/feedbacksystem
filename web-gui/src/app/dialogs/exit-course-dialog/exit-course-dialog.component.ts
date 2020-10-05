import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog that asks if user wants to
 * exit course
 */
@Component({
  selector: 'app-exit-course-dialog',
  templateUrl: './exit-course-dialog.component.html',
  styleUrls: ['./exit-course-dialog.component.scss']
})
export class ExitCourseDialogComponent {


  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<ExitCourseDialogComponent>) {
  }

  /**
   * Close dialog and exit course
   * @param exit The decision user made
   */
  exitCourse(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
