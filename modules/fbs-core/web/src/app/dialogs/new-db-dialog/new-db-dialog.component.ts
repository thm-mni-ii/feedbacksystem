import { Component, Inject } from "@angular/core";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatLegacySnackBar as MatSnackBar } from "@angular/material/legacy-snack-bar";
import { SqlPlaygroundService } from "../../service/sql-playground.service";

/**
 * Updates course information in dialog
 */
@Component({
  selector: "app-new-db-dialog",
  templateUrl: "./new-db-dialog.component.html",
  styleUrls: ["./new-db-dialog.component.scss"],
})
export class NewDbDialogComponent {
  name = new UntypedFormControl("", [Validators.required]);
  isUpdateDialog = false;
  pending: boolean = false;

  constructor(
    private sqlPlaygroundService: SqlPlaygroundService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NewDbDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  createDb() {
    if (!this.isInputValid()) {
      this.pending = false;
      return;
    }

    this.pending = true;

    if (this.isUpdateDialog) {
      // update DB
    } else {
      this.sqlPlaygroundService
        .createDatabase(this.data.token.id, this.name.value)
        .subscribe(
          () => {
            this.dialogRef.close({ success: true });
          },
          (error) => {
            console.log(error);
            this.dialogRef.close({ success: false });
          }
        );
    }
  }

  isInputValid(): boolean {
    return this.name.valid;
  }

  closeDialog() {
    this.dialogRef.close({ success: false });
  }
}
