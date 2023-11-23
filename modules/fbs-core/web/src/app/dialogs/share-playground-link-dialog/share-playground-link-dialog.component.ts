import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-db-uri-link-dialog",
  templateUrl: "./share-playground-link-dialog.component.html",
  styleUrls: ["./share-playground-link-dialog.component.scss"],
})
export class SharePlaygroundLinkDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
      uri: string;
    },
    public dialogRef: MatDialogRef<SharePlaygroundLinkDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  copyURI() {
    navigator.clipboard.writeText(this.data.uri).then(
      () => {
        this.snackbar.open("URI erfolgreich kopiert!", "Ok", {
          duration: 3000,
        });
      },
      (error) => {
        console.error("URI konnte nicht kopiert werden: ", error);
        this.snackbar.dismiss();
      }
    );
  }

  closeDialog() {
    this.dialogRef.close({ success: false });
  }
}
