import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SqlPlaygroundService } from "../../service/sql-playground.service";
import { Store } from "@ngrx/store";

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
    private store: Store,
    private snackbar: MatSnackBar
  ) {}

  createDb() {
    if (!this.isInputValid()) {
      return;
    }

    this.dialogRef.close({
      success: true,
      name: this.name.value,
    });
  }

  isInputValid(): boolean {
    return this.name.valid;
  }

  closeDialog() {
    this.dialogRef.close({ success: false });
  }
}
