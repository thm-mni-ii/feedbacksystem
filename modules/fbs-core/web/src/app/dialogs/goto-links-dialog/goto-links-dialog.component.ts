import { Component, Inject } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { GoToService } from "../../service/goto.service";

/**
 * Data privacy dialog
 */
@Component({
  selector: "app-goto-links-dialog",
  templateUrl: "./goto-links-dialog.component.html",
  styleUrls: ["./goto-links-dialog.component.scss"],
})
export class GotoLinksDialogComponent {
  courseLink: string;
  appLink: string;

  constructor(
    public dialogRef: MatDialogRef<GotoLinksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { courseID: number },
    private gotoService: GoToService,
    private snackBar: MatSnackBar
  ) {
    this.courseLink = gotoService.buildLink(data.courseID);
    this.appLink = gotoService.buildLink(data.courseID, true);
  }

  async copy(text: string) {
    await navigator.clipboard.writeText(text);
    this.snackBar.open("Link kopiert", "Schließen", { duration: 2000 });
  }

  close() {
    this.dialogRef.close();
  }
}
