import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-dataprivacy-dialog',
  templateUrl: './dataprivacy-dialog.component.html',
  styleUrls: ['./dataprivacy-dialog.component.scss']
})
export class DataprivacyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataprivacyDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar) {
  }

  privacyChecked: boolean;

  ngOnInit() {
  }


  login() {
    if (this.privacyChecked) {
      this.dialogRef.close({success: true});
    } else {
      this.snackBar.open('Datenschutzerklärung akzeptieren', 'OK');
    }
  }


  abort() {
    this.dialogRef.close({success: false});
  }

}
