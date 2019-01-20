import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {AuthService} from '../../service/auth.service';

@Component({
  selector: 'app-dataprivacy-dialog',
  templateUrl: './dataprivacy-dialog.component.html',
  styleUrls: ['./dataprivacy-dialog.component.scss']
})
export class DataprivacyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataprivacyDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar, private auth: AuthService) {
  }

  privacyChecked: boolean;
  onlyForShow: boolean;

  ngOnInit() {
    this.onlyForShow = this.data.onlyForShow;
  }


  login() {
    if (this.privacyChecked) {
      this.auth.login(this.data.username, this.data.password).subscribe(success => {
        this.dialogRef.close(success);
      });
    } else {
      this.snackBar.open('Datenschutzerklärung akzeptieren', 'OK');
    }
  }


  abort() {
    this.dialogRef.close({success: false});
  }

}
