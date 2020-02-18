import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DatabaseService} from '../../service/database.service';
import {TextType} from '../../interfaces/HttpInterfaces';
import {UserService} from '../../service/user.service';
import {AuthService} from '../../service/auth.service';

/**
 * The impressum dialog
 */
@Component({
  selector: 'app-impressum-dialog',
  templateUrl: './impressum-dialog.component.html',
  styleUrls: ['./impressum-dialog.component.scss']
})
export class ImpressumDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ImpressumDialogComponent>, private db: DatabaseService,
              private snackBar: MatSnackBar, private user: UserService, private auth: AuthService) {
  }

  markdown: string;
  isAdmin: boolean;

  ngOnInit() {
    this.dialogRef.updateSize('600px', '400px');
    if (this.auth.isAuthenticated()) {
      if (this.user.getUserRole() === 1) {
        this.isAdmin = true;
      }
    }

    this.db.getPrivacyOrImpressumText(TextType.Impressum).subscribe(data => {
      this.markdown = data.markdown;
    });
  }


  /**
   * Close dialog window
   */
  close() {
    this.dialogRef.close();
  }


  /**
   * Admin saves new impressum text
   */
  /*saveImpressum() {
    this.db.updatePrivacyOrImpressum(TextType.Impressum, this.markdown).subscribe(success => {
      if (success.success) {
        this.snackBar.open('Impressum aktualisiert', 'OK');
      } else {
        this.snackBar.open('Es ist ein Fehler aufgetreten', 'OK');
      }
    });
  }*/

}
