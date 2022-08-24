import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-spreadsheet-dialog",
  templateUrl: "./spreadsheet-dialog.component.html",
  styleUrls: ["./spreadsheet-dialog.component.scss"],
})
export class SpreadsheetDialogComponent {
  private lastSelection: string[] = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { spreadsheet: File },
    public dialogRef: MatDialogRef<SpreadsheetDialogComponent>
  ) {}

  confirm(ok: boolean) {
    if (!ok) {
      this.dialogRef.close(null);
      return;
    }
    this.dialogRef.close(this.lastSelection);
  }

  selection(selection: string[]) {
    this.lastSelection = selection;
  }
}
