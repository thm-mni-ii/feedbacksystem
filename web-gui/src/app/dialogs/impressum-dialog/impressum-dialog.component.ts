import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthService} from '../../service/auth.service';
import {Roles} from "../../model/Roles";
import {LegalService} from "../../service/legal.service";

/**
 * The impressum dialog
 */
@Component({
  selector: 'app-impressum-dialog',
  templateUrl: './impressum-dialog.component.html',
  styleUrls: ['./impressum-dialog.component.scss']
})
export class ImpressumDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ImpressumDialogComponent>, private legalService: LegalService,
              private snackBar: MatSnackBar, private auth: AuthService) {
  }

  markdown: String;
  isAdmin: boolean;

  ngOnInit() {
    this.dialogRef.updateSize('600px', '400px');
    if (this.auth.isAuthenticated()) {
      this.isAdmin = Roles.GlobalRole.isAdmin(this.auth.getToken().globalRole)
    }

    this.legalService.getImpressum().subscribe(data => {
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
