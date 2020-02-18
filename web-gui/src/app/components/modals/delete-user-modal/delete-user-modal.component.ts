import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DeleteCourseModalComponent} from "../../courses/modals/delete-course-modal/delete-course-modal.component";

@Component({
  selector: 'app-delete-user-modal',
  templateUrl: './delete-user-modal.component.html',
  styleUrls: ['./delete-user-modal.component.scss']
})
export class DeleteUserModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DeleteCourseModalComponent>) { }

  ngOnInit() {
  }

  deleteUser(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
