import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {User} from "../../model/HttpInterfaces";

@Component({
  selector: 'app-task-delete-modal',
  templateUrl: './task-delete-modal.component.html',
  styleUrls: ['./task-delete-modal.component.scss']
})
export class TaskDeleteModalComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: User, public dialogRef: MatDialogRef<TaskDeleteModalComponent>) { }

  /**
   * Close dialog and send answer to parent component
   * @param exit user's decision
   */
  deleteTask(exit: boolean) {
    this.dialogRef.close(exit);
  }
}
