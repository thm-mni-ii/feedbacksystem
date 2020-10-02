import {Component, Inject} from "@angular/core";
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {GuestUserAccount} from "../../page-components/user-management/user-management.component";

@Component({
  selector: 'app-create-guest-user-dialog',
  templateUrl: 'create-guest-user-dialog.component.html',
  styleUrls: ['./create-guest-user-dialog.component.scss']
})
export class CreateGuestUserDialog {

  private passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value == this.data.gPassword ? null : {'notMatch': true};
  };

  passwordMatcher = new FormControl('', [Validators.required, this.passwordsMatchValidator]);

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<CreateGuestUserDialog>,
              @Inject(MAT_DIALOG_DATA) public data: GuestUserAccount,
              private snackBar: MatSnackBar) {
  }

  onCancel(): void {
    this.data.gPrename = '';
    this.data.gSurname = '';
    this.data.gEmail = '';
    this.data.gPassword = '';
    this.data.gPasswordRepeat = '';
    this.data.gUsername = '';
    this.data.gRole = 16;
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.data.gPassword === this.data.gPasswordRepeat)
      this.dialogRef.close(this.data);
    else
      this.snackBar.open('Error: ' + "Die Passwörter müssen übereinstimmen", null, {duration: 5000});
  }
}
