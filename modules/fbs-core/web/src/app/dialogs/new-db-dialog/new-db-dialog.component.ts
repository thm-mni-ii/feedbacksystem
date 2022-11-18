import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SqlPlaygroundService } from "../../service/sql-playground.service";

/**
 * Updates course information in dialog
 */
@Component({
  selector: "new-db-dialog",
  templateUrl: "./new-db-dialog.component.html",
  styleUrls: ["./new-db-dialog.component.scss"],
})
export class NewDbDialogComponent implements OnInit {
  name = new UntypedFormControl("", [Validators.required]);
  isUpdateDialog = false;

  constructor(
    private sqlPlaygroundService: SqlPlaygroundService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<NewDbDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    // this.isUpdateDialog = this.data.isUpdateDialog;
    // if (this.isUpdateDialog) {
    //   // set values for update dialog
    // }
  }

  createDb() {
    if (!this.isInputValid()) {
      return;
    }

    if (this.isUpdateDialog) {
      // update course
    } else {
      this.sqlPlaygroundService
        .createDatabase(this.data.token.id, this.name.value)
        .subscribe(
          (data) => {
            console.log(data);
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
