import {Component} from "@angular/core";
import {AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {User} from "../../model/User";

@Component({
  selector: 'app-create-guest-user-dialog',
  templateUrl: 'create-guest-user-dialog.component.html',
  styleUrls: ['./create-guest-user-dialog.component.scss']
})
export class CreateGuestUserDialog{

  pwRepeat: String = '';
  data: User = new class implements User {
    alias: string;
    email: string;
    globalRole: number;
    id: number;
    password: string ='';
    prename: string;
    surname: string;
    username: string;
  };

  private passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    return control.value == this.data.password ? null : {'notMatch': true};
  };

  passwordMatcher = new FormControl('', [Validators.required, this.passwordsMatchValidator]);

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<CreateGuestUserDialog>,
              private snackBar: MatSnackBar) {
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.data.password === this.pwRepeat)
      this.dialogRef.close(this.data);
    else
      this.snackBar.open('Error: ' + "Die Passwörter müssen übereinstimmen", null, {duration: 5000});
  }
}
