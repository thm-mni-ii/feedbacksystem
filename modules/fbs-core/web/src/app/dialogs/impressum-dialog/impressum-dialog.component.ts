import { Component, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { AuthService } from "../../service/auth.service";
import { Roles } from "../../model/Roles";
import { LegalService } from "../../service/legal.service";

/**
 * The impressum dialog
 */
@Component({
  selector: "app-impressum-dialog",
  templateUrl: "./impressum-dialog.component.html",
  styleUrls: ["./impressum-dialog.component.scss"],
})
export class ImpressumDialogComponent implements OnInit {
  markdown: String;
  isAdmin: boolean;

  constructor(
    private dialogRef: MatDialogRef<ImpressumDialogComponent>,
    private legalService: LegalService,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.dialogRef.updateSize("600px", "400px");
    if (this.auth.isAuthenticated()) {
      this.isAdmin = Roles.GlobalRole.isAdmin(this.auth.getToken().globalRole);
    }

    this.legalService.getImpressum().subscribe((data) => {
      this.markdown = data.markdown;
    });
  }

  /**
   * Close dialog window
   */
  close() {
    this.dialogRef.close();
  }
}
