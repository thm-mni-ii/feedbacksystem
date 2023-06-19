import { Component, Inject, OnInit } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { AuthService } from "../../service/auth.service";
import { Roles } from "../../model/Roles";
import { LegalService } from "../../service/legal.service";

/**
 * Data privacy dialog
 */
@Component({
  selector: "app-dataprivacy-dialog",
  templateUrl: "./dataprivacy-dialog.component.html",
  styleUrls: ["./dataprivacy-dialog.component.scss"],
})
export class DataprivacyDialogComponent implements OnInit {
  privacyChecked: boolean;
  onlyForShow: boolean;
  markdown: String;
  isAdmin: boolean;

  constructor(
    public dialogRef: MatDialogRef<DataprivacyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private legalService: LegalService
  ) {}

  ngOnInit() {
    this.onlyForShow = this.data != null ? this.data.onlyForShow : false;
    // this.dialogRef.updateSize('600px', '400px');
    if (this.auth.isAuthenticated()) {
      this.isAdmin = Roles.GlobalRole.isAdmin(this.auth.getToken().globalRole);
    }
    this.legalService.getPrivacyText().subscribe((data) => {
      this.markdown = data.markdown;
    });
  }

  /**
   * Login from dialog after user agreed data privacy
   */
  login() {
    if (this.privacyChecked) {
      this.dialogRef.close({ success: true }); // TODO: Why not return true
    } else {
      this.snackBar.open("Datenschutzerklärung akzeptieren", "OK");
    }
  }

  /**
   * Close dialog window
   */
  abort() {
    this.dialogRef.close({ success: false }); // TODO: Why not return false
  }
}
