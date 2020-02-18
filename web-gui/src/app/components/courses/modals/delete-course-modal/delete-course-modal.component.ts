import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-delete-course-modal',
  templateUrl: './delete-course-modal.component.html',
  styleUrls: ['./delete-course-modal.component.scss']
})
export class DeleteCourseModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DeleteCourseModalComponent>) { }

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
