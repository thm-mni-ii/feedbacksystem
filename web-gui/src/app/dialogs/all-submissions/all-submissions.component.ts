import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Submission} from '../../model/Submission';

@Component({
  selector: 'app-all-submissions',
  templateUrl: './all-submissions.component.html',
  styleUrls: ['./all-submissions.component.scss']
})
export class AllSubmissionsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {submission: Submission[]}, public dialogRef: MatDialogRef<AllSubmissionsComponent>) { }

  close() {
    this.dialogRef.close();
  }
}
