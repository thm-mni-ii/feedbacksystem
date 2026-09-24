import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GoToService } from "../../service/goto.service";
import { IntegrationService } from "../../service/integration.service";

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
  showAppLink = false;

  constructor(
    public dialogRef: MatDialogRef<GotoLinksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { courseID: number },
    private gotoService: GoToService,
    private integrationService: IntegrationService,
    private snackBar: MatSnackBar
  ) {
    this.courseLink = gotoService.buildLink(data.courseID);
    this.appLink = gotoService.buildLink(data.courseID, true);
    this.integrationService.getIntegration("feedbackApp").subscribe(
      () => (this.showAppLink = true),
      () => (this.showAppLink = false)
    );
  }

  async copy(text: string) {
    await navigator.clipboard.writeText(text);
    this.snackBar.open("Link kopiert", "Schließen", { duration: 2000 });
  }

  close() {
    this.dialogRef.close();
  }
}
