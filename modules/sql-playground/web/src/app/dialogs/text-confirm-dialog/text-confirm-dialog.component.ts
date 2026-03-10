import { Component, Inject } from "@angular/core";
import {
  AbstractControl,
  UntypedFormControl,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from "@angular/material/legacy-dialog";

@Component({
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

  text: string = "";

  textMatcher = new UntypedFormControl("", [
    Validators.required,
    (control: AbstractControl): ValidationErrors | null => {
      return control.value === this.data.textToRepeat
        ? null
        : { notMatch: true };
    },
  ]);

  confirm(ok: boolean) {
    if (this.text === this.data.textToRepeat) {
      this.dialogRef.close(ok);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
