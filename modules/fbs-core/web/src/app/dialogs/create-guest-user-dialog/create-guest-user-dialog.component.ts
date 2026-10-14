import { Component } from "@angular/core";
import {
  AbstractControl,
  UntypedFormControl,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { User } from "../../model/User";

@Component({
  selector: "app-create-guest-user-dialog",
  templateUrl: "create-guest-user-dialog.component.html",
  styleUrls: ["./create-guest-user-dialog.component.scss"],
})
export class CreateGuestUserDialogComponent {
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateGuestUserDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  pwRepeat: String = "";
  data: User = new (class implements User {
    alias: string;
    email: string;
    globalRole: string;
    id: number;
    password = "";
    prename: string;
    surname: string;
    username: string;
  })();

  passwordMatcher = new UntypedFormControl("", [
    Validators.required,
    (control: AbstractControl): ValidationErrors | null => {
      return control.value === this.data.password ? null : { notMatch: true };
    },
  ]);

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.data.password === this.pwRepeat) {
      this.dialogRef.close(this.data);
    } else {
      this.snackBar.open(
        "Error: " + "Die Passwörter müssen übereinstimmen",
        null,
        { duration: 5000 }
      );
    }
  }
}
