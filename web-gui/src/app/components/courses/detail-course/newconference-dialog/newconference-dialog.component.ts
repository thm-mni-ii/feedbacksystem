import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from "@angular/material/snack-bar";

/**
 * Dialog to create a new conference or update one
 */
@Component({
  selector: 'app-newconference-dialog',
  templateUrl: './newconference-dialog.component.html',
  styleUrls: ['./newconference-dialog.component.scss']
})
export class NewconferenceDialogComponent {
  conferenceCount: number = 0;

  constructor(public dialogRef: MatDialogRef<NewconferenceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) {
  }

  cancelBtn() {
    this.dialogRef.close(0);
  }

  okBtn() {
    this.dialogRef.close(this.conferenceCount);
  }
}
