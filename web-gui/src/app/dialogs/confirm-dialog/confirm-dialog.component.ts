import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {User} from "../../model/HttpInterfaces";

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {title: string, message: string}, public dialogRef: MatDialogRef<ConfirmDialogComponent>) { }

  confirm(ok: boolean) {
    this.dialogRef.close(ok);
  }
}
