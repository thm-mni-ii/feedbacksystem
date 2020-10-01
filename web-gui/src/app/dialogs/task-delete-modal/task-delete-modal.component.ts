import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DeleteCourseModalComponent} from "../../components/courses/modals/delete-course-modal/delete-course-modal.component";
import {User} from "../../model/HttpInterfaces";

@Component({
  selector: 'app-task-delete-modal',
  templateUrl: './task-delete-modal.component.html',
  styleUrls: ['./task-delete-modal.component.scss']
})
export class TaskDeleteModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: User, public dialogRef: MatDialogRef<DeleteCourseModalComponent>) { }

  ngOnInit() {
  }

  /**
   * Close dialog and send answer to parent component
   * @param exit user's decision
   */
  deleteTask(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
