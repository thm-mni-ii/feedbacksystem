import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-course-delete-modal',
  templateUrl: './course-delete-modal.component.html',
  styleUrls: ['./course-delete-modal.component.scss']
})
export class CourseDeleteModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CourseDeleteModalComponent>) { }

  ngOnInit() {
  }

  /**
   * Close dialog and send answer to parent component
   * @param exit user's decision
   */
  deleteCourse(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
