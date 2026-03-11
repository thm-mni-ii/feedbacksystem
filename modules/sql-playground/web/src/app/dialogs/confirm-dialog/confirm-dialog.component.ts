import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      confirmText?: string;
      closeText?: string;
    },
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  confirm(ok: boolean) {
    this.dialogRef.close(ok);
  }
}
