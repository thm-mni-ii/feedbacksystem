import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  UntypedFormControl,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MAT_DIALOG_DATA as MAT_DIALOG_DATA, MatDialogRef as MatDialogRef } from "@angular/material/dialog";

@Component({
  standalone: false,
  selector: "app-text-confirm-dialog",
  templateUrl: "./text-confirm-dialog.component.html",
  styleUrls: ["./text-confirm-dialog.component.scss"],
})
export class TextConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      message: string;
      textToRepeat: string;
      confirmText?: string;
      closeText?: string;
    },
    public dialogRef: MatDialogRef<TextConfirmDialogComponent>
  ) {}

  textMatcher = new UntypedFormControl("", [
    Validators.required,
    (control: AbstractControl): ValidationErrors | null => {
      return control.value === this.data.textToRepeat
        ? null
        : { notMatch: true };
    },
  ]);

  confirm(ok: boolean) {
    if (this.textMatcher.value === this.data.textToRepeat) {
      this.dialogRef.close(ok);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
