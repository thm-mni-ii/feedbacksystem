import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../service/auth.service';
import {DatabaseService} from '../../service/database.service';
import {TextType} from '../../interfaces/HttpInterfaces';
import {UserService} from '../../service/user.service';

/**
 * Data privacy dialog of submissionchecker
 */
@Component({
  selector: 'app-dataprivacy-dialog',
  templateUrl: './dataprivacy-dialog.component.html',
  styleUrls: ['./dataprivacy-dialog.component.scss']
})
export class DataprivacyDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DataprivacyDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
              private snackBar: MatSnackBar, private auth: AuthService, private db: DatabaseService,
              private user: UserService) {
  }

  privacyChecked: boolean;
  onlyForShow: boolean;
  markdown: string;
  isAdmin: boolean;

  ngOnInit() {
    this.onlyForShow = (this.data != null) ? this.data.onlyForShow : false
    //this.dialogRef.updateSize('600px', '400px');
    if (this.auth.isAuthenticated()) {
      if (this.user.getUserRole() === 1) {
        this.isAdmin = true;
      }
    }
    this.db.getPrivacyOrImpressumText(TextType.Dataprivacy).subscribe(data => {
      this.markdown = data.markdown;
    });
  }


  /**
   * Login from dialog after user agreed data privacy
   */
  login() {
    if (this.privacyChecked) {
      this.dialogRef.close({success: true});
    } else {
      this.snackBar.open('Datenschutzerklärung akzeptieren', 'OK');
    }
  }


  /**
   * Close dialog window
   */
  abort() {
    this.dialogRef.close({success: false});
  }
}
