import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {AuthService} from '../../service/auth.service';
import {DatabaseService} from '../../service/database.service';
import {TextType} from '../../interfaces/HttpInterfaces';
import {UserService} from '../../service/user.service';

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
    this.dialogRef.updateSize('600px', '400px');
    if (this.user.getUserRole() === 1) {
      this.isAdmin = true;
    }
    this.db.getPrivacyOrImpressumText(TextType.Dataprivacy).subscribe(data => {
      this.markdown = data;
    });
    this.onlyForShow = this.data.onlyForShow;
  }


  /**
   * Login from dialog after user agreed dataprivacy
   */
  login() {
    if (this.privacyChecked) {
      this.auth.login(this.data.username, this.data.password).subscribe(success => {
        this.dialogRef.close(success);
      });
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

  /**
   * Save markdown text in database
   */
  saveDataPrivacy() {
    this.db.updatePrivacyOrImpressum(TextType.Dataprivacy, this.markdown).subscribe(success => {
      if (success.success) {
        this.snackBar.open('Datenschutz aktualiesiert', 'OK');
      } else {
        this.snackBar.open('Es ist ein Fehler aufgetrete', 'OK');
      }
    });
  }

}
