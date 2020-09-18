import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DeleteCourseModalComponent} from "../delete-course-modal/delete-course-modal.component";
import {User} from "../../../../interfaces/HttpInterfaces";

@Component({
  selector: 'app-delete-task-modal',
  templateUrl: './delete-task-modal.component.html',
  styleUrls: ['./delete-task-modal.component.scss']
})
export class DeleteTaskModalComponent implements OnInit {

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
