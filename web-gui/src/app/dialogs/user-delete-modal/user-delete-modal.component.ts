import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DeleteCourseModalComponent} from "../../components/courses/modals/delete-course-modal/delete-course-modal.component";

@Component({
  selector: 'app-user-delete-modal',
  templateUrl: './user-delete-modal.component.html',
  styleUrls: ['./user-delete-modal.component.scss']
})
export class UserDeleteModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<DeleteCourseModalComponent>) { }

  ngOnInit() {
  }

  deleteUser(exit: boolean) {
    this.dialogRef.close({exit: exit});
  }

}
